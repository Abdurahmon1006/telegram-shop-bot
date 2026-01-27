import { ProductService } from '../services/productService';
import { Product } from '../models/product';

export class ProductsController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    public async listProducts() {
        const products: Product[] = await this.productService.getAllProducts();
        return products;
    }

    public async getProductDetails(productId: string) {
        const product: Product | null = await this.productService.getProductById(productId);
        return product;
    }

    public async addProduct(productData: Product) {
        const newProduct: Product = await this.productService.createProduct(productData);
        return newProduct;
    }

    public async updateProduct(productId: string, productData: Partial<Product>) {
        const updatedProduct: Product | null = await this.productService.updateProduct(productId, productData);
        return updatedProduct;
    }

    public async deleteProduct(productId: string) {
        const result: boolean = await this.productService.deleteProduct(productId);
        return result;
    }
}