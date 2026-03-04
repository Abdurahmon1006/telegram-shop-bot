import { Order } from '../models/order';
import { CartItem } from '../models/cartItem';
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(__dirname, '../../data/orders.json');

function ensureDataDir() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadOrders(): Order[] {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            const orders = JSON.parse(data);
            return orders.map((o: any) => ({
                ...o,
                date: new Date(o.date)
            }));
        } catch {
            return [];
        }
    }
    return [];
}

function saveOrders(orders: Order[]) {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

export class OrderService {
    private static orders: Order[] = loadOrders();

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
        saveOrders(OrderService.orders);
        return newOrder;
    }

    getOrderHistory(userId: string): Order[] {
        return OrderService.orders.filter(order => order.userId === userId);
    }

    getAllOrders(): Order[] {
        return OrderService.orders;
    }

    updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'canceled'): boolean {
        const order = OrderService.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            saveOrders(OrderService.orders);
            return true;
        }
        return false;
    }

    static getOrders(): Order[] {
        return OrderService.orders;
    }

    static getTotalRevenue(): number {
        return OrderService.orders
            .filter(o => o.status === 'completed')
            .reduce((total, order) => total + order.totalPrice, 0);
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
        saveOrders(OrderService.orders);
        return newOrder;
    }
}
