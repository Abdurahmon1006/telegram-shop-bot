import dotenv from "dotenv";

dotenv.config();

export const config = {
    BOT_TOKEN:
        process.env.BOT_TOKEN ||
        "8309915799:AAFtCeDgLHzkUsH7EuSA_W06yMiNhpOrdCg",
    DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://postgres:abd201717121413@db.yscpunritjgqozjjpvwc.supabase.co:5432/postgres",
    ADMIN_ID: process.env.ADMIN_ID || "",
    PORT: process.env.PORT || 3000,
};

export default config;
