import { Context } from 'telegraf';
import { AdminService } from '../services/adminService';
import { ProductService } from '../services/productService';
import { CartService } from '../services/cartService';
import { OrderService } from '../services/orderService';

const adminService = new AdminService();
const productService = new ProductService();
const cartService = new CartService();
const orderService = new OrderService();

export const addProduct = async (ctx: Context, productData: any) => {
    const result = await productService.addProduct(productData);
    ctx.reply(result.message);
};

export const editProduct = async (ctx: Context, productId: string, updatedData: any) => {
    const result = await productService.editProduct(productId, updatedData);
    ctx.reply(result.message);
};

export const deleteProduct = async (ctx: Context, productId: string) => {
    const result = await productService.deleteProduct(productId);
    ctx.reply(result.message);
};

export const viewOrders = async (ctx: Context) => {
    const orders = await orderService.getAllOrders();
    ctx.reply(orders);
};

export const manageStock = async (ctx: Context, productId: string, quantity: number) => {
    const result = await productService.updateStock(productId, quantity);
    ctx.reply(result.message);
};

export const viewStatistics = async (ctx: Context) => {
    const stats = await adminService.getStatistics();
    ctx.reply(stats);
};