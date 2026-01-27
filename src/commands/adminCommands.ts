import { Context } from 'telegraf';
import { AdminService } from '../services/adminService';
import { ProductService } from '../services/productService';
import { OrderService } from '../services/orderService';
import adminKeyboard from '../keyboards/adminKeyboard';
import mainKeyboard from '../keyboards/mainKeyboard';

const adminService = new AdminService();
const productService = new ProductService();
const orderService = new OrderService();

export const adminCommands = {
    showAdminPanel: async (ctx: Context) => {
        await ctx.reply('👨‍💼 Admin panel:', adminKeyboard);
    },

    addProduct: async (ctx: Context, productData: any) => {
        const result = await productService.addProduct(productData);
        await ctx.reply(result.message);
    },

    editProduct: async (ctx: Context, productId: string, updatedData: any) => {
        const result = await productService.editProduct(productId, updatedData);
        await ctx.reply(result.message);
    },

    deleteProduct: async (ctx: Context, productId: string) => {
        const deleted = await productService.deleteProduct(productId);
        if (deleted) {
            await ctx.reply('Tovar o\'chirildi!');
        } else {
            await ctx.reply('Tovar topilmadi!');
        }
    },

    viewOrders: async (ctx: Context) => {
        const orders = orderService.getAllOrders();
        if (orders.length === 0) {
            await ctx.reply('📦 Hozircha buyurtmalar yo\'q!');
            return;
        }
        const orderList = orders.map(order => 
            `#${order.id} - ${order.customerName || 'Noma\'lum'} - ${order.totalPrice} so'm - ${order.status}`
        ).join('\n');
        await ctx.reply(`📦 Barcha buyurtmalar:\n${orderList}`);
    },

    manageStock: async (ctx: Context, productId: string, quantity: number) => {
        const result = await productService.updateStock(productId, quantity);
        await ctx.reply(result.message);
    },

    viewStatistics: async (ctx: Context) => {
        const stats = await adminService.getStatistics();
        await ctx.reply(stats);
    },
};

export default adminCommands;
