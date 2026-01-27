import { Markup } from 'telegraf';

export const productKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('1 dona', 'add_1'),
        Markup.button.callback('2 dona', 'add_2'),
    ],
    [
        Markup.button.callback('5 dona', 'add_5'),
        Markup.button.callback('10 dona', 'add_10'),
    ],
    [Markup.button.callback('Orqaga', 'back_to_products')],
]);

export default productKeyboard;
