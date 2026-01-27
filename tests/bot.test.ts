import { Telegraf } from 'telegraf';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { mock } from 'jest-mock-extended';
import { ProductsController } from '../src/controllers/productsController';
import { CartController } from '../src/controllers/cartController';
import { OrdersController } from '../src/controllers/ordersController';
import { AdminController } from '../src/controllers/adminController';

const bot = new Telegraf(process.env.BOT_TOKEN);
const productsController = mock<ProductsController>();
const cartController = mock<CartController>();
const ordersController = mock<OrdersController>();
const adminController = mock<AdminController>();

beforeAll(() => {
    bot.launch();
});

afterAll(() => {
    bot.stop();
});

describe('Telegram Bot', () => {
    it('should respond to /start command', async () => {
        const ctx = { reply: jest.fn() };
        await bot.handleUpdate({ message: { text: '/start' } }, ctx);
        expect(ctx.reply).toHaveBeenCalledWith('Welcome to the shop! Use the menu to navigate.');
    });

    it('should list products when /products command is called', async () => {
        const ctx = { reply: jest.fn() };
        productsController.listProducts = jest.fn().mockReturnValue('Product List');
        await bot.handleUpdate({ message: { text: '/products' } }, ctx);
        expect(productsController.listProducts).toHaveBeenCalled();
        expect(ctx.reply).toHaveBeenCalledWith('Product List');
    });

    it('should add item to cart', async () => {
        const ctx = { reply: jest.fn() };
        cartController.addItem = jest.fn().mockReturnValue('Item added to cart');
        await bot.handleUpdate({ message: { text: '/add_to_cart' } }, ctx);
        expect(cartController.addItem).toHaveBeenCalled();
        expect(ctx.reply).toHaveBeenCalledWith('Item added to cart');
    });

    it('should place an order', async () => {
        const ctx = { reply: jest.fn() };
        ordersController.placeOrder = jest.fn().mockReturnValue('Order placed successfully');
        await bot.handleUpdate({ message: { text: '/place_order' } }, ctx);
        expect(ordersController.placeOrder).toHaveBeenCalled();
        expect(ctx.reply).toHaveBeenCalledWith('Order placed successfully');
    });

    it('should show admin panel', async () => {
        const ctx = { reply: jest.fn() };
        adminController.showAdminPanel = jest.fn().mockReturnValue('Admin Panel');
        await bot.handleUpdate({ message: { text: '/admin' } }, ctx);
        expect(adminController.showAdminPanel).toHaveBeenCalled();
        expect(ctx.reply).toHaveBeenCalledWith('Admin Panel');
    });
});