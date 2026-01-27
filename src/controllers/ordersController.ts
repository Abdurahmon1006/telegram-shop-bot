import { OrderService } from '../services/orderService';
import { Context } from 'telegraf';
import { Order } from '../models/order';

export class OrdersController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    public async placeOrder(ctx: Context, userId: string, orderDetails: Order): Promise<void> {
        try {
            const order = await this.orderService.createOrder(userId, orderDetails);
            await ctx.reply(`✅ Rahmat! Buyurtmangiz qabul qilindi. Tez orada xodimlarimiz siz bilan bog‘lanadi. To‘lov, yetkazib berish va qayerdan olib ketish haqida ma’lumot beriladi.`);
        } catch (error) {
            console.error('Error placing order:', error);
            await ctx.reply('❌ Buyurtma berishda xato yuz berdi. Iltimos, qayta urinib ko‘ring.');
        }
    }

    public async getOrderHistory(ctx: Context, userId: string): Promise<void> {
        try {
            const orders = await this.orderService.getOrderHistory(userId);
            if (orders.length === 0) {
                await ctx.reply('📦 Buyurtmalar tarixi: Sizda hech qanday buyurtma mavjud emas.');
                return;
            }

            let message = '📦 Buyurtmalar tarixi:\n';
            orders.forEach(order => {
                message += `Sana: ${order.date}\nTovarlar: ${order.items.map(item => item.name).join(', ')}\nMiqdor: ${order.items.map(item => item.quantity).join(', ')}\nUmumiy narx: ${order.totalPrice} so‘m\n\n`;
            });
            await ctx.reply(message);
        } catch (error) {
            console.error('Error retrieving order history:', error);
            await ctx.reply('❌ Buyurtmalar tarixini olishda xato yuz berdi. Iltimos, qayta urinib ko‘ring.');
        }
    }
}