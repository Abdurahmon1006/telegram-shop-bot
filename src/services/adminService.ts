import { Admin } from '../models/admin';

export class AdminService {
    private static contactInfo = {
        phone: '+998901234567',
        username: '@shop_admin'
    };
    private admins: Admin[] = [];

    getContactInfo() {
        return AdminService.contactInfo;
    }

    updateContactInfo(data: { phone: string; username: string }) {
        AdminService.contactInfo = data;
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
        return `📊 Statistika:
- Jami mahsulotlar: ${products.length} ta
- Jami buyurtmalar: 0 ta
- Jami daromad: 0 so'm`;
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
