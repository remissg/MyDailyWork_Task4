<div align="center">
  <h1>🐝 BuyHive</h1>
  <p><strong>A Modern, Full-Stack E-Commerce Experience</strong></p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-documentation">API</a> •
    <a href="#-license">License</a>
  </p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
  ![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
  ![Status](https://img.shields.io/badge/status-active-success.svg?style=flat-square)
</div>

<br />

## 📖 About The Project

**BuyHive** is a premium, fully responsive E-Commerce application built with the MERN stack. It offers a seamless shopping experience with features like user authentication, product search & filtering, shopping cart management, secure checkout with Stripe, and a comprehensive admin dashboard.

Designed with a focus on UI/UX, BuyHive features a clean, modern aesthetic with smooth animations and intuitive navigation.

---

## ✨ Features

### 🛒 Customer Experience
- **Authentication**: Secure Login/Register with JWT & Email Verification.
- **Product Discovery**: Advanced search, filtering by category/price, and sorting.
- **Shopping Cart**: Real-time cart management with local storage persistence.
- **Checkout**: Secure payment integration via Stripe.
- **User Dashboard**: View order history, manage profile, and wishlist.
- **Reviews**: Leave ratings and reviews on products.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

### 🛡️ Admin Dashboard
- **Product Management**: Create, update, and delete products (with image uploads).
- **Order Management**: View and process customer orders.
- **User Management**: Manage user roles and permissions.
- **Analytics**: Overview of sales and inventory status.

---

## 🛠 Tech Stack

### Frontend
- ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) **React 18**
- ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) **Vite**
- ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) **Tailwind CSS**
- ![React Router](https://img.shields.io/badge/-React%20Router-CA4245?style=flat-square&logo=react-router&logoColor=white) **React Router DOM**

### Backend
- ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) **Node.js**
- ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) **Express.js**
- ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) **MongoDB (Mongoose)**
- ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white) **JSON Web Tokens**

### Tools & Services
- ![Stripe](https://img.shields.io/badge/-Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white) **Stripe Payments**
- ![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white) **Cloudinary (Images)**
- ![Nodemailer](https://img.shields.io/badge/-Nodemailer-007FFF?style=flat-square&logo=minutemailer&logoColor=white) **Nodemailer**

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- NPM or Yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/buyhive.git
    cd buyhive
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

Create a `.env` file in the `server/config` directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/buyhive

# Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
FROM_EMAIL=noreply@buyhive.com
FROM_NAME=BuyHive

# Client
CLIENT_URL=http://localhost:5173
```

### Running the App

**Development Mode (Run both Server & Client):**

Open two terminal tabs:

**Tab 1 (Server):**
```bash
cd server
npm run dev
```

**Tab 2 (Client):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to view the application.

---

## 📂 Project Structure

```bash
buyhive/
├── client/                 # React Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── content/        # Context Providers (Auth, Cart, etc.)
│   │   ├── pages/          # Application Pages
│   │   ├── services/       # API Service calls
│   │   └── utils/          # Helper functions
│   └── ...
├── server/                 # Node.js Backend
│   ├── config/             # Database & Env config
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth & Error handling
│   ├── models/             # Mongoose Models
│   ├── routes/             # API Routes
│   ├── utils/              # Seeder & Helpers
│   └── ...
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br />
  <p>Made with ❤️ by <a href="https://github.com/remissg">Joydip Maiti</a></p>
</div>
