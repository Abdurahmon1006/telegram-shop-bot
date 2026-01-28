import { Context, Markup, Telegraf, session } from 'telegraf';
import { userCommands } from './commands/userCommands';
import { adminCommands } from './commands/adminCommands';
import config from './config';

interface MySession {
    state?: 'awaiting_name' | 'awaiting_phone' | 'admin_awaiting_product_name' | 'admin_awaiting_product_price';
    name?: string;
    phone?: string;
    newProduct?: Partial<{ name: string; price: number }>;
}

interface MyContext extends Context {
    session: MySession;
}

const bot = new Telegraf<MyContext>(config.BOT_TOKEN);

bot.use(session());

const mainKeyboard = Markup.keyboard([
    ['🛒 Tovarlar', '🧺 Savatcha'],
    ['📍 Bizning manzil', '📞 Aloqa'],
    ['📦 Buyurtmalar tarixi']
]).resize();

bot.start((ctx) => ctx.reply('Do\'konimizga xush kelibsiz! 🛍️', mainKeyboard));

bot.hears('🛒 Tovarlar', userCommands.viewProducts);
bot.hears('🧺 Savatcha', userCommands.viewCart);
bot.hears('📦 Buyurtmalar tarixi', userCommands.viewOrderHistory);
bot.hears('📞 Aloqa', userCommands.contact);
bot.hears('📍 Bizning manzil', async (ctx) => {
    await ctx.reply('📍 Bizning manzil:\nhttps://maps.app.goo.gl/e8YrtQDoaKWuLq6o7');
});

bot.command('admin', adminCommands.showAdminPanel);

// Handle text messages for order flow and admin product adding
bot.on('message', async (ctx, next) => {
    if (!ctx.session) ctx.session = {};

    if (ctx.session.state === 'awaiting_name' && 'text' in ctx.message) {
        ctx.session.name = ctx.message.text;
        ctx.session.state = 'awaiting_phone';
        return ctx.reply('📞 Telefon raqamingizni kiriting (namuna: +998901234567):');
    }
    if (ctx.session.state === 'awaiting_phone' && 'text' in ctx.message) {
        ctx.session.state = undefined;
        return ctx.reply('✅ Rahmat! Buyurtmangiz qabul qilindi.\nTez orada xodimlarimiz siz bilan bog\'lanadi.', mainKeyboard);
    }

    // Admin Add Product Flow
    if (ctx.session.state === 'admin_awaiting_product_name' && 'text' in ctx.message) {
        ctx.session.newProduct = { name: ctx.message.text };
        ctx.session.state = 'admin_awaiting_product_price';
        return ctx.reply('💰 Tovar narxini kiriting:');
    }
    if (ctx.session.state === 'admin_awaiting_product_price' && 'text' in ctx.message) {
        const price = parseFloat(ctx.message.text);
        if (isNaN(price)) {
            return ctx.reply('❌ Iltimos, narxni raqamda kiriting:');
        }
        const productData = {
            ...ctx.session.newProduct,
            price: price,
            description: 'Yangi mahsulot',
            unit: 'dona',
            stock: 100
        };
        await adminCommands.addProduct(ctx, productData);
        ctx.session.state = undefined;
        ctx.session.newProduct = undefined;
        return;
    }

    return next();
});

// Handle callback queries
bot.on('callback_query', async (ctx) => {
    const data = (ctx.callbackQuery as any).data;
    if (data.startsWith('add_') && !data.includes('product')) {
        const parts = data.split('_');
        const qty = parseInt(parts[1]);
        await ctx.answerCbQuery(`${qty} dona savatchaga qo'shildi!`);
    } else if (data === 'add_product') {
        ctx.session = ctx.session || {};
        ctx.session.state = 'admin_awaiting_product_name';
        await ctx.answerCbQuery();
        await ctx.reply('📝 Tovar nomini kiriting:');
    } else if (data === 'edit_product') {
        await ctx.answerCbQuery('Hali amalga oshirilmadi (Sizda tahrirlash huquqi yo\'q)');
    } else if (data === 'delete_product') {
        await ctx.answerCbQuery('Hali amalga oshirilmadi');
    } else if (data === 'view_orders') {
        await adminCommands.viewOrders(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'view_statistics') {
        await adminCommands.viewStatistics(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'checkout') {
        ctx.session = ctx.session || {};
        ctx.session.state = 'awaiting_name';
        await ctx.answerCbQuery();
        await ctx.reply('📦 Buyurtma berish uchun ismingizni kiriting:');
    } else if (data === 'back_to_products') {
        await userCommands.viewProducts(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'back_to_main') {
        await ctx.reply('Asosiy menyu:', mainKeyboard);
        await ctx.answerCbQuery();
    }
});

bot.launch().then(() => {
    console.log('Bot started successfully!');
}).catch((err) => {
    console.error('Failed to start bot:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
