import { CartItem } from '../models/cartItem';

export class CartService {
    private cart: CartItem[] = [];

    addItem(productId: string, quantity: number): void {
        const existingItem = this.cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ productId, quantity });
        }
    }

    updateItem(productId: string, quantity: number): void {
        const existingItem = this.cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity = quantity;
        }
    }

    removeItem(productId: string): void {
        this.cart = this.cart.filter(item => item.productId !== productId);
    }

    getCartItems(): CartItem[] {
        return this.cart;
    }

    calculateTotal(prices: Record<string, number>): number {
        return this.cart.reduce((total, item) => {
            const price = prices[item.productId] || 0;
            return total + price * item.quantity;
        }, 0);
    }

    clearCart(): void {
        this.cart = [];
    }
}