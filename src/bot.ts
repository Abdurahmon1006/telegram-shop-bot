import { Context, Markup, Telegraf, session } from 'telegraf';
import { userCommands } from './commands/userCommands';
import { adminCommands } from './commands/adminCommands';
import { ProductService } from './services/productService';
import { CartService } from './services/cartService';
import { OrderService } from './services/orderService';
import { AdminService } from './services/adminService';
import { productKeyboard } from './keyboards/productKeyboard';
import config from './config';

const productService = new ProductService();
const adminService = new AdminService();
const cartService = new CartService();
const orderService = new OrderService();

interface MySession {
    state?: string;
    name?: string;
    phone?: string;
    newProduct?: Partial<{ name: string; price: number; categoryId: string; description: string; stock: number; imageUrl?: string; unit?: string }>;
    editingProductId?: string;
    editingCategoryId?: string;
    isAdminAuthenticated?: boolean;
}

interface MyContext extends Context {
    session: MySession;
}

const bot = new Telegraf<MyContext>(config.BOT_TOKEN);

bot.use(session());

const mainKeyboard = Markup.keyboard([
    ['🛒 Mahsulotlar', '🧺 Savatcha'],
    ['📍 Bizning manzil', '📞 Aloqa'],
    ['📦 Buyurtmalar tarixi']
]).resize();

bot.start((ctx) => ctx.reply('Do\'konimizga xush kelibsiz! 🛍️', mainKeyboard));

bot.hears('🛒 Mahsulotlar', userCommands.viewProducts);
bot.hears('🛒 Tovarlar', userCommands.viewProducts);
bot.hears('🧺 Savatcha', userCommands.viewCart);
bot.hears('📦 Buyurtmalar tarixi', userCommands.viewOrderHistory);
bot.hears('📞 Aloqa', userCommands.contact);
bot.hears('📍 Bizning manzil', async (ctx) => {
    const contactInfo = adminService.getContactInfo() as any;
    await ctx.reply(`📍 Bizning manzil:\n${contactInfo.address || 'Manzil kiritilmagan'}`);
});

bot.command('admin', async (ctx) => {
    if (!ctx.session) ctx.session = {} as MySession;
    ctx.session.state = 'admin_awaiting_password';
    await ctx.reply('🔐 Admin parolini kiriting:');
});

bot.command('panel', async (ctx) => {
    if (!ctx.session) ctx.session = {} as MySession;
    ctx.session.state = 'admin_awaiting_password';
    await ctx.reply('🔐 Admin parolini kiriting:');
});

bot.command('login', async (ctx) => {
    if (!ctx.session) ctx.session = {} as MySession;
    ctx.session.state = 'admin_awaiting_password';
    await ctx.reply('🔐 Admin parolini kiriting:');
});

// Handle text messages for order flow and admin product adding
bot.on('message', async (ctx, next) => {
    if (!ctx.session) ctx.session = {} as MySession;

    // Admin password check
    if (ctx.session.state === 'admin_awaiting_password' && 'text' in ctx.message) {
        const password = ctx.message.text;
        if (adminService.checkAdminPassword(password)) {
            ctx.session.isAdminAuthenticated = true;
            ctx.session.state = undefined;
            await adminCommands.showAdminPanel(ctx);
        } else {
            ctx.session.state = undefined;
            await ctx.reply('❌ Noto\'g\'ri parol!', mainKeyboard);
        }
        return;
    }

    if (ctx.session.state === 'awaiting_name' && 'text' in ctx.message) {
        if (!adminService.isWorkDay()) {
            const workDays = adminService.getWorkDays();
            const weekDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
            const workDaysText = workDays.map(d => weekDays[d]).join(', ');
            return ctx.reply(`❌ Kechirasiz, bugun bizda dam olish kuni.\n\n📅 Ish kunlari: ${workDaysText}\n\nBuyurtmalarni ish kunlari qabul qilamiz.`, mainKeyboard);
        }
        
        // Validate name - only letters allowed
        const name = ctx.message.text.trim();
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
        if (!nameRegex.test(name)) {
            return ctx.reply('❌ Iltimos, faqat harflardan foydalaning:');
        }
        
        ctx.session.name = name;
        ctx.session.state = 'awaiting_phone';
        return ctx.reply('📞 Telefon raqamingizni kiriting (namuna: +998901234567):');
    }
    if (ctx.session.state === 'awaiting_phone' && 'text' in ctx.message) {
        const phoneNumber = ctx.message.text.trim();
        
        // Validate phone - only numbers allowed (with + prefix)
        const phoneRegex = /^\+?[0-9]+$/;
        if (!phoneRegex.test(phoneNumber)) {
            return ctx.reply('❌ Iltimos, faqat raqamlardan foydalaning:');
        }
        
        const userId = ctx.from!.id.toString();
        const customerName = ctx.session.name;
        const cartItems = cartService.getCartItems(Number(userId));
        
        // Get fresh prices from products and calculate total
        let totalPrice = 0;
        for (const item of cartItems) {
            const product = await productService.getProductById(item.productId);
            if (product) {
                totalPrice += product.price * item.quantity;
            }
        }
        
        orderService.placeOrder(userId, cartItems, totalPrice, customerName, phoneNumber);
        cartService.clearCart(Number(userId));
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
        ctx.session.state = 'admin_awaiting_product_unit';
        return ctx.reply('📏 Tovar birligini kiriting (masalan: dona, kg, litr, qop):');
    }

    if (ctx.session.state === 'admin_awaiting_product_unit' && 'text' in ctx.message) {
        ctx.session.newProduct = ctx.session.newProduct || {};
        (ctx.session.newProduct as any).unit = ctx.message.text;
        ctx.session.state = 'admin_awaiting_product_description';
        return ctx.reply('📄 Tovar tavsifini kiriting:');
    }

    if (ctx.session.state === 'admin_awaiting_product_description' && 'text' in ctx.message) {
        ctx.session.newProduct = ctx.session.newProduct || {};
        (ctx.session.newProduct as any).description = ctx.message.text;
        ctx.session.state = 'admin_awaiting_product_stock';
        return ctx.reply('📦 Ombor dagi sonini kiriting:');
    }

    if (ctx.session.state === 'admin_awaiting_product_stock' && 'text' in ctx.message) {
        const stock = parseInt(ctx.message.text);
        if (isNaN(stock)) {
            return ctx.reply('❌ Iltimos, sonini raqamda kiriting:');
        }
        (ctx.session.newProduct as any).stock = stock;
        ctx.session.state = 'admin_awaiting_product_image';
        return ctx.reply('🖼 Tovar rasmini yuboring (yoki /skip buyrug\'ini yuboring):');
    }

    if (ctx.session.state === 'admin_awaiting_product_image') {
        if ('photo' in ctx.message) {
            const photo = ctx.message.photo[ctx.message.photo.length - 1];
            if (ctx.session.newProduct) {
                ctx.session.newProduct.imageUrl = photo.file_id;
            }
        } else if ('text' in ctx.message && ctx.message.text === '/skip') {
            // Skip image
        } else {
            return ctx.reply('❌ Iltimos, rasm yuboring yoki /skip buyrug\'ini ishlating:');
        }
        
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
            return ctx.reply('✅ Mahsulot narxi yangilandi!', Markup.keyboard([]));
        }
    }

    if (ctx.session.state === 'admin_awaiting_edit_product_name' && 'text' in ctx.message) {
        const productId = ctx.session.editingProductId;
        if (productId) {
            await productService.updateProduct(productId, { name: ctx.message.text });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            return ctx.reply('✅ Mahsulot nomi yangilandi!', Markup.keyboard([]));
        }
    }

    if (ctx.session.state === 'admin_awaiting_edit_product_description' && 'text' in ctx.message) {
        const productId = ctx.session.editingProductId;
        if (productId) {
            await productService.updateProduct(productId, { description: ctx.message.text });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            return ctx.reply('✅ Mahsulot tavsifi yangilandi!', Markup.keyboard([]));
        }
    }

    if (ctx.session.state === 'admin_awaiting_edit_product_unit' && 'text' in ctx.message) {
        const productId = ctx.session.editingProductId;
        if (productId) {
            await productService.updateProduct(productId, { unit: ctx.message.text });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            return ctx.reply('✅ Mahsulot birligi yangilandi!', Markup.keyboard([]));
        }
    }

    if (ctx.session.state === 'admin_awaiting_edit_product_image' && 'photo' in ctx.message) {
        const productId = ctx.session.editingProductId;
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        if (productId) {
            await productService.updateProduct(productId, { imageUrl: photo.file_id });
            ctx.session.state = undefined;
            ctx.session.editingProductId = undefined;
            return ctx.reply('✅ Mahsulot rasmi yangilandi!', Markup.keyboard([]));
        }
    }

    if (ctx.session.state === 'admin_awaiting_address' && 'text' in ctx.message) {
        const contactInfo = adminService.getContactInfo() as any;
        adminService.updateContactInfo({ phone: contactInfo.phone, username: ctx.message.text });
        ctx.session.state = undefined;
        return ctx.reply('✅ Username yangilandi!', Markup.keyboard([]));
    }

    if (ctx.session.state === 'admin_awaiting_contact' && 'text' in ctx.message) {
        const contactInfo = adminService.getContactInfo() as any;
        adminService.updateContactInfo({ phone: ctx.message.text, username: contactInfo.username });
        ctx.session.state = undefined;
        return ctx.reply('✅ Aloqa ma\'lumotlari yangilandi!', Markup.keyboard([]));
    }

    if (ctx.session.state === 'admin_awaiting_shop_address' && 'text' in ctx.message) {
        adminService.updateContactInfo({ address: ctx.message.text });
        ctx.session.state = undefined;
        return ctx.reply('✅ Manzil yangilandi!', Markup.keyboard([]));
    }

    if (ctx.session.state === 'admin_awaiting_edit_category_name' && 'text' in ctx.message) {
        const catId = ctx.session.editingCategoryId;
        if (catId) {
            await productService.updateCategory(catId, ctx.message.text);
            ctx.session.state = undefined;
            ctx.session.editingCategoryId = undefined;
            return ctx.reply('✅ Turkum nomi yangilandi!', Markup.keyboard([]));
        }
    }

    if ('text' in ctx.message && !ctx.session.state && !ctx.message.text.startsWith('/')) {
        const text = ctx.message.text;
        const mainButtons = ['🛒 Mahsulotlar', '🧺 Savatcha', '📍 Bizning manzil', '📞 Aloqa', '📦 Buyurtmalar tarixi'];
        if (!mainButtons.includes(text)) {
            return ctx.reply('Asosiy menyu:', mainKeyboard);
        }
    }

    return next();
});

bot.on('callback_query', async (ctx) => {
    if (!ctx.session) ctx.session = {} as MySession;
    const data = (ctx.callbackQuery as any).data;
    if (data.startsWith('add_') && !data.includes('product') && !data.includes('category')) {
        const parts = data.split('_');
        let qty = parseInt(parts[1]);
        if (isNaN(qty)) qty = 1;
        const productId = parts[2];
        const product = await productService.getProductById(productId);
        if (product) {
            const currentCart = cartService.getCartItems(ctx.from!.id);
            const existingItem = currentCart.find(item => item.productId === productId);
            const currentQty = existingItem ? existingItem.quantity : 0;
            
            // Check stock limit
            if (currentQty + qty > product.stock) {
                const available = product.stock - currentQty;
                if (available <= 0) {
                    await ctx.answerCbQuery(`❌ Omborda yetarli mahsulot yoq!`);
                    return;
                }
                await ctx.answerCbQuery(`❌ Faqat ${available} ${product.unit} qoshish mumkin!`);
                return;
            }
            
            const cartItem = {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: qty,
                unit: product.unit
            };
            const userId = ctx.from!.id;
            cartService.addItem(userId, cartItem);
            await ctx.answerCbQuery(`✅ ${product.name} savatchaga qoshildi!`);
            await ctx.reply(`✅ ${product.name} (${qty} ${product.unit}) savatchaga qoshildi!`);
        }
    } else if (data.startsWith('cart_inc_')) {
        const productId = data.split('_')[2];
        const product = await productService.getProductById(productId);
        const currentCart = cartService.getCartItems(ctx.from!.id);
        const existingItem = currentCart.find(item => item.productId === productId);
        
        if (product && existingItem && existingItem.quantity >= product.stock) {
            await ctx.answerCbQuery(`❌ Omborda yetarli mahsulot yoq!`);
            return;
        }
        
        cartService.updateItemQuantity(ctx.from!.id, productId, 1);
        await userCommands.viewCart(ctx);
        await ctx.answerCbQuery();
    } else if (data.startsWith('cart_dec_')) {
        const productId = data.split('_')[2];
        cartService.updateItemQuantity(ctx.from!.id, productId, -1);
        await userCommands.viewCart(ctx);
        await ctx.answerCbQuery();
    } else if (data.startsWith('cart_del_')) {
        const productId = data.split('_')[2];
        cartService.removeItem(ctx.from!.id, productId);
        await userCommands.viewCart(ctx);
        await ctx.answerCbQuery('Ochirildi');
    } else if (data === 'clear_cart') {
        cartService.clearCart(ctx.from!.id);
        await ctx.reply('Savat tozalandi');
        await ctx.answerCbQuery();
    } else if (data.startsWith('cat_')) {
        const catId = data.split('_')[1];
        const products = await productService.getProductsByCategory(catId);
        if (products.length === 0) {
            await ctx.reply('Ushbu turkumda mahsulotlar yoq.');
        } else {
            for (const product of products) {
                const stockStatus = product.stock > 0 ? `✅ Ombor: ${product.stock} ${product.unit}` : '❌ Sotuvda yoq';
                const caption = `${product.name}\n\n${product.description}\n\nNarxi: ${product.price} som\nBirlik: ${product.unit}\n${stockStatus}`;
                
                if (product.imageUrl) {
                    await ctx.replyWithPhoto(product.imageUrl, {
                        caption,
                        ...productKeyboard(product.id)
                    });
                } else {
                    if (product.stock > 0) {
                        await ctx.reply(caption, productKeyboard(product.id));
                    } else {
                        await ctx.reply(caption);
                    }
                }
            }
        }
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_set_cat_')) {
        const catId = data.split('_')[3];
        const productData = {
            ...ctx.session.newProduct,
            categoryId: catId,
        };
        await adminCommands.addProduct(ctx, productData);
        ctx.session.state = undefined;
        ctx.session.newProduct = undefined;
        await ctx.answerCbQuery();
    } else if (data === 'add_product') {
        if (!ctx.session) ctx.session = {} as MySession;
        ctx.session.state = 'admin_awaiting_product_name';
        await ctx.answerCbQuery();
        await ctx.reply('📝 Tovar nomini kiriting:');
    } else if (data === 'edit_product') {
        const products = await productService.getAllProducts();
        if (products.length === 0) {
            await ctx.answerCbQuery('Mahsulotlar yoq');
            return;
        }
        const buttons = products.map(p => [Markup.button.callback(p.name, `admin_edit_p_${p.id}`)]);
        await ctx.reply('Tahrirlash uchun mahsulotni tanlang:', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_edit_p_')) {
        const productId = data.split('_')[3];
        ctx.session = ctx.session || {} as MySession;
        ctx.session.editingProductId = productId;
        const buttons = [
            [Markup.button.callback('📝 Nomini tahrirlash', `edit_field_name_${productId}`)],
            [Markup.button.callback('💰 Narxini tahrirlash', `edit_field_price_${productId}`)],
            [Markup.button.callback('📄 Tavsifini tahrirlash', `edit_field_desc_${productId}`)],
            [Markup.button.callback('📏 Birligini tahrirlash', `edit_field_unit_${productId}`)],
            [Markup.button.callback('🖼 Rasmni tahrirlash', `edit_field_image_${productId}`)],
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
        } else if (field === 'unit') {
            ctx.session.state = 'admin_awaiting_edit_product_unit';
            await ctx.reply('📏 Yangi olchov birligini kiriting (masalan: kg, dona, litr, qop):');
        } else if (field === 'image') {
            ctx.session.state = 'admin_awaiting_edit_product_image';
            await ctx.reply('🖼 Yangi rasmni yuboring:');
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
            await ctx.reply('✅ Mahsulot turkumi yangilandi!', Markup.keyboard([]));
        }
        await ctx.answerCbQuery();
    } else if (data === 'delete_product') {
        const products = await productService.getAllProducts();
        if (products.length === 0) {
            await ctx.answerCbQuery('Mahsulotlar yoq');
            return;
        }
        const buttons = products.map(p => [Markup.button.callback(p.name, `admin_del_p_${p.id}`)]);
        buttons.push([Markup.button.callback('🔙 Bekor qilish', 'cancel_delete')]);
        await ctx.reply('Ochirish uchun mahsulotni tanlang:', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_del_p_')) {
        const productId = data.split('_')[3];
        const success = await productService.deleteProduct(productId);
        if (success) {
            await ctx.reply('✅ Mahsulot ochirildi!');
        } else {
            await ctx.reply('❌ Mahsulot topilmadi!');
        }
        await adminCommands.showAdminPanel(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'cancel_delete') {
        await adminCommands.showAdminPanel(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'view_orders') {
        const orders = orderService.getAllOrders();
        if (orders.length === 0) {
            await ctx.reply('📦 Hozircha buyurtmalar yoq!');
            await ctx.answerCbQuery();
            return;
        }
        
        for (const order of orders) {
            const statusButtons = [
                [Markup.button.callback('📞 Aloqaga chiqish', `order_contact_${order.id}`)],
                [Markup.button.callback('✅ Bajarildi', `order_complete_${order.id}`)],
                [Markup.button.callback('❌ Bekor qilish', `order_cancel_${order.id}`)]
            ];
            const itemsList = order.items.map(item => `- ${item.productName}: ${item.quantity} ${item.unit}`).join('\n');
            await ctx.reply(
                `📦 Buyurtma #${order.id}\n` +
                `Mijoz: ${order.customerName || 'Nomalsum'}\n` +
                `Telefon: ${order.customerPhone || 'Nomalsum'}\n` +
                `Summa: ${order.totalPrice} som\n` +
                `Status: ${order.status}\n\n` +
                `Mahsulotlar:\n${itemsList}`,
                Markup.inlineKeyboard(statusButtons)
            );
        }
        await ctx.answerCbQuery();
    } else if (data.startsWith('order_contact_')) {
        const orderId = data.split('_')[2];
        const order = orderService.getAllOrders().find(o => o.id === orderId);
        if (order) {
            await ctx.reply(`📞 Mijoz bilan boglanish uchun: ${order.customerPhone || 'Raqam yoq'}`);
        }
        await ctx.answerCbQuery();
    } else if (data.startsWith('order_complete_')) {
        const orderId = data.split('_')[2];
        orderService.updateOrderStatus(orderId, 'completed');
        await ctx.reply('✅ Buyurtma bajarildi deb belgilandi!');
        await ctx.answerCbQuery();
    } else if (data.startsWith('order_cancel_')) {
        const orderId = data.split('_')[2];
        orderService.updateOrderStatus(orderId, 'canceled');
        await ctx.reply('❌ Buyurtma bekor qilindi!');
        await ctx.answerCbQuery();
    } else if (data === 'view_statistics') {
        await adminCommands.viewStatistics(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'manage_categories') {
        if (!ctx.session) ctx.session = {} as MySession;
        const buttons = [
            [Markup.button.callback('➕ Yangi turkum', 'add_category')],
            [Markup.button.callback('✏️ Tahrirlash', 'edit_category')],
            [Markup.button.callback('❌ Ochirish', 'delete_category')],
            [Markup.button.callback('🔙 Orqaga', 'back_to_admin')]
        ];
        await ctx.reply('Turkumlarni boshqarish:', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data === 'edit_category') {
        const categories = await productService.getAllCategories();
        const buttons = categories.map(cat => [Markup.button.callback(cat.name, `admin_edit_cat_${cat.id}`)]);
        await ctx.reply('Tahrirlash uchun turkumni tanlang:', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_edit_cat_')) {
        const catId = data.split('_')[3];
        ctx.session.editingCategoryId = catId;
        ctx.session.state = 'admin_awaiting_edit_category_name';
        await ctx.reply('📝 Yangi nomni kiriting:');
        await ctx.answerCbQuery();
    } else if (data === 'delete_category') {
        const categories = await productService.getAllCategories();
        const buttons = categories.map(cat => [Markup.button.callback(cat.name, `admin_del_cat_${cat.id}`)]);
        await ctx.reply('Ochirish uchun turkumni tanlang:', Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data.startsWith('admin_del_cat_')) {
        const catId = data.split('_')[3];
        await productService.deleteCategory(catId);
        await ctx.reply('✅ Turkum ochirildi!');
        await adminCommands.showAdminPanel(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'admin_contacts') {
        if (!ctx.session) ctx.session = {} as MySession;
        const contactInfo = adminService.getContactInfo() as any;
        const buttons = [
            [Markup.button.callback('📍 Manzilni tahrirlash', 'edit_shop_address')],
            [Markup.button.callback('👤 Username ni tahrirlash', 'edit_address')],
            [Markup.button.callback('📞 Telefonni tahrirlash', 'edit_contact_info')],
            [Markup.button.callback('📅 Ish kunlarini sozlash', 'manage_work_days')],
            [Markup.button.callback('🔙 Orqaga', 'back_to_admin')]
        ];
        await ctx.reply(`📞 Aloqa malumotlari:\n📍 Manzil: ${contactInfo.address || 'Kiritilmagan'}\n👤 Telegram: ${contactInfo.username}\n📞 Telefon: ${contactInfo.phone}\n\nSozlamalar:`, Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data === 'manage_work_days') {
        const days = adminService.getWorkDays();
        const weekDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
        const today = new Date().getDay();
        
        let calendarText = '📅 Ish kunlari va dam olish kunlari:\n\n';
        calendarText += '🟢 Ish kuni  |  🔴 Dam olish kuni\n';
        calendarText += '━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        
        weekDays.forEach((name, index) => {
            const isWorkDay = days.includes(index);
            const isToday = index === today;
            const todayMarker = isToday ? ' 🔸 (bugun)' : '';
            if (isWorkDay) {
                calendarText += `🟢 ${name}${todayMarker}\n`;
            } else {
                calendarText += `🔴 ${name}${todayMarker}\n`;
            }
        });
        
        calendarText += '\n━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        calendarText += '👇 Kunlarni tanlash uchun bosing:\n';
        
        const buttons = weekDays.map((name, index) => {
            const isActive = days.includes(index);
            const emoji = isActive ? '🟢' : '🔴';
            return [Markup.button.callback(`${emoji} ${name}`, `toggle_day_${index}`)];
        });
        buttons.push([Markup.button.callback('🔙 Orqaga', 'admin_contacts')]);
        
        await ctx.reply(calendarText, Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data.startsWith('toggle_day_')) {
        const day = parseInt(data.split('_')[2]);
        let days = adminService.getWorkDays();
        if (days.includes(day)) {
            days = days.filter(d => d !== day);
        } else {
            days.push(day);
        }
        adminService.setWorkDays(days);
        
        const weekDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
        const today = new Date().getDay();
        
        let calendarText = '📅 Ish kunlari va dam olish kunlari:\n\n';
        calendarText += '🟢 Ish kuni  |  🔴 Dam olish kuni\n';
        calendarText += '━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        
        weekDays.forEach((name, index) => {
            const isWorkDay = days.includes(index);
            const isToday = index === today;
            const todayMarker = isToday ? ' 🔸 (bugun)' : '';
            if (isWorkDay) {
                calendarText += `🟢 ${name}${todayMarker}\n`;
            } else {
                calendarText += `🔴 ${name}${todayMarker}\n`;
            }
        });
        
        calendarText += '\n━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        calendarText += '👇 Kunlarni tanlash uchun bosing:\n';
        
        const buttons = weekDays.map((name, index) => {
            const isActive = days.includes(index);
            const emoji = isActive ? '🟢' : '🔴';
            return [Markup.button.callback(`${emoji} ${name}`, `toggle_day_${index}`)];
        });
        buttons.push([Markup.button.callback('🔙 Orqaga', 'admin_contacts')]);
        
        await ctx.editMessageText(calendarText, Markup.inlineKeyboard(buttons));
        await ctx.answerCbQuery();
    } else if (data === 'edit_address') {
        if (!ctx.session) ctx.session = {} as MySession;
        ctx.session.state = 'admin_awaiting_address';
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Bekor qilish', 'back_to_admin')]
        ]);
        await ctx.reply('👤 Yangi Telegram username kiriting (masalan: @username):', keyboard);
        await ctx.answerCbQuery();
    } else if (data === 'edit_contact_info') {
        if (!ctx.session) ctx.session = {} as MySession;
        ctx.session.state = 'admin_awaiting_contact';
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Bekor qilish', 'back_to_admin')]
        ]);
        await ctx.reply('📞 Yangi telefon raqamini kiriting (masalan: +998...):', keyboard);
        await ctx.answerCbQuery();
    } else if (data === 'edit_shop_address') {
        if (!ctx.session) ctx.session = {} as MySession;
        ctx.session.state = 'admin_awaiting_shop_address';
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Bekor qilish', 'back_to_admin')]
        ]);
        await ctx.reply('📍 Yangi manzilni kiriting:', keyboard);
        await ctx.answerCbQuery();
    } else if (data === 'back_to_admin') {
        if (!ctx.session) ctx.session = {} as MySession;
        ctx.session.state = undefined;
        await adminCommands.showAdminPanel(ctx);
        await ctx.answerCbQuery();
    } else if (data === 'add_category') {
        if (!ctx.session) ctx.session = {} as MySession;
        ctx.session.state = 'admin_awaiting_category_name';
        await ctx.reply('📝 Yangi turkum nomini kiriting:');
        await ctx.answerCbQuery();
    } else if (data === 'checkout') {
        if (!ctx.session) ctx.session = {} as MySession;
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
