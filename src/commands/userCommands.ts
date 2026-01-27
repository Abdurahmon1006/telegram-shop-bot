import { Context } from 'telegraf';
import { ProductService } from '../services/productService';
import { CartService } from '../services/cartService';
import { OrderService } from '../services/orderService';
import mainKeyboard from '../keyboards/mainKeyboard';
import productKeyboard from '../keyboards/productKeyboard';

const productService = new ProductService();
const cartService = new CartService();
const orderService = new OrderService();

export const userCommands = {
    viewProducts: async (ctx: Context) => {
        const products = await productService.getAllProducts();
        const productList = products.map(product => `${product.name} - ${product.price} so'm (${product.unit})`).join('\n');
        await ctx.reply(`🛒 Tovarlar:\n${productList}`, productKeyboard);
    },

    viewCart: async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.reply('Xato yuz berdi!');
            return;
        }
        const cartItems = cartService.getCartItems(userId);
        if (cartItems.length === 0) {
            await ctx.reply('🧺 Savatchangiz bo\'sh!', mainKeyboard);
            return;
        }
        const cartList = cartItems.map(item => `${item.quantity} x ${item.productName || item.productId}`).join('\n');
        const totalPrice = cartService.calculateTotal(userId);
        await ctx.reply(`🧺 Savatchangiz:\n${cartList}\n\nUmumiy summa: ${totalPrice} so'm`, mainKeyboard);
    },

    viewOrderHistory: async (ctx: Context) => {
        const userId = ctx.from?.id?.toString();
        if (!userId) {
            await ctx.reply('Xato yuz berdi!');
            return;
        }
        const orders = orderService.getOrderHistory(userId);
        if (orders.length === 0) {
            await ctx.reply('📦 Sizda hali buyurtmalar yo\'q!', mainKeyboard);
            return;
        }
        const orderList = orders.map(order => 
            `Buyurtma #${order.id} - ${order.date.toLocaleDateString()} - ${order.totalPrice} so'm`
        ).join('\n');
        await ctx.reply(`📦 Buyurtmalar tarixi:\n${orderList}`, mainKeyboard);
    },

    contact: async (ctx: Context) => {
        await ctx.reply(
            '📞 Aloqa ma\'lumotlari:\n\n' +
            'Telefon: +998901234567\n' +
            'Telegram: @username\n' +
            'Ish vaqti: 09:00 - 18:00',
            mainKeyboard
        );
    },
};

export default userCommands;
