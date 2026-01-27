import { Telegraf } from 'telegraf';
import { mainKeyboard } from './keyboards/mainKeyboard';
import { userCommands } from './commands/userCommands';
import { adminCommands } from './commands/adminCommands';
import { config } from './config';

const bot = new Telegraf(config.BOT_TOKEN);

// Middleware to handle commands
bot.start((ctx) => ctx.reply('Welcome to the shop!', mainKeyboard));
bot.command('products', userCommands.viewProducts);
bot.command('cart', userCommands.viewCart);
bot.command('order_history', userCommands.viewOrderHistory);
bot.command('contact', userCommands.contact);
bot.command('admin', adminCommands.showAdminPanel);

// Set up webhook if needed
// bot.launch(); // Uncomment this line to start the bot

export default bot;