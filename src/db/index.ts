import { Sequelize } from 'sequelize';
import { Product } from '../models/product';
import { CartItem } from '../models/cartItem';
import { Order } from '../models/order';
import { Admin } from '../models/admin';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD as string, {
    host: process.env.DB_HOST,
    dialect: 'postgres', // or any other dialect you are using
});

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        // Sync all models with the database
        await sequelize.sync();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export { sequelize, initializeDatabase, Product, CartItem, Order, Admin };