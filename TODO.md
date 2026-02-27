# TODO List - Telegram Shop Bot Fixes

## Task: Fix Critical Bug - Orders Not Being Saved

### Step 1: Fix bot.ts - Save orders during checkout
- [ ] Import OrderService
- [ ] Add order creation logic after collecting name and phone
- [ ] Pass customer name and phone to the order

### Step 2: Fix orderService.ts - Expose order data for statistics
- [ ] Make orders array accessible (static or add getter method)
- [ ] Add method to get order statistics (total orders, revenue)

### Step 3: Fix adminService.ts - Update statistics to show real data
- [ ] Import OrderService
- [ ] Get actual order count and revenue from orderService
- [ ] Update getStatistics() method

### Step 4: Verify the fixes work
- [ ] Test checkout flow
- [ ] Verify order history
- [ ] Verify admin statistics
