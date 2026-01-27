import { InlineKeyboardMarkup, InlineKeyboardButton } from 'telegraf';

const productKeyboard = (productId: string, productName: string) => {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '1 dona',
                        callback_data: JSON.stringify({ action: 'add_to_cart', productId, quantity: 1 }),
                    },
                    {
                        text: '2 dona',
                        callback_data: JSON.stringify({ action: 'add_to_cart', productId, quantity: 2 }),
                    },
                ],
                [
                    {
                        text: '5 dona',
                        callback_data: JSON.stringify({ action: 'add_to_cart', productId, quantity: 5 }),
                    },
                    {
                        text: '10 dona',
                        callback_data: JSON.stringify({ action: 'add_to_cart', productId, quantity: 10 }),
                    },
                ],
                [
                    {
                        text: 'Savatchaga qo‘shish',
                        callback_data: JSON.stringify({ action: 'add_to_cart', productId }),
                    },
                ],
                [
                    {
                        text: 'Orqaga',
                        callback_data: JSON.stringify({ action: 'back_to_products' }),
                    },
                ],
            ],
        },
    } as InlineKeyboardMarkup;
};

export default productKeyboard;