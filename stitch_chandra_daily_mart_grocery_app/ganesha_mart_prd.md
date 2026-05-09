# Chandra Daily Mart - Product Requirements Document

## Overview
Chandra Daily Mart is a hybrid quick commerce and morning delivery platform (Zepto + Country Delight model) serving Vinay Nagar, Faridabad.

## User Roles & Authentication
- **Smart Login Logic:**
  - Login via Phone Number + OTP.
  - If phone number = Admin Number -> Redirect to Admin Dashboard.
  - Otherwise -> Redirect to Customer Home.
- **Roles:** Admin, Customer.

## Product Categories
1. Milk & Dairy
2. Bread & Bakery
3. Beverages
4. Rice, Atta & Pulses
5. Snacks & Biscuits
6. Oil, Masala & Spices
7. Cleaning & Household
8. Personal Care
9. Eggs & Protein
10. Vegetables (Limited)
11. Stationery Items

## Features
### Customer
- Home (Banner, Categories, Search, Recently Ordered)
- Search (Instant, Suggestions, Filters)
- Cart (Add/Remove, Quantity, Price Calculation)
- Orders (Instant delivery or Schedule morning delivery)
- Payments (UPI, COD, Wallet)
- Address (Multiple addresses, Auto-detect)
- Reviews (Rate products)

### Admin
- Dashboard (Total orders, Revenue, Users)
- Product Management (Add/Edit/Delete, Stock Control, Image Uploads)
- Order Management (Status updates: Pending, Packed, Out for Delivery, Delivered)
- User Management (View users)
- Offers (Create discount banners)

## Data Schema
- **Users:** id, name, phone, role, created_at
- **Products:** id, name, price, category, image_url, stock, description, is_available
- **Orders:** id, user_id, total_price, status, delivery_type (instant/morning), created_at
- **Order Items:** id, order_id, product_id, quantity, price
- **Address:** id, user_id, address, pincode