import { Context } from 'telegraf';
import AdminService from '../services/adminService';

class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    public async addProduct(ctx: Context, productData: any) {
        const result = await this.adminService.addProduct(productData);
        ctx.reply(result.message);
    }

    public async editProduct(ctx: Context, productId: string, updatedData: any) {
        const result = await this.adminService.editProduct(productId, updatedData);
        ctx.reply(result.message);
    }

    public async deleteProduct(ctx: Context, productId: string) {
        const result = await this.adminService.deleteProduct(productId);
        ctx.reply(result.message);
    }

    public async viewStatistics(ctx: Context) {
        const stats = await this.adminService.getStatistics();
        ctx.reply(`Statistics:\n${stats}`);
    }

    public async manageUsers(ctx: Context) {
        const users = await this.adminService.getUsers();
        ctx.reply(`Users:\n${users}`);
    }
}

export default AdminController;