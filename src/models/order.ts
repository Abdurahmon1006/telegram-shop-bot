import { CartItem } from './cartItem';

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
    date: Date;
    status: 'pending' | 'completed' | 'canceled';
    customerName?: string;
    customerPhone?: string;
}
