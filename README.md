# Telegram Shop Bot

This project is a Telegram bot designed for a shop, allowing users to browse products, manage their shopping cart, and place orders. Admins can manage products, view orders, and handle user interactions.

## Features

### User Functionalities
- **View Products**: Users can browse through various product categories and view product details.
- **Shopping Cart**: Users can add products to their cart, modify quantities, and remove items.
- **Order History**: Users can view their past orders.
- **Contact Information**: Users can access contact details for support.

### Admin Functionalities
- **Product Management**: Admins can add, edit, and delete products.
- **Order Management**: Admins can view and manage user orders.
- **Statistics and Reports**: Admins can view sales statistics and reports.
- **User Management**: Admins can manage user accounts and permissions.

## Project Structure

```
telegram-shop-bot
├── src
│   ├── bot.ts
│   ├── commands
│   │   ├── userCommands.ts
│   │   └── adminCommands.ts
│   ├── controllers
│   │   ├── productsController.ts
│   │   ├── cartController.ts
│   │   ├── ordersController.ts
│   │   └── adminController.ts
│   ├── services
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   └── adminService.ts
│   ├── keyboards
│   │   ├── mainKeyboard.ts
│   │   ├── productKeyboard.ts
│   │   └── adminKeyboard.ts
│   ├── models
│   │   ├── product.ts
│   │   ├── cartItem.ts
│   │   ├── order.ts
│   │   └── admin.ts
│   ├── db
│   │   ├── index.ts
│   │   └── migrations
│   │       └── README.md
│   ├── utils
│   │   └── helpers.ts
│   ├── types
│   │   └── index.ts
│   └── config
│       └── index.ts
├── tests
│   └── bot.test.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd telegram-shop-bot
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables by copying `.env.example` to `.env` and filling in the required values.

## Usage

To start the bot, run:
```
npm start
```

## Testing

Run tests using:
```
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.