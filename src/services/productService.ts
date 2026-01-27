import { Product } from '../models/product';

const sampleProducts: Product[] = [
    { id: '1', name: 'Olma', description: 'Yangi olma', price: 15000, unit: 'kg', stock: 100 },
    { id: '2', name: 'Banan', description: 'Import banan', price: 25000, unit: 'kg', stock: 50 },
    { id: '3', name: 'Uzum', description: 'Mahalliy uzum', price: 20000, unit: 'kg', stock: 75 },
];

export class ProductService {
    private products: Product[] = [...sampleProducts];

    async createProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct: Product = {
            id: (this.products.length + 1).toString(),
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price || 0,
            unit: productData.unit || 'dona',
            stock: productData.stock || 0,
        };
        this.products.push(newProduct);
        return newProduct;
    }

    async getProductById(productId: string): Promise<Product | null> {
        return this.products.find(p => p.id === productId) || null;
    }

    async getAllProducts(): Promise<Product[]> {
        return this.products;
    }

    async updateProduct(productId: string, productData: Partial<Product>): Promise<Product | null> {
        const index = this.products.findIndex(p => p.id === productId);
        if (index === -1) return null;
        this.products[index] = { ...this.products[index], ...productData };
        return this.products[index];
    }

    async deleteProduct(productId: string): Promise<boolean> {
        const index = this.products.findIndex(p => p.id === productId);
        if (index === -1) return false;
        this.products.splice(index, 1);
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
            product.stock = quantity;
            return { message: `Ombor yangilandi: ${product.name} - ${quantity} ${product.unit}` };
        }
        return { message: 'Tovar topilmadi!' };
    }
}
