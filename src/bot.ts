import { Context, Markup, Telegraf, session } from 'telegraf';
import { userCommands } from './commands/userCommands';
import { adminCommands } from './commands/adminCommands';
import { ProductService } from './services/productService';
import { productKeyboard } from './keyboards/productKeyboard';
import config from './config';

const productService = new ProductService();

interface MySession {
    state?: 'awaiting_name' | 'awaiting_phone' | 'admin_awaiting_product_name' | 'admin_awaiting_product_price' | 'admin_awaiting_product_category' | 'admin_awaiting_category_name' | 'admin_awaiting_edit_product_price' | 'admin_awaiting_edit_product_name' | 'admin_awaiting_edit_product_description';
    name?: string;
    phone?: string;
    newProduct?: Partial<{ name: string; price: number; categoryId: string }>;
    editingProductId?: string;
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
        ctx.session.newProduct!.price = price;
        const categories = await productService.getAllCategories();
        const buttons = categories.map(cat => [Markup.button.callback(cat.name, `admin_set_cat_${cat.id}`)]);
        ctx.session.state = 'admin_awaiting_product_category';
        return ctx.reply('📁 Turkumni tanlang:', Markup.inlineKeyboard(buttons));
    }

    if (ctx.session.state === 'admin_awaiting_category_name' && 'text' in ctx.message) {
        await productService.addCategory(ctx.message.text);
        ctx.session.state = undefined;
        return ctx.reply('✅ Yangi turkum qo\'shildi!');
    }

    if (ctx.session.state === 'admin_awaiting_edit_product_price' && 'text' in ctx.message) {
        const price = parseFloat(ctx.message.text);
        if (isNaN(price)) {
            return ctx.reply('❌ Iltimos, narxni raqamda kiriting:');
        }
        const productId = ctx.session.editingProductId;
        if (productId) {
            await productService.updateProduct(productId, { price });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            return ctx.reply('✅ Mahsulot narxi yangilandi!', adminCommands.showAdminPanel as any);
        }
    }

    if (ctx.session.state === 'admin_awaiting_edit_product_name' && 'text' in ctx.message) {
        const productId = ctx.session.editingProductId;
        if (productId) {
            await productService.updateProduct(productId, { name: ctx.message.text });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            return ctx.reply('✅ Mahsulot nomi yangilandi!', adminCommands.showAdminPanel as any);
        }
    }

    if (ctx.session.state === 'admin_awaiting_edit_product_description' && 'text' in ctx.message) {
        const productId = ctx.session.editingProductId;
        if (productId) {
            await productService.updateProduct(productId, { description: ctx.message.text });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            return ctx.reply('✅ Mahsulot tavsifi yangilandi!', adminCommands.showAdminPanel as any);
        }
    }

    return next();
});

// Handle callback queries
bot.on('callback_query', async (ctx) => {
    const data = (ctx.callbackQuery as any).data;
    if (data.startsWith('add_') && !data.includes('product') && !data.includes('category')) {
        const parts = data.split('_');
        const qty = parseInt(parts[1]);
        await ctx.answerCbQuery(`${qty} dona savatchaga qo'shildi!`);
    } else if (data.startsWith('cat_')) {
        const catId = data.split('_')[1];
        const products = await productService.getProductsByCategory(catId);
        if (products.length === 0) {
            await ctx.reply('Ushbu turkumda mahsulotlar yo\'q.');
        } else {
            for (const product of products) {
                const caption = `${product.name}\n\n${product.description}\n\nNarxi: ${product.price} so'm\nBirlik: ${product.unit}`;
                await ctx.reply(caption, productKeyboard(product.id));
            }
        }
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_set_cat_')) {
        const catId = data.split('_')[3];
        const productData = {
            ...ctx.session.newProduct,
            categoryId: catId,
            description: 'Yangi mahsulot',
            unit: 'dona',
            stock: 100
        };
        await adminCommands.addProduct(ctx, productData);
        ctx.session.state = undefined;
        ctx.session.newProduct = undefined;
        await ctx.answerCbQuery();
    } else if (data === 'add_product') {
        ctx.session = ctx.session || {};
        ctx.session.state = 'admin_awaiting_product_name';
        await ctx.answerCbQuery();
        await ctx.reply('📝 Tovar nomini kiriting:');
    } else if (data === 'edit_product') {
        const products = await productService.getAllProducts();
        if (products.length === 0) {
            await ctx.answerCbQuery('Mahsulotlar yo\'q');
            return;
        }
        const buttons = products.map(p => [Markup.button.callback(p.name, `admin_edit_p_${p.id}`)]);
        await ctx.reply('Tahrirlash uchun mahsulotni tanlang:', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_edit_p_')) {
        const productId = data.split('_')[3];
        ctx.session = ctx.session || {};
        ctx.session.editingProductId = productId;
        const buttons = [
            [Markup.button.callback('📝 Nomini tahrirlash', `edit_field_name_${productId}`)],
            [Markup.button.callback('💰 Narxini tahrirlash', `edit_field_price_${productId}`)],
            [Markup.button.callback('📄 Tavsifini tahrirlash', `edit_field_desc_${productId}`)],
            [Markup.button.callback('📁 Turkumini tahrirlash', `edit_field_cat_${productId}`)],
            [Markup.button.callback('🔙 Bekor qilish', 'edit_product')]
        ];
        await ctx.reply('Nimani tahrirlamoqchisiz?', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data.startsWith('edit_field_')) {
        const parts = data.split('_');
        const field = parts[2];
        const productId = parts[3];
        ctx.session.editingProductId = productId;
        
        if (field === 'name') {
            ctx.session.state = 'admin_awaiting_edit_product_name';
            await ctx.reply('📝 Yangi nomni kiriting:');
        } else if (field === 'price') {
            ctx.session.state = 'admin_awaiting_edit_product_price';
            await ctx.reply('💰 Yangi narxni kiriting:');
        } else if (field === 'desc') {
            ctx.session.state = 'admin_awaiting_edit_product_description';
            await ctx.reply('📄 Yangi tavsifni kiriting:');
        } else if (field === 'cat') {
            const categories = await productService.getAllCategories();
            const buttons = categories.map(cat => [Markup.button.callback(cat.name, `admin_edit_set_cat_${cat.id}`)]);
            await ctx.reply('📁 Yangi turkumni tanlang:', Markup.inlineKeyboard(buttons));
        }
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_edit_set_cat_')) {
        const catId = data.split('_')[4];
        const productId = ctx.session.editingProductId;
        if (productId) {
            await productService.updateProduct(productId, { categoryId: catId });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            await ctx.reply('✅ Mahsulot turkumi yangilandi!', adminCommands.showAdminPanel as any);
        }
        await ctx.answerCbQuery();
    } else if (data === 'delete_product') {
        await ctx.answerCbQuery('Hali amalga oshirilmadi');
    } else if (data === 'view_orders') {
        await adminCommands.viewOrders(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'view_statistics') {
        await adminCommands.viewStatistics(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'manage_categories') {
        const buttons = [
            [Markup.button.callback('➕ Yangi turkum', 'add_category')],
            [Markup.button.callback('🔙 Orqaga', 'back_to_admin')]
        ];
        await ctx.reply('Turkumlarni boshqarish:', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data === 'add_category') {
        ctx.session = ctx.session || {};
        ctx.session.state = 'admin_awaiting_category_name';
        await ctx.reply('📝 Yangi turkum nomini kiriting:');
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
