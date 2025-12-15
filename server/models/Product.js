const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide product name'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide product description'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide product price'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Please provide product category'],
            enum: {
                values: [
                    'Electronics',
                    'Clothing',
                    'Home & Garden',
                    'Sports & Outdoors',
                    'Books',
                    'Toys & Games',
                    'Health & Beauty',
                    'Automotive',
                    'Food & Grocery',
                    'Other',
                ],
                message: 'Please select a valid category',
            },
        },
        brand: {
            type: String,
            trim: true,
        },
        stock: {
            type: Number,
            required: [true, 'Please provide stock quantity'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        ratings: {
            average: {
                type: Number,
                default: 0,
                min: [0, 'Rating must be at least 0'],
                max: [5, 'Rating cannot exceed 5'],
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                name: String,
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                comment: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        isFeatured: {
            type: Boolean,
            default: false,
        },
        specifications: {
            type: Map,
            of: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
