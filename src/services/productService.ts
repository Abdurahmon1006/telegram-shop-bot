import { Product, Category } from '../models/product';

const sampleCategories: Category[] = [];

const sampleProducts: Product[] = [];

export class ProductService {
    private static products: Product[] = [...sampleProducts];
    private static categories: Category[] = [...sampleCategories];

    async createProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct: Product = {
            id: (ProductService.products.length + 1).toString(),
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price || 0,
            unit: productData.unit || 'dona',
            stock: productData.stock || 0,
            categoryId: productData.categoryId || '0',
        };
        ProductService.products.push(newProduct);
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
        const newCategory = { id: (ProductService.categories.length + 1).toString(), name };
        ProductService.categories.push(newCategory);
        return newCategory;
    }

    async deleteCategory(id: string): Promise<boolean> {
        const index = ProductService.categories.findIndex(c => c.id === id);
        if (index === -1) return false;
        ProductService.categories.splice(index, 1);
        return true;
    }

    async updateProduct(productId: string, productData: Partial<Product>): Promise<Product | null> {
        const index = ProductService.products.findIndex(p => p.id === productId);
        if (index === -1) return null;
        ProductService.products[index] = { ...ProductService.products[index], ...productData };
        return ProductService.products[index];
    }

    async deleteProduct(productId: string): Promise<boolean> {
        const index = ProductService.products.findIndex(p => p.id === productId);
        if (index === -1) return false;
        ProductService.products.splice(index, 1);
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
            return { message: `Ombor yangilandi: ${product.name} - ${product.stock} ${product.unit}` };
        }
        return { message: 'Tovar topilmadi!' };
    }
}
