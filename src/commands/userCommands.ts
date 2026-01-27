import { Context } from 'telegraf';
import { ProductService } from '../services/productService';
import { CartService } from '../services/cartService';
import { OrderService } from '../services/orderService';
import { mainKeyboard } from '../keyboards/mainKeyboard';
import { productKeyboard } from '../keyboards/productKeyboard';

const productService = new ProductService();
const cartService = new CartService();
const orderService = new OrderService();

export const showProducts = async (ctx: Context) => {
    const products = await productService.getAllProducts();
    const productList = products.map(product => `${product.name} - ${product.price} so'm (${product.unit})`).join('\n');
    await ctx.reply(`🛒 Tovarlar:\n${productList}`, { reply_markup: productKeyboard });
};

export const addToCart = async (ctx: Context, productId: string, quantity: number) => {
    const product = await productService.getProductById(productId);
    if (product) {
        cartService.addItem(productId, quantity);
        await ctx.reply(`✅ ${quantity} ${product.unit} ${product.name} savatchaga qo'shildi!`, { reply_markup: mainKeyboard });
    } else {
        await ctx.reply('❌ Tovar topilmadi!', { reply_markup: mainKeyboard });
    }
};

export const viewCart = async (ctx: Context) => {
    const cartItems = cartService.getCartItems();
    if (cartItems.length === 0) {
        await ctx.reply('🧺 Savatchangiz bo\'sh!', { reply_markup: mainKeyboard });
        return;
    }
    const cartList = cartItems.map(item => `${item.quantity} ${item.unit} ${item.name}`).join('\n');
    const totalPrice = cartService.calculateTotal();
    await ctx.reply(`🧺 Savatchangiz:\n${cartList}\n\nUmumiy summa: ${totalPrice} so'm`, { reply_markup: mainKeyboard });
};

export const checkout = async (ctx: Context) => {
    const cartItems = cartService.getCartItems();
    if (cartItems.length === 0) {
        await ctx.reply('🧺 Savatchangiz bo\'sh, iltimos avval tovar qo\'shing!', { reply_markup: mainKeyboard });
        return;
    }
    await ctx.reply('📦 Buyurtma berish uchun ismingizni kiriting:');
    ctx.session.state = 'awaiting_name';
};

export const handleOrderName = async (ctx: Context, name: string) => {
    ctx.session.name = name;
    await ctx.reply('📞 Telefon raqamingizni kiriting (namuna: +998901234567):');
    ctx.session.state = 'awaiting_phone';
};

export const handleOrderPhone = async (ctx: Context, phone: string) => {
    const orderDetails = {
        name: ctx.session.name,
        phone: phone,
        items: cartService.getCartItems(),
    };
    await orderService.placeOrder(orderDetails);
    cartService.clearCart();
    await ctx.reply('✅ Rahmat! Buyurtmangiz qabul qilindi.\nTez orada xodimlarimiz siz bilan bog\'lanadi.', { reply_markup: mainKeyboard });
};