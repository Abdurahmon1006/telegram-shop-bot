# Telegram Shop Bot

## Overview
A Telegram bot for managing a shop with user and admin functionalities. Users can browse products, manage their shopping cart, and place orders. Admins can manage products, view orders, and handle user interactions.

## Project Structure
```
telegram-shop-bot
├── src
│   ├── bot.ts              - Main bot entry point
│   ├── commands/           - Command handlers
│   │   ├── userCommands.ts
│   │   └── adminCommands.ts
│   ├── controllers/        - Business logic controllers
│   │   ├── productsController.ts
│   │   ├── cartController.ts
│   │   ├── ordersController.ts
│   │   └── adminController.ts
│   ├── services/           - Service layer
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   └── adminService.ts
│   ├── keyboards/          - Telegram keyboard layouts
│   │   ├── mainKeyboard.ts
│   │   ├── productKeyboard.ts
│   │   └── adminKeyboard.ts
│   ├── models/             - Data models/interfaces
│   │   ├── product.ts
│   │   ├── cartItem.ts
│   │   ├── order.ts
│   │   └── admin.ts
│   └── config/             - Configuration
│       └── index.ts
├── tests/
│   └── bot.test.ts
├── package.json
└── tsconfig.json
```

## Setup
1. Create a Telegram bot via @BotFather and get your bot token
2. Set the `BOT_TOKEN` secret in Replit
3. Run the bot with `npm start`

## Environment Variables
- `BOT_TOKEN` - Your Telegram Bot API token (required)

## Technology Stack
- TypeScript
- Telegraf (Telegram Bot Framework)
- Node.js 20

## Commands
- `/start` - Welcome message with main menu
- `/products` - View available products
- `/cart` - View shopping cart
- `/order_history` - View past orders
- `/contact` - Contact information
- `/admin` - Admin panel (restricted)

## Recent Changes
- January 27, 2026: Initial setup for Replit environment
  - Fixed package.json dependencies (switched from mongoose/node-telegram-bot-api to telegraf)
  - Cleaned up inconsistent code imports
  - Simplified services to use in-memory storage
  - Set up workflow for running the bot
