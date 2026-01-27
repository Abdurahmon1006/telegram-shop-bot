import { Schema, model } from 'mongoose';

interface IAdmin {
    name: string;
    telegramId: string;
    adminSince: Date;
}

const adminSchema = new Schema<IAdmin>({
    name: { type: String, required: true },
    telegramId: { type: String, required: true, unique: true },
    adminSince: { type: Date, default: Date.now }
});

const Admin = model<IAdmin>('Admin', adminSchema);

export default Admin;