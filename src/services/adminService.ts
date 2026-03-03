import { Admin } from '../models/admin';

export class AdminService {
    private static workDays = [1, 2, 3, 4, 5, 6];
    private static contactInfo = {
        phone: '+998901234567',
        username: '@shop_admin',
        address: 'Manzil kiritilmagan'
    };
    private static adminPassword = 'admin123';

    getWorkDays() {
        return AdminService.workDays;
    }

    setWorkDays(days: number[]) {
        AdminService.workDays = days;
    }

    isWorkDay(date: Date = new Date()) {
        return AdminService.workDays.includes(date.getDay());
    }
    private admins: Admin[] = [];

    getContactInfo() {
        return AdminService.contactInfo;
    }

    updateContactInfo(data: { phone?: string; username?: string; address?: string }) {
        AdminService.contactInfo = { ...AdminService.contactInfo, ...data };
    }

    setAdminPassword(password: string) {
        AdminService.adminPassword = password;
    }

    checkAdminPassword(password: string): boolean {
        return password === AdminService.adminPassword;
    }

    async addAdmin(name: string, telegramId: string): Promise<Admin> {
        const newAdmin: Admin = {
            id: (this.admins.length + 1).toString(),
            name,
            telegramId,
            adminSince: new Date(),
        };
        this.admins.push(newAdmin);
        return newAdmin;
    }

    async getAdmin(telegramId: string): Promise<Admin | null> {
        return this.admins.find(a => a.telegramId === telegramId) || null;
    }

    async isAdmin(telegramId: string): Promise<boolean> {
        return this.admins.some(a => a.telegramId === telegramId);
    }

    async listAdmins(): Promise<Admin[]> {
        return this.admins;
    }

    async getStatistics(): Promise<string> {
        const productService = new (require('./productService').ProductService)();
        const products = await productService.getAllProducts();
        const orders = require('./orderService').OrderService.getOrders();
        const totalRevenue = require('./orderService').OrderService.getTotalRevenue();
        return `📊 Statistika:
- Jami mahsulotlar: ${products.length} ta
- Jami buyurtmalar: ${orders.length} ta
- Jami daromad: ${totalRevenue} so'm`;
    }

    async getUsers(): Promise<string> {
        return 'Foydalanuvchilar: 0';
    }

    async addProduct(productData: any): Promise<{ message: string }> {
        const productService = new (require('./productService').ProductService)();
        await productService.addProduct(productData);
        return { message: '✅ Tovar muvaffaqiyatli qo\'shildi!' };
    }

    async editProduct(productId: string, updatedData: any): Promise<{ message: string }> {
        return { message: 'Tovar tahrirlandi' };
    }

    async deleteProduct(productId: string): Promise<{ message: string }> {
        return { message: 'Tovar o\'chirildi' };
    }
}

export default AdminService;
