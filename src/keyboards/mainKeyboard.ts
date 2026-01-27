import { InlineKeyboardMarkup, InlineKeyboardButton } from 'telegraf';

const mainKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
        [
            { text: '🛒 Tovarlar', callback_data: 'view_products' },
            { text: '🧺 Savatcha', callback_data: 'view_cart' }
        ],
        [
            { text: '📍 Bizning manzil', callback_data: 'view_address' },
            { text: '📞 Aloqa', callback_data: 'view_contact' }
        ],
        [
            { text: '📦 Buyurtmalar tarixi', callback_data: 'view_orders' }
        ]
    ]
};

export default mainKeyboard;