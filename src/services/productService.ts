import { Product } from '../models/product';
import { db } from '../db/index';

export class ProductService {
    async createProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct = await db.product.create({ data: productData });
        return newProduct;
    }

    async getProductById(productId: string): Promise<Product | null> {
        const product = await db.product.findUnique({ where: { id: productId } });
        return product;
    }

    async getAllProducts(): Promise<Product[]> {
        const products = await db.product.findMany();
        return products;
    }

    async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
        const updatedProduct = await db.product.update({
            where: { id: productId },
            data: productData,
        });
        return updatedProduct;
    }

    async deleteProduct(productId: string): Promise<Product> {
        const deletedProduct = await db.product.delete({ where: { id: productId } });
        return deletedProduct;
    }
}