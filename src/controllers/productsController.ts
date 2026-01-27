import { ProductService } from '../services/productService';
import { Product } from '../models/product';

export class ProductsController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    public async listProducts(): Promise<Product[]> {
        const products = await this.productService.getAllProducts();
        return products;
    }

    public async getProductDetails(productId: string): Promise<Product | null> {
        const product = await this.productService.getProductById(productId);
        return product;
    }

    public async addProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct = await this.productService.createProduct(productData);
        return newProduct;
    }

    public async updateProduct(productId: string, productData: Partial<Product>): Promise<Product | null> {
        const updatedProduct = await this.productService.updateProduct(productId, productData);
        return updatedProduct;
    }

    public async deleteProduct(productId: string): Promise<boolean> {
        const result = await this.productService.deleteProduct(productId);
        return result;
    }
}
