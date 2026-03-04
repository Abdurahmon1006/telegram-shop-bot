import { Product, Category } from '../models/product';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');
const CATEGORIES_FILE = path.join(__dirname, '../../data/categories.json');

function ensureDataDir() {
    const dir = path.dirname(PRODUCTS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadProducts(): Product[] {
    ensureDataDir();
    if (fs.existsSync(PRODUCTS_FILE)) {
        try {
            const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }
    return [];
}

function saveProducts(products: Product[]) {
    ensureDataDir();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function loadCategories(): Category[] {
    ensureDataDir();
    if (fs.existsSync(CATEGORIES_FILE)) {
        try {
            const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }
    return [];
}

function saveCategories(categories: Category[]) {
    ensureDataDir();
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

export class ProductService {
    private static products: Product[] = loadProducts();
    private static categories: Category[] = loadCategories();

    async createProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct: Product = {
            id: (ProductService.products.length + 1).toString(),
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price || 0,
            unit: productData.unit || 'dona',
            stock: productData.stock || 0,
            categoryId: productData.categoryId || '0',
            imageUrl: productData.imageUrl,
        };
        ProductService.products.push(newProduct);
        saveProducts(ProductService.products);
        return newProduct;
    }

    async getProductById(productId: string): Promise<Product | null> {
        return ProductService.products.find(p => p.id === productId) || null;
    }

    async getAllProducts(): Promise<Product[]> {
        return ProductService.products;
    }

    async getProductsByCategory(categoryId: string): Promise<Product[]> {
        return ProductService.products.filter(p => p.categoryId === categoryId);
    }

    async getAllCategories(): Promise<Category[]> {
        return ProductService.categories;
    }

    async addCategory(name: string): Promise<Category> {
        // Check if category already exists
        const existingCategory = ProductService.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existingCategory) {
            throw new Error('Bu turkum allaqachon mavjud!');
        }
        const newCategory = { id: (ProductService.categories.length + 1).toString(), name };
        ProductService.categories.push(newCategory);
        saveCategories(ProductService.categories);
        return newCategory;
    }

    async deleteCategory(id: string): Promise<boolean> {
        const index = ProductService.categories.findIndex(c => c.id === id);
        if (index === -1) return false;
        ProductService.categories.splice(index, 1);
        saveCategories(ProductService.categories);
        return true;
    }

    async updateCategory(id: string, name: string): Promise<Category | null> {
        const index = ProductService.categories.findIndex(c => c.id === id);
        if (index === -1) return null;
        ProductService.categories[index].name = name;
        saveCategories(ProductService.categories);
        return ProductService.categories[index];
    }

    async updateProduct(productId: string, productData: Partial<Product>): Promise<Product | null> {
        const index = ProductService.products.findIndex(p => p.id === productId);
        if (index === -1) return null;
        ProductService.products[index] = { ...ProductService.products[index], ...productData };
        saveProducts(ProductService.products);
        return ProductService.products[index];
    }

    async deleteProduct(productId: string): Promise<boolean> {
        const index = ProductService.products.findIndex(p => p.id === productId);
        if (index === -1) return false;
        ProductService.products.splice(index, 1);
        saveProducts(ProductService.products);
        return true;
    }

    async addProduct(productData: Partial<Product>): Promise<{ message: string }> {
        await this.createProduct(productData);
        return { message: 'Tovar muvaffaqiyatli qo\'shildi!' };
    }

    async editProduct(productId: string, productData: Partial<Product>): Promise<{ message: string }> {
        const result = await this.updateProduct(productId, productData);
        if (result) {
            return { message: 'Tovar muvaffaqiyatli tahrirlandi!' };
        }
        return { message: 'Tovar topilmadi!' };
    }

    async updateStock(productId: string, quantity: number): Promise<{ message: string }> {
        const product = await this.getProductById(productId);
        if (product) {
            product.stock += quantity;
            saveProducts(ProductService.products);
            return { message: `Ombor yangilandi: ${product.name} - ${product.stock} ${product.unit}` };
        }
        return { message: 'Tovar topilmadi!' };
    }
}
