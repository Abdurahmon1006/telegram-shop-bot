import { Admin } from '../models/admin';
import * as fs from 'fs';
import * as path from 'path';

interface AdminData {
    workDays: number[];
    contactInfo: {
        phone: string;
        username: string;
        address: string;
    };
    adminPassword: string;
}

const DATA_FILE = path.join(__dirname, '../../data/admin.json');

function ensureDataDir() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadAdminData(): AdminData {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        } catch {
            return getDefaultData();
        }
    }
    return getDefaultData();
}

function saveAdminData(data: AdminData) {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getDefaultData(): AdminData {
    return {
        workDays: [1, 2, 3, 4, 5, 6],
        contactInfo: {
            phone: '+998901234567',
            username: '@shop_admin',
            address: 'Manzil kiritilmagan'
        },
        adminPassword: 'admin123'
    };
}

export class AdminService {
    private static data: AdminData = loadAdminData();

    getWorkDays() {
        return AdminService.data.workDays;
    }

    setWorkDays(days: number[]) {
        AdminService.data.workDays = days;
        saveAdminData(AdminService.data);
    }

    isWorkDay(date: Date = new Date()) {
        return AdminService.data.workDays.includes(date.getDay());
    }
    
    private admins: Admin[] = [];

    getContactInfo() {
        return AdminService.data.contactInfo;
    }

    updateContactInfo(data: { phone?: string; username?: string; address?: string }) {
        AdminService.data.contactInfo = { ...AdminService.data.contactInfo, ...data };
        saveAdminData(AdminService.data);
    }

    setAdminPassword(password: string) {
        AdminService.data.adminPassword = password;
        saveAdminData(AdminService.data);
    }

    checkAdminPassword(password: string): boolean {
        return password === AdminService.data.adminPassword;
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
        const orders: Array<{status: string}> = require('./orderService').OrderService.getOrders();
        const totalRevenue = require('./orderService').OrderService.getTotalRevenue();
        
        const pendingOrders = orders.filter((o: {status: string}) => o.status === 'pending').length;
        const completedOrders = orders.filter((o: {status: string}) => o.status === 'completed').length;
        const canceledOrders = orders.filter((o: {status: string}) => o.status === 'canceled').length;
        
        return `📊 Statistika:
- Jami mahsulotlar: ${products.length} ta
- Jami buyurtmalar: ${orders.length} ta
- Bajarilgan: ${completedOrders} ta
- Kutilayotgan: ${pendingOrders} ta
- Bekor qilingan: ${canceledOrders} ta
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
