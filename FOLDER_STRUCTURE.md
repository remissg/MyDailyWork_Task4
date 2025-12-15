# E-Commerce Project Structure

## 🌲 Directory Tree

```
E Comerce/
│
├── 📂 client/                              # React Frontend Application
│   ├── 📂 public/                          # Static assets
│   │   └── vite.svg
│   ├── 📂 src/
│   │   ├── 📂 assets/                      # Global static assets
│   │   ├── 📂 components/                  # Reusable UI Components
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Toast.jsx
│   │   ├── 📂 context/                     # React Context Providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── 📂 pages/                       # Application Pages
│   │   │   ├── AdminDashboard.jsx          # Admin management area
│   │   │   ├── Cart.jsx                    # Shopping cart view
│   │   │   ├── Checkout.jsx                # Payment & Shipping form
│   │   │   ├── Contact.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Home.jsx                    # Landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Orders.jsx                  # User order history
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── ProductDetails.jsx          # Single product view
│   │   │   ├── Products.jsx                # Product listing & filters
│   │   │   ├── Profile.jsx                 # User profile
│   │   │   ├── Register.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── 📂 services/                    # API Integration
│   │   │   ├── api.js                      # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   └── productService.js
│   │   ├── 📂 utils/                       # Frontend utilities
│   │   ├── App.jsx                         # Main Routing Config
│   │   ├── main.jsx                        # Entry point
│   │   └── index.css                       # Global Tailwind/CSS styles
│   ├── package.json
│   └── vite.config.js
│
├── 📂 server/                              # Node.js Express Backend
│   ├── 📂 config/                          # Configuration
│   │   ├── .env                            # Environment variables (GitIgnored)
│   │   └── db.js                           # MongoDB connection
│   ├── 📂 controllers/                     # Request Handlers
│   │   ├── adminCartController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── productController.js
│   ├── 📂 middleware/                      # Express Middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── 📂 models/                          # Mongoose Schemas
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── 📂 routes/                          # API Route Definitions
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── productRoutes.js
│   ├── 📂 utils/                           # Backend helpers
│   │   └── seeder.js
│   ├── server.js                           # Server Entry Point
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔍 Key Directories Explained

### Client (Frontend)
- **`src/pages/`**: Contains all the full-page components mapped to routes.
- **`src/components/`**: Reusable smaller UI pieces like Buttons, Navbars, and Cards.
- **`src/context/`**: Manages global state like User Auth and Shopping Cart data.
- **`src/services/`**: Handles all HTTP requests to the backend API.

### Server (Backend)
- **`controllers/`**: The "brain" of the API. Contains the logic for what happens when a route is hit.
- **`models/`**: Defines the structure of data in the MongoDB database (Schemas).
- **`routes/`**: Maps URL endpoints (e.g., `/api/products`) to specific controllers.
- **`middleware/`**: Functions that run before controllers, mostly for Authentication check.
