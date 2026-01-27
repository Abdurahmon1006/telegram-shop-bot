export const formatMessage = (message: string): string => {
    return `📦 ${message}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    return phoneRegex.test(phone);
};

export const calculateTotalPrice = (items: { price: number; quantity: number }[]): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};