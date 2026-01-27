import { CartItem } from '../models/cartItem';

export class CartService {
    private carts: Map<number, CartItem[]> = new Map();

    addItem(userId: number, item: CartItem): void {
        const cart = this.carts.get(userId) || [];
        const existingItem = cart.find(i => i.productId === item.productId);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        this.carts.set(userId, cart);
    }

    updateItemQuantity(userId: number, productId: string, quantity: number): void {
        const cart = this.carts.get(userId) || [];
        const item = cart.find(i => i.productId === productId);
        if (item) {
            item.quantity = quantity;
        }
    }

    removeItem(userId: number, productId: string): void {
        const cart = this.carts.get(userId) || [];
        const filtered = cart.filter(i => i.productId !== productId);
        this.carts.set(userId, filtered);
    }

    getCartItems(userId: number): CartItem[] {
        return this.carts.get(userId) || [];
    }

    calculateTotal(userId: number): number {
        const cart = this.carts.get(userId) || [];
        return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    }

    clearCart(userId: number): void {
        this.carts.set(userId, []);
    }
}
