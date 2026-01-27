import { Context } from 'telegraf';
import { CartService } from '../services/cartService';
import { CartItem } from '../models/cartItem';

export class CartController {
    private cartService: CartService;

    constructor() {
        this.cartService = new CartService();
    }

    public async addItem(ctx: Context, item: CartItem): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.reply('Xato yuz berdi.');
            return;
        }
        this.cartService.addItem(userId, item);
        await ctx.reply('Tovar savatchaga qo\'shildi.');
    }

    public async updateItemQuantity(ctx: Context, productId: string, quantity: number): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.reply('Xato yuz berdi.');
            return;
        }
        this.cartService.updateItemQuantity(userId, productId, quantity);
        await ctx.reply('Miqdor yangilandi.');
    }

    public async removeItem(ctx: Context, productId: string): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.reply('Xato yuz berdi.');
            return;
        }
        this.cartService.removeItem(userId, productId);
        await ctx.reply('Tovar savatchadan o\'chirildi.');
    }

    public async viewCart(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.reply('Xato yuz berdi.');
            return;
        }
        const cartItems = this.cartService.getCartItems(userId);
        if (cartItems.length === 0) {
            await ctx.reply('Savatchangiz bo\'sh.');
            return;
        }

        let message = 'Savatchangiz:\n';
        let totalPrice = 0;

        cartItems.forEach(item => {
            const itemTotal = (item.price || 0) * item.quantity;
            message += `${item.productName || item.productId} - ${item.quantity} ${item.unit || 'dona'} - ${item.price || 0} so\'m\n`;
            totalPrice += itemTotal;
        });

        message += `Umumiy narx: ${totalPrice} so\'m`;
        await ctx.reply(message);
    }
}
