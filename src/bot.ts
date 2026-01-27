import { Telegraf } from 'telegraf';
import mainKeyboard from './keyboards/mainKeyboard';
import { userCommands } from './commands/userCommands';
import { adminCommands } from './commands/adminCommands';
import config from './config';

const bot = new Telegraf(config.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Xush kelibsiz! Do\'konimizga xush kelibsiz! 🛍️', mainKeyboard));
bot.command('products', userCommands.viewProducts);
bot.command('cart', userCommands.viewCart);
bot.command('order_history', userCommands.viewOrderHistory);
bot.command('contact', userCommands.contact);
bot.command('admin', adminCommands.showAdminPanel);

bot.hears('🛒 Tovarlar', userCommands.viewProducts);
bot.hears('🧺 Savatcha', userCommands.viewCart);
bot.hears('📦 Buyurtmalar tarixi', userCommands.viewOrderHistory);
bot.hears('📞 Aloqa', userCommands.contact);

bot.launch().then(() => {
    console.log('Bot started successfully!');
}).catch((err) => {
    console.error('Failed to start bot:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
