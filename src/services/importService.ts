import * as XLSX from 'xlsx';
import { ProductService } from './productService';
import { Product, Category } from '../models/product';

export class ImportService {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    /**
     * Import products from Excel file buffer
     * Supports both .xlsx and .xls formats
     * Expected columns: name, description, price, unit, stock, category
     */
    async importFromExcel(buffer: Buffer): Promise<{ success: boolean; message: string; imported: number; updated: number }> {
        try {
            // Read the Excel file
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            
            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON array
            const data = XLSX.utils.sheet_to_json<ProductRow>(worksheet);
            
            if (data.length === 0) {
                return { success: false, message: 'Excel faylda ma\'lumot yo\'q!', imported: 0, updated: 0 };
            }

            let imported = 0;
            let updated = 0;
            const categories = await this.productService.getAllCategories();
            const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c]));

            // Get existing products to check for updates
            const existingProducts = await this.productService.getAllProducts();
            const productMap = new Map(existingProducts.map(p => [p.name.toLowerCase(), p]));

            // First pass: create all categories that don't exist
            for (const row of data) {
                if (!row.name || !row.price) {
                    continue;
                }
                
                const categoryName = (row.category || 'Boshqa').trim();
                if (!categoryMap.has(categoryName.toLowerCase())) {
                    const newCategory = await this.productService.addCategory(categoryName);
                    categoryMap.set(categoryName.toLowerCase(), newCategory);
                }
            }

            // Second pass: add/update products
            for (const row of data) {
                if (!row.name || !row.price) {
                    continue;
                }

                const categoryName = (row.category || 'Boshqa').trim();
                const category = categoryMap.get(categoryName.toLowerCase());
                
                if (!category) {
                    continue; // Skip if category not found
                }

                const productData: Partial<Product> = {
                    name: row.name.trim(),
                    description: (row.description || '').trim(),
                    price: Number(row.price) || 0,
                    unit: (row.unit || 'dona').trim(),
                    stock: Number(row.stock) || 0,
                    categoryId: category.id,
                };

                // Check if product exists (update) or new (create)
                const productName = productData.name || '';
                const existingProduct = productMap.get(productName.toLowerCase());
                
                if (existingProduct) {
                    // Update existing product
                    await this.productService.editProduct(existingProduct.id, productData);
                    updated++;
                } else {
                    // Add new product
                    await this.productService.addProduct(productData);
                    productMap.set(productName.toLowerCase(), { ...productData, id: '' } as Product);
                    imported++;
                }
            }

            const total = imported + updated;
            return { 
                success: true, 
                message: `✅ Import muvaffaqiyatli!\n\n📥 Yangi mahsulotlar: ${imported}ta\n🔄 Yangilangan mahsulotlar: ${updated}ta\n📊 Jami: ${total}ta`,
                imported,
                updated
            };

        } catch (error) {
            console.error('Excel import error:', error);
            return { success: false, message: 'Excel fayldan o\'qishda xatolik yuz berdi!', imported: 0, updated: 0 };
        }
    }

    /**
     * Generate a sample Excel template and return as buffer
     */
    generateTemplate(): Buffer {
        const templateData = [
            { name: 'Olma', description: 'Yangi olma', price: 15000, unit: 'kg', stock: 100, category: 'Mevalar' },
            { name: 'Banan', description: 'Import banan', price: 25000, unit: 'kg', stock: 50, category: 'Mevalar' },
            { name: 'Sabzi', description: 'Taze sabzi', price: 8000, unit: 'kg', stock: 200, category: 'Sabzavotlar' },
        ];
        
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Mahsulotlar');
        
        return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }
}

// Interface for Excel row data
interface ProductRow {
    name?: string;
    description?: string;
    price?: number;
    unit?: string;
    stock?: number;
    category?: string;
}

export default ImportService;
