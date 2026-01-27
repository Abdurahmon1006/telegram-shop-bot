import { Order } from '../models/order';
import { CartItem } from '../models/cartItem';

export class OrderService {
    private orders: Order[] = [];

    placeOrder(userId: string, cartItems: CartItem[], totalPrice: number, customerName?: string, customerPhone?: string): Order {
        const newOrder: Order = {
            id: (this.orders.length + 1).toString(),
            userId,
            items: cartItems,
            totalPrice,
            date: new Date(),
            status: 'pending',
            customerName,
            customerPhone,
        };
        this.orders.push(newOrder);
        return newOrder;
    }

    getOrderHistory(userId: string): Order[] {
        return this.orders.filter(order => order.userId === userId);
    }

    getAllOrders(): Order[] {
        return this.orders;
    }

    async createOrder(userId: string, orderDetails: Partial<Order>): Promise<Order> {
        const newOrder: Order = {
            id: (this.orders.length + 1).toString(),
            userId,
            items: orderDetails.items || [],
            totalPrice: orderDetails.totalPrice || 0,
            date: new Date(),
            status: 'pending',
            customerName: orderDetails.customerName,
            customerPhone: orderDetails.customerPhone,
        };
        this.orders.push(newOrder);
        return newOrder;
    }
}
