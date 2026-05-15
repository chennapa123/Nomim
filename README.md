# 🌾 AgriMart — Farm to Vendor Direct Marketplace

A full-stack **MERN** application that connects farmers directly with vendors — **zero middlemen, zero commission, 100% fair prices.**

---

## 📸 Features

### For Farmers
- ✅ Register & build a verified farm profile
- ✅ List products with images, pricing, harvest dates, organic certification
- ✅ Receive orders with real-time notifications
- ✅ Accept / reject / update order status
- ✅ Dashboard with revenue charts and order analytics
- ✅ Manage product listings (add, edit, toggle availability)
- ✅ Receive vendor reviews and ratings

### For Vendors
- ✅ Register with business details
- ✅ Browse marketplace with advanced filters (category, state, organic, price)
- ✅ View detailed farmer profiles before ordering
- ✅ Add products from multiple farmers to cart
- ✅ Place direct orders with delivery/pickup options
- ✅ Track order status in real-time
- ✅ Dashboard with purchase analytics
- ✅ Review farmers and products after delivery

### Platform Features
- ✅ JWT-based authentication
- ✅ Role-based access control (farmer / vendor / admin)
- ✅ Real-time notifications via Socket.io
- ✅ Product search with full-text indexing
- ✅ Responsive design — mobile + desktop
- ✅ Zero commission — payments are direct

---

## 🏗 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router v6, Recharts     |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB + Mongoose ODM                  |
| Auth       | JWT (JSON Web Tokens) + bcryptjs        |
| Real-time  | Socket.io                               |
| Styling    | Custom CSS with CSS Variables           |
| HTTP       | Axios                                   |

---

## 📁 Project Structure

```
agrimart/
├── backend/
│   ├── models/
│   │   ├── User.js          # Farmer & Vendor schemas
│   │   ├── Product.js       # Product listings
│   │   ├── Order.js         # Orders with status tracking
│   │   ├── Review.js        # Product & user reviews
│   │   └── Notification.js  # In-app notifications
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── products.js      # CRUD + search + filters
│   │   ├── orders.js        # Order lifecycle + stats
│   │   ├── users.js         # Farmer directory
│   │   ├── reviews.js       # Rating system
│   │   └── notifications.js # Notification management
│   ├── middleware/
│   │   └── auth.js          # JWT protect + role authorize
│   ├── server.js            # Express + Socket.io entry
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   ├── AuthContext.js   # Global auth state
│       │   └── CartContext.js   # Shopping cart state
│       ├── utils/
│       │   └── api.js           # Axios API helpers
│       ├── components/
│       │   └── common/
│       │       ├── Navbar.js + .css
│       │       ├── Footer.js + .css
│       │       └── ProductCard.js + .css
│       ├── pages/
│       │   ├── HomePage.js          # Landing page
│       │   ├── LoginPage.js         # Login + Register
│       │   ├── RegisterPage.js
│       │   ├── ProductsPage.js      # Marketplace with filters
│       │   ├── ProductDetailPage.js # Product + farmer info
│       │   ├── FarmersPage.js       # Farmer directory
│       │   ├── FarmerProfilePage.js # Farmer profile + products
│       │   ├── CartPage.js          # Shopping cart
│       │   ├── CheckoutPage.js      # Place orders
│       │   ├── OrdersPage.js        # Order list + management
│       │   ├── OrderDetailPage.js   # Full order tracking
│       │   ├── DashboardPage.js     # Analytics dashboard
│       │   ├── AddProductPage.js    # List new product
│       │   ├── EditProductPage.js   # Edit product
│       │   └── ProfilePage.js       # Account settings
│       ├── App.js                   # Routes + providers
│       ├── index.js
│       └── index.css                # Design system + globals
│
└── package.json   # Root scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd agrimart
npm run install-all
```

### 2. Set up Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/agrimart
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# macOS/Linux
mongod

# Or use MongoDB Atlas (cloud) — just update MONGO_URI
```

### 4. Run the App

```bash
# From root — runs both backend and frontend
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint                    | Description            | Auth |
|--------|-----------------------------|------------------------|------|
| POST   | /api/auth/register          | Register user          | ❌   |
| POST   | /api/auth/login             | Login                  | ❌   |
| GET    | /api/auth/me                | Get current user       | ✅   |
| PUT    | /api/auth/update-profile    | Update profile         | ✅   |
| PUT    | /api/auth/change-password   | Change password        | ✅   |

### Products
| Method | Endpoint               | Description                          | Auth        |
|--------|------------------------|--------------------------------------|-------------|
| GET    | /api/products          | List products (filters, pagination)  | ❌          |
| GET    | /api/products/featured | Featured products                    | ❌          |
| GET    | /api/products/:id      | Product detail                       | ❌          |
| POST   | /api/products          | Create product                       | ✅ farmer   |
| PUT    | /api/products/:id      | Update product                       | ✅ farmer   |
| DELETE | /api/products/:id      | Delete product                       | ✅ farmer   |

### Orders
| Method | Endpoint                      | Description              | Auth        |
|--------|-------------------------------|--------------------------|-------------|
| GET    | /api/orders                   | My orders                | ✅          |
| GET    | /api/orders/stats/dashboard   | Dashboard stats          | ✅          |
| GET    | /api/orders/:id               | Order details            | ✅          |
| POST   | /api/orders                   | Place order              | ✅ vendor   |
| PUT    | /api/orders/:id/status        | Update order status      | ✅          |

### Users
| Method | Endpoint                | Description          | Auth |
|--------|-------------------------|----------------------|------|
| GET    | /api/users/farmers      | List farmers         | ❌   |
| GET    | /api/users/:id          | User profile         | ❌   |

### Reviews
| Method | Endpoint                      | Description          | Auth |
|--------|-------------------------------|----------------------|------|
| POST   | /api/reviews                  | Submit review        | ✅   |
| GET    | /api/reviews/product/:id      | Product reviews      | ❌   |
| GET    | /api/reviews/user/:id         | User reviews         | ❌   |

### Notifications
| Method | Endpoint                        | Description               | Auth |
|--------|---------------------------------|---------------------------|------|
| GET    | /api/notifications              | Get my notifications      | ✅   |
| PUT    | /api/notifications/read-all     | Mark all as read          | ✅   |

---

## 🗺 User Flows

### Vendor Flow
1. Register as Vendor → Fill business details
2. Browse Marketplace → Filter by category, state, organic
3. View product detail → Check farmer profile & ratings
4. Add to Cart → Can buy from multiple farmers at once
5. Checkout → Choose delivery type & payment method
6. Track orders → View status updates in real-time
7. Order delivered → Leave review for farmer & product

### Farmer Flow
1. Register as Farmer → Fill farm details & crop types
2. List Products → Add name, price, quantity, harvest date
3. Receive Orders → Get notified when vendor places order
4. Accept/Reject → Decide to fulfil the order
5. Update Status → processing → ready → dispatched → delivered
6. Dashboard → Track revenue, order history, analytics

---

## 🔧 Optional Enhancements

### Cloudinary Image Upload
Add to `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Then add a multer-cloudinary middleware to product routes for real image uploads.

### Email Notifications (Nodemailer)
Add to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🌱 Seed Data (Optional)

To quickly test the app with demo data, create `backend/seed.js`:

```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Create a test farmer
  const farmer = await User.create({
    name: 'Raju Patel', email: 'farmer@test.com', password: 'test123',
    role: 'farmer', farmName: 'Green Valley Farm',
    farmingType: 'organic', cropTypes: ['Tomatoes', 'Onions'],
    farmLocation: { city: 'Nashik', state: 'Maharashtra' }
  });

  // Create a test vendor
  await User.create({
    name: 'Suresh Traders', email: 'vendor@test.com', password: 'test123',
    role: 'vendor', businessName: 'Suresh Fresh Mart',
    businessType: 'retailer',
    businessLocation: { city: 'Mumbai', state: 'Maharashtra' }
  });

  // Create test products
  await Product.create([
    { farmer: farmer._id, name: 'Organic Tomatoes', category: 'vegetables',
      price: 45, unit: 'kg', availableQuantity: 500, isOrganic: true,
      description: 'Fresh organic tomatoes from our certified farm',
      location: { city: 'Nashik', state: 'Maharashtra' }, isFeatured: true },
    { farmer: farmer._id, name: 'Red Onions', category: 'vegetables',
      price: 30, unit: 'kg', availableQuantity: 1000,
      description: 'Premium quality red onions, freshly harvested',
      location: { city: 'Nashik', state: 'Maharashtra' } }
  ]);

  console.log('✅ Seed data created!');
  console.log('Farmer login: farmer@test.com / test123');
  console.log('Vendor login: vendor@test.com / test123');
  process.exit(0);
});
```

Run: `cd backend && node seed.js`

---

## 📱 Screenshots Overview

| Page | Description |
|------|-------------|
| **Homepage** | Hero section, stats bar, how-it-works, categories, featured products |
| **Marketplace** | Left sidebar filters + product grid with search |
| **Product Detail** | Image gallery, farmer info, add-to-cart, reviews |
| **Farmer Profiles** | Grid of farmers with crops, ratings, location |
| **Cart** | Items grouped by farmer with per-farmer subtotals |
| **Checkout** | Delivery method selector, payment options, order summary |
| **Dashboard** | KPI cards, pie + bar charts, recent orders, my products |
| **Orders** | Filterable order list with status action buttons |
| **Order Detail** | Progress tracker, status history, parties, delivery info |

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use and modify for your own projects.

---

Built with ❤️ for Indian farmers & vendors.
