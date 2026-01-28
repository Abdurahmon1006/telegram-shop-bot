import { Markup } from 'telegraf';

export const adminKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('➕ Tovar qo\'shish', 'add_product'),
        Markup.button.callback('✏️ Tovar tahrirlash', 'edit_product'),
    ],
    [
        Markup.button.callback('❌ Tovar o\'chirish', 'delete_product'),
        Markup.button.callback('📦 Buyurtmalar', 'view_orders'),
    ],
    [
        Markup.button.callback('📁 Turkumlar', 'manage_categories'),
        Markup.button.callback('📊 Statistika', 'view_statistics'),
    ],
    [
        Markup.button.callback('🔙 Orqaga', 'back_to_main'),
    ],
]);

export default adminKeyboard;
