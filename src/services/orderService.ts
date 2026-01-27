import { Order } from '../models/order';
import { CartItem } from '../models/cartItem';

export class OrderService {
    private orders: Order[] = [];

    public placeOrder(userId: string, cartItems: CartItem[], totalPrice: number): Order {
        const newOrder: Order = {
            id: this.generateOrderId(),
            userId,
            items: cartItems,
            totalPrice,
            date: new Date(),
        };
        this.orders.push(newOrder);
        return newOrder;
    }

    public getOrderHistory(userId: string): Order[] {
        return this.orders.filter(order => order.userId === userId);
    }

    private generateOrderId(): string {
        return (this.orders.length + 1).toString();
    }
}