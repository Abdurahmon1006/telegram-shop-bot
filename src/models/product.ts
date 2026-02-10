export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    stock: number;
    categoryId: string;
    imageUrl?: string;
}

export interface Category {
    id: string;
    name: string;
}
