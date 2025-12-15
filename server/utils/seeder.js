const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

// Load env vars
dotenv.config({ path: './config/.env' });

// Sample products data
const products = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
        price: 199.99,
        category: 'Electronics',
        brand: 'AudioTech',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        ratings: { average: 4.5, count: 128 },
        isFeatured: true,
    },
    {
        name: 'Smart Watch Pro',
        description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Track your health and stay connected.',
        price: 299.99,
        category: 'Electronics',
        brand: 'TechWear',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
        ratings: { average: 4.7, count: 95 },
        isFeatured: true,
    },
    {
        name: 'Running Shoes - Air Zoom',
        description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Designed for performance and comfort.',
        price: 129.99,
        category: 'Sports & Outdoors',
        brand: 'Nike',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        ratings: { average: 4.6, count: 210 },
        isFeatured: true,
    },
    {
        name: 'Yoga Mat Premium',
        description: 'Extra thick exercise mat with excellent cushioning and non-slip surface. Perfect for yoga, pilates, and fitness.',
        price: 39.99,
        category: 'Sports & Outdoors',
        brand: 'FitLife',
        stock: 75,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
        ratings: { average: 4.4, count: 156 },
    },
    {
        name: 'Men\'s Cotton T-Shirt',
        description: 'Classic fit cotton t-shirt available in multiple colors. Soft, comfortable, and perfect for everyday wear.',
        price: 24.99,
        category: 'Clothing',
        brand: 'ClassicWear',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        ratings: { average: 4.3, count: 340 },
    },
    {
        name: 'Women\'s Denim Jeans',
        description: 'Slim fit stretch denim jeans with classic 5-pocket styling. Comfortable and stylish for any occasion.',
        price: 79.99,
        category: 'Clothing',
        brand: 'DenimCo',
        stock: 80,
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        ratings: { average: 4.5, count: 187 },
    },
    {
        name: 'Coffee Maker Deluxe',
        description: 'Programmable coffee maker with 12-cup capacity, thermal carafe, and auto-brew feature. Wake up to fresh coffee.',
        price: 89.99,
        category: 'Home & Garden',
        brand: 'BrewMaster',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
        ratings: { average: 4.6, count: 92 },
        isFeatured: true,
    },
    {
        name: 'Vacuum Cleaner Robot',
        description: 'Smart robot vacuum with app control, mapping technology, and automatic charging. Keeps your home spotless.',
        price: 349.99,
        category: 'Home & Garden',
        brand: 'CleanBot',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500'],
        ratings: { average: 4.8, count: 156 },
        isFeatured: true,
    },
    {
        name: 'The Complete JavaScript Guide',
        description: 'Comprehensive guide to modern JavaScript programming. From basics to advanced concepts with practical examples.',
        price: 49.99,
        category: 'Books',
        brand: 'TechBooks',
        stock: 150,
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
        ratings: { average: 4.7, count: 289 },
    },
    {
        name: 'Kids Building Blocks Set',
        description: '500-piece colorful building blocks set. Encourages creativity and develops motor skills. Safe for ages 3+.',
        price: 34.99,
        category: 'Toys & Games',
        brand: 'PlayTime',
        stock: 120,
        images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'],
        ratings: { average: 4.5, count: 203 },
    },
    {
        name: 'Moisturizing Face Cream',
        description: 'Hydrating face cream with hyaluronic acid and vitamin E. Suitable for all skin types. Dermatologist tested.',
        price: 29.99,
        category: 'Health & Beauty',
        brand: 'GlowSkin',
        stock: 90,
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'],
        ratings: { average: 4.4, count: 178 },
    },
    {
        name: 'Gaming Mouse RGB',
        description: 'High-precision gaming mouse with customizable RGB lighting, 16000 DPI, and programmable buttons.',
        price: 59.99,
        category: 'Electronics',
        brand: 'GameGear',
        stock: 60,
        images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
        ratings: { average: 4.6, count: 145 },
        isFeatured: true,
    },
];

// Seed function
const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany();
        await Product.deleteMany();

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@ecommerce.com',
            password: 'admin123',
            role: 'admin',
        });
        console.log(`✅ Admin created: ${admin.email} / admin123`);

        // Create regular user
        console.log('👤 Creating test user...');
        const user = await User.create({
            name: 'Test User',
            email: 'user@ecommerce.com',
            password: 'user123',
            role: 'user',
        });
        console.log(`✅ User created: ${user.email} / user123`);

        // Create products
        console.log('📦 Creating products...');
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} products created`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: 2 (1 admin, 1 regular user)`);
        console.log(`   Products: ${createdProducts.length}`);
        console.log(`   Featured Products: ${products.filter(p => p.isFeatured).length}`);
        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: admin@ecommerce.com / admin123');
        console.log('   User:  user@ecommerce.com / user123');
        console.log('\n✨ Ready to test your E-Commerce app!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
