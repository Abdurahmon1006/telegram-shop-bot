import { OrderService } from '../services/orderService';
import { Context } from 'telegraf';
import { Order } from '../models/order';

export class OrdersController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    public async placeOrder(ctx: Context, userId: string, orderDetails: Partial<Order>): Promise<void> {
        try {
            const order = await this.orderService.createOrder(userId, orderDetails);
            await ctx.reply(`✅ Rahmat! Buyurtmangiz qabul qilindi. Tez orada xodimlarimiz siz bilan bog'lanadi.`);
        } catch (error) {
            console.error('Error placing order:', error);
            await ctx.reply('❌ Buyurtma berishda xato yuz berdi. Iltimos, qayta urinib ko\'ring.');
        }
    }

    public async getOrderHistory(ctx: Context, userId: string): Promise<void> {
        try {
            const orders = this.orderService.getOrderHistory(userId);
            if (orders.length === 0) {
                await ctx.reply('📦 Buyurtmalar tarixi: Sizda hech qanday buyurtma mavjud emas.');
                return;
            }

            let message = '📦 Buyurtmalar tarixi:\n';
            orders.forEach(order => {
                const itemNames = order.items.map(item => item.productName || item.productId).join(', ');
                message += `Sana: ${order.date.toLocaleDateString()}\nTovarlar: ${itemNames}\nUmumiy narx: ${order.totalPrice} so'm\n\n`;
            });
            await ctx.reply(message);
        } catch (error) {
            console.error('Error retrieving order history:', error);
            await ctx.reply('❌ Buyurtmalar tarixini olishda xato yuz berdi. Iltimos, qayta urinib ko\'ring.');
        }
    }
}
