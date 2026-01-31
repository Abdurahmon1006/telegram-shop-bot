import { Context, Markup } from 'telegraf';
import { ProductService } from '../services/productService';
import { CartService } from '../services/cartService';
import { OrderService } from '../services/orderService';
import productKeyboard from '../keyboards/productKeyboard';

const productService = new ProductService();
const cartService = new CartService();
const orderService = new OrderService();

export const userCommands = {
    viewProducts: async (ctx: Context) => {
        const categories = await productService.getAllCategories();
        const buttons = categories.map(cat => [Markup.button.callback(cat.name, `cat_${cat.id}`)]);
        await ctx.reply('Turkumni tanlang:', Markup.inlineKeyboard(buttons));
    },

    viewCart: async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) return;
        const cartItems = cartService.getCartItems(userId);
        if (cartItems.length === 0) {
            await ctx.reply('🧺 Savatchangiz bo\'sh!');
            return;
        }
        
        await ctx.reply('🧺 Savatchangiz:');
        
        for (const item of cartItems) {
            const keyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback('➖', `cart_dec_${item.productId}`),
                    Markup.button.callback(item.quantity.toString(), 'ignore'),
                    Markup.button.callback('➕', `cart_inc_${item.productId}`),
                ],
                [Markup.button.callback('❌ O\'chirish', `cart_del_${item.productId}`)]
            ]);
            await ctx.reply(`${item.productName}: ${item.price} x ${item.quantity} = ${item.price * item.quantity} so'm`, keyboard);
        }
        
        const total = cartService.calculateTotal(userId);
        await ctx.reply(`💰 Jami: ${total} so'm`, Markup.inlineKeyboard([
            [Markup.button.callback('✅ Buyurtma berish', 'checkout')],
            [Markup.button.callback('🗑 Savatni tozalash', 'clear_cart')]
        ]));
    },

    viewOrderHistory: async (ctx: Context) => {
        const userId = ctx.from?.id?.toString();
        if (!userId) return;
        const orders = orderService.getOrderHistory(userId);
        if (orders.length === 0) {
            await ctx.reply('📦 Buyurtmalar tarixi bo\'sh.');
            return;
        }
        let history = '📦 Buyurtmalar tarixi:\n\n';
        orders.forEach(order => {
            history += `Sana: ${order.date.toLocaleDateString()}\nSumma: ${order.totalPrice} so'm\nStatus: ${order.status}\n---\n`;
        });
        await ctx.reply(history);
    },

    contact: async (ctx: Context) => {
        await ctx.reply('📞 Telefon: +998901234567\n📨 Telegram: @username');
    },
};
