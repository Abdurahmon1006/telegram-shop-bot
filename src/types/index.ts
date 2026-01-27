export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
};

export type CartItem = {
    productId: string;
    quantity: number;
};

export type Order = {
    id: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
    orderDate: Date;
};

export type Admin = {
    id: string;
    username: string;
    password: string;
    createdAt: Date;
};

export type User = {
    id: string;
    name: string;
    phoneNumber: string;
};