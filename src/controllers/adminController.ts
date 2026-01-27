import { Context } from 'telegraf';
import { AdminService } from '../services/adminService';

class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    public async addProduct(ctx: Context, productData: any): Promise<void> {
        const result = await this.adminService.addProduct(productData);
        await ctx.reply(result.message);
    }

    public async editProduct(ctx: Context, productId: string, updatedData: any): Promise<void> {
        const result = await this.adminService.editProduct(productId, updatedData);
        await ctx.reply(result.message);
    }

    public async deleteProduct(ctx: Context, productId: string): Promise<void> {
        const result = await this.adminService.deleteProduct(productId);
        await ctx.reply(result.message);
    }

    public async viewStatistics(ctx: Context): Promise<void> {
        const stats = await this.adminService.getStatistics();
        await ctx.reply(`Statistika:\n${stats}`);
    }

    public async manageUsers(ctx: Context): Promise<void> {
        const users = await this.adminService.getUsers();
        await ctx.reply(`Foydalanuvchilar:\n${users}`);
    }
}

export default AdminController;
