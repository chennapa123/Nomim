# 🌾 Nomim Farm Direct

A MERN-based platform connecting farmers directly with consumers/retailers, eliminating middlemen and ensuring fair prices for both parties.

## 🎯 Project Overview

Nomim Farm Direct is a full-stack e-commerce platform that enables:
- **Farmers** to list their products directly
- **Buyers/Consumers** to purchase fresh produce directly from farmers
- **No middleman involvement** - direct farmer-to-consumer transactions

## ✨ Features

### 👨‍🌾 Farmer Features
- ✅ Register & Login
- ✅ Add farm produce (name, quantity, price, photos)
- ✅ Upload product images via Cloudinary
- ✅ Track orders placed
- ✅ Update stock / mark products as sold
- ✅ Manage product inventory

### 🛍️ Buyer Features
- ✅ Register & Login
- ✅ Browse products by category/location
- ✅ Search products
- ✅ Add products to shopping cart
- ✅ Place orders
- ✅ Contact farmer (phone/email)
- ✅ Track order status
- ✅ Update payment status

### 🔐 Admin Features (Optional - Stage 2)
- ✅ Verify farmer accounts
- ✅ Handle disputes/complaints

## 🏗️ Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React + Redux Toolkit |
| Backend | Node.js + Express |
| Database | MongoDB |
| Authentication | JWT |
| Image Storage | Cloudinary |
| UI Framework | Bootstrap 5 |

## 📦 MongoDB Collections

### Users
- name, email, password
- role: farmer / buyer / admin
- phone, address, location (district/state)
- isVerified (for admin verification)

### Products
- farmerId (reference to User)
- productName, category, price, quantity
- imageURL, description
- status: available/sold

### Orders
- buyerId, farmerId, productId
- quantity, totalAmount
- paymentStatus: pending/completed/failed
- deliveryStatus: pending/processing/shipped/delivered/cancelled
- shippingAddress, contactPhone

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nomim
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Set up environment variables**

Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nomim
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. **Start the development servers**

Run both backend and frontend concurrently:
```bash
npm run dev:all
```

Or run them separately:

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run client
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
nomim/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   └── utils/         # API utilities
│   └── public/
├── models/                # MongoDB models
├── routes/                # Express routes
├── middleware/           # Auth middleware
├── server.js             # Express server
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Farmer only)
- `PUT /api/products/:id` - Update product (Farmer only)
- `DELETE /api/products/:id` - Delete product (Farmer only)
- `GET /api/products/farmer/my-products` - Get farmer's products

### Orders
- `POST /api/orders` - Create order (Buyer only)
- `GET /api/orders/my-orders` - Get buyer's orders
- `GET /api/orders/farmer/orders` - Get farmer's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status

### Upload
- `POST /api/upload` - Upload image to Cloudinary

### Users
- `GET /api/users/farmers` - Get all farmers
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

## 🎨 Key Features Implementation

### Shopping Cart
- Add products to cart
- Update quantities
- Remove items
- Place multiple orders at once
- Cart persists in localStorage

### Image Upload
- Upload product images via Cloudinary
- Support for multiple image formats
- Automatic image optimization
- Fallback to image URL input

### Location-Based Filtering
- Filter products by district
- Filter products by state
- Combined with category and search filters

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Farmer/Buyer/Admin)
- Protected routes
- Secure password hashing with bcrypt

## 🔒 Security Features
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation with express-validator
- CORS configuration

## 🚧 Future Enhancements
- Real-time chat between farmers and buyers
- Auction system for products
- Advanced product filtering and search
- Price negotiation feature
- Logistics integration
- Mobile app (React Native)
- Email notifications
- SMS notifications
- Product reviews and ratings

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

Built with ❤️ using MERN Stack

