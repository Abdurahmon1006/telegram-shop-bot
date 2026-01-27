import { Markup } from 'telegraf';

export const productKeyboard = (productId: string) => Markup.inlineKeyboard([
    [
        Markup.button.callback('1 dona', `add_1_${productId}`),
        Markup.button.callback('2 dona', `add_2_${productId}`),
    ],
    [
        Markup.button.callback('5 dona', `add_5_${productId}`),
        Markup.button.callback('10 dona', `add_10_${productId}`),
    ],
    [Markup.button.callback('➕ Savatchaga qo\'shish', `add_custom_${productId}`)],
    [Markup.button.callback('Orqaga', 'back_to_products')],
]);

export default productKeyboard;
