import { Admin } from '../models/admin';

export class AdminService {
    private admins: Admin[] = [];

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
        return 'Statistika: 0 buyurtma, 0 so\'m daromad';
    }

    async getUsers(): Promise<string> {
        return 'Foydalanuvchilar: 0';
    }

    async addProduct(productData: any): Promise<{ message: string }> {
        return { message: 'Tovar qo\'shildi' };
    }

    async editProduct(productId: string, updatedData: any): Promise<{ message: string }> {
        return { message: 'Tovar tahrirlandi' };
    }

    async deleteProduct(productId: string): Promise<{ message: string }> {
        return { message: 'Tovar o\'chirildi' };
    }
}

export default AdminService;
