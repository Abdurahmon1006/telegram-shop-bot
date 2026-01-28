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
        let cartList = '🧺 Savatchangiz:\n\n';
        cartItems.forEach(item => {
            cartList += `${item.productName || item.productId}: ${item.quantity} dona\n`;
        });
        const total = cartService.calculateTotal(userId);
        cartList += `\nUmumiy summa: ${total} so'm`;
        
        await ctx.reply(cartList, Markup.inlineKeyboard([
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
