# TODO List - Telegram Shop Bot Features

## Task: Implement all required features

### 1. PostgreSQL/Supabase Setup
- [ ] Update config/index.ts with Supabase DATABASE_URL
- [ ] Install pg and sequelize dependencies
- [ ] Create db/index.ts for database connection
- [ ] Create database models

### 2. Address Editing
- [ ] Add address field to adminService contactInfo
- [ ] Add edit_address callback handler in bot.ts
- [ ] Update user contact command to show address

### 3. Image Display Fix
- [ ] Download images from Telegram and store locally
- [ ] Update product model to store local image path
- [ ] Fix image display logic
