 import { Order } from '../models/order';
import { CartItem } from '../models/cartItem';

export class OrderService {
    private static orders: Order[] = [];

    placeOrder(userId: string, cartItems: CartItem[], totalPrice: number, customerName?: string, customerPhone?: string): Order {
        const newOrder: Order = {
            id: (OrderService.orders.length + 1).toString(),
            userId,
            items: cartItems,
            totalPrice,
            date: new Date(),
            status: 'pending',
            customerName,
            customerPhone,
        };
        OrderService.orders.push(newOrder);
        return newOrder;
    }

    getOrderHistory(userId: string): Order[] {
        return OrderService.orders.filter(order => order.userId === userId);
    }

    getAllOrders(): Order[] {
        return OrderService.orders;
    }

    static getOrders(): Order[] {
        return OrderService.orders;
    }

    static getTotalRevenue(): number {
        return OrderService.orders.reduce((total, order) => total + order.totalPrice, 0);
    }

    async createOrder(userId: string, orderDetails: Partial<Order>): Promise<Order> {
        const newOrder: Order = {
            id: (OrderService.orders.length + 1).toString(),
            userId,
            items: orderDetails.items || [],
            totalPrice: orderDetails.totalPrice || 0,
            date: new Date(),
            status: 'pending',
            customerName: orderDetails.customerName,
            customerPhone: orderDetails.customerPhone,
        };
        OrderService.orders.push(newOrder);
        return newOrder;
    }
}
