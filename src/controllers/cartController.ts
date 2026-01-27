import { Context } from 'telegraf';
import { CartService } from '../services/cartService';
import { CartItem } from '../models/cartItem';

export class CartController {
    private cartService: CartService;

    constructor() {
        this.cartService = new CartService();
    }

    public async addItem(ctx: Context, item: CartItem): Promise<void> {
        await this.cartService.addItem(ctx.from.id, item);
        await ctx.reply('Tovar savatchaga qo\'shildi.');
    }

    public async updateItemQuantity(ctx: Context, itemId: string, quantity: number): Promise<void> {
        await this.cartService.updateItemQuantity(ctx.from.id, itemId, quantity);
        await ctx.reply('Miqdor yangilandi.');
    }

    public async removeItem(ctx: Context, itemId: string): Promise<void> {
        await this.cartService.removeItem(ctx.from.id, itemId);
        await ctx.reply('Tovar savatchadan o\'chirildi.');
    }

    public async viewCart(ctx: Context): Promise<void> {
        const cartItems = await this.cartService.getCartItems(ctx.from.id);
        if (cartItems.length === 0) {
            await ctx.reply('Savatchangiz bo\'sh.');
            return;
        }

        let message = 'Savatchangiz:\n';
        let totalPrice = 0;

        cartItems.forEach(item => {
            message += `${item.productName} - ${item.quantity} ${item.unit} - ${item.price} so\'m\n`;
            totalPrice += item.price * item.quantity;
        });

        message += `Umumiy narx: ${totalPrice} so\'m`;
        await ctx.reply(message);
    }
}