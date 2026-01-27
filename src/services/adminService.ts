import { Admin } from '../models/admin';
import { Database } from '../db/index';

export class AdminService {
    private db: Database;

    constructor() {
        this.db = new Database();
    }

    async addAdmin(name: string, telegramId: string): Promise<Admin> {
        const newAdmin = new Admin(name, telegramId);
        await this.db.saveAdmin(newAdmin);
        return newAdmin;
    }

    async editAdmin(telegramId: string, updatedData: Partial<Admin>): Promise<Admin | null> {
        const admin = await this.db.findAdminByTelegramId(telegramId);
        if (admin) {
            Object.assign(admin, updatedData);
            await this.db.updateAdmin(admin);
            return admin;
        }
        return null;
    }

    async deleteAdmin(telegramId: string): Promise<boolean> {
        const result = await this.db.deleteAdmin(telegramId);
        return result;
    }

    async getAdmin(telegramId: string): Promise<Admin | null> {
        return await this.db.findAdminByTelegramId(telegramId);
    }

    async listAdmins(): Promise<Admin[]> {
        return await this.db.getAllAdmins();
    }

    async isAdmin(telegramId: string): Promise<boolean> {
        const admin = await this.db.findAdminByTelegramId(telegramId);
        return admin !== null;
    }
}