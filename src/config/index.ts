import dotenv from 'dotenv';

dotenv.config();

const config = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '8309915799:AAFtCeDgLHzkUsH7EuSA_W06yMiNhpOrdCg',
    DATABASE_URL: process.env.DATABASE_URL || 'https://yscpunritjgqozjjpvwc.supabase.co',
    ADMIN_ID: process.env.ADMIN_ID || 'abd201717121413',
    PORT: process.env.PORT || 3000,
};

export default config;