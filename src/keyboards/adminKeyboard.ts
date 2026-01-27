import { InlineKeyboardMarkup, InlineKeyboardButton } from 'telegraf';

const adminKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
        [
            { text: '➕ Tovar qo‘shish', callback_data: 'add_product' },
            { text: '✏️ Tovar tahrirlash', callback_data: 'edit_product' },
            { text: '❌ Tovar o‘chirish', callback_data: 'delete_product' },
        ],
        [
            { text: '📦 Buyurtmalar', callback_data: 'view_orders' },
            { text: '📊 Statistika', callback_data: 'view_statistics' },
        ],
        [
            { text: '🔙 Orqaga', callback_data: 'back_to_main' },
        ],
    ],
};

export default adminKeyboard;