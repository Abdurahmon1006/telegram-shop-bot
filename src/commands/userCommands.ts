import { Context, Markup } from 'telegraf';
import { ProductService } from '../services/productService';
import { CartService } from '../services/cartService';
import { OrderService } from '../services/orderService';
import { AdminService } from '../services/adminService';
import productKeyboard from '../keyboards/productKeyboard';

const productService = new ProductService();
const cartService = new CartService();
const orderService = new OrderService();
const adminService = new AdminService();

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
        
        let total = 0;
        for (const item of cartItems) {
            // Get fresh price from product
            const product = await productService.getProductById(item.productId);
            const currentPrice = product ? product.price : (item.price || 0);
            const unit = product ? product.unit : (item.unit || 'dona');
            const itemTotal = currentPrice * item.quantity;
            total += itemTotal;
            
            const keyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback('➖', `cart_dec_${item.productId}`),
                    Markup.button.callback(`${item.quantity} ${unit}`, 'ignore'),
                    Markup.button.callback('➕', `cart_inc_${item.productId}`),
                ],
                [Markup.button.callback('❌ O\'chirish', `cart_del_${item.productId}`)]
            ]);
            await ctx.reply(`${item.productName}: ${currentPrice} so'm x ${item.quantity} ${unit} = ${itemTotal} so'm`, keyboard);
        }
        
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
        const contactInfo = adminService.getContactInfo() as any;
        await ctx.reply(`📞 Telefon: ${contactInfo.phone}\n👤 Telegram: ${contactInfo.username}\n📍 Manzil: ${contactInfo.address || 'Kiritilmagan'}`);
    },
};
