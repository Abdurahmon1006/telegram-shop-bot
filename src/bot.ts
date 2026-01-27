import { Context, Markup, Telegraf, session } from 'telegraf';
import { userCommands } from './commands/userCommands';
import { adminCommands } from './commands/adminCommands';
import config from './config';

interface MySession {
    state?: 'awaiting_name' | 'awaiting_phone';
    name?: string;
    phone?: string;
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

bot.start((ctx) => ctx.reply('Xush kelibsiz! Do\'konimizga xush kelibsiz! 🛍️', mainKeyboard));

bot.hears('🛒 Tovarlar', userCommands.viewProducts);
bot.hears('🧺 Savatcha', userCommands.viewCart);
bot.hears('📦 Buyurtmalar tarixi', userCommands.viewOrderHistory);
bot.hears('📞 Aloqa', userCommands.contact);
bot.hears('📍 Bizning manzil', async (ctx) => {
    await ctx.reply('📍 Bizning manzil:\nhttps://maps.app.goo.gl/e8YrtQDoaKWuLq6o7');
});

bot.command('admin', adminCommands.showAdminPanel);

// Handle text messages for order flow
bot.on('message', async (ctx, next) => {
    if (ctx.session?.state === 'awaiting_name' && 'text' in ctx.message) {
        ctx.session.name = ctx.message.text;
        ctx.session.state = 'awaiting_phone';
        return ctx.reply('📞 Telefon raqamingizni kiriting (namuna: +998901234567):');
    }
    if (ctx.session?.state === 'awaiting_phone' && 'text' in ctx.message) {
        const phone = ctx.message.text;
        // Mock order completion
        ctx.session.state = undefined;
        return ctx.reply('✅ Rahmat! Buyurtmangiz qabul qilindi.\nTez orada xodimlarimiz siz bilan bog\'lanadi.\nTo\'lov, yetkazib berish va qayerdan olib ketish haqida ma\'lumot beriladi.', mainKeyboard);
    }
    return next();
});

// Handle callback queries
bot.on('callback_query', async (ctx) => {
    const data = (ctx.callbackQuery as any).data;
    if (data.startsWith('add_')) {
        const parts = data.split('_');
        const qty = parseInt(parts[1]);
        await ctx.answerCbQuery(`${qty} dona savatchaga qo'shildi!`);
    } else if (data === 'checkout') {
        ctx.session = ctx.session || {};
        ctx.session.state = 'awaiting_name';
        await ctx.answerCbQuery();
        await ctx.reply('📦 Buyurtma berish uchun ismingizni kiriting:');
    } else if (data === 'back_to_products') {
        await userCommands.viewProducts(ctx);
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
