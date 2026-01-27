export interface OrderItem {
    productId: string;
    quantity: number;
}

export interface Order {
    userId: string;
    items: OrderItem[];
    totalPrice: number;
    orderDate: Date;
    status: 'pending' | 'completed' | 'canceled';
}