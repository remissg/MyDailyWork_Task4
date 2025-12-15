const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One cart per user
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity must be at least 1'],
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        totalItems: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate total price before saving
cartSchema.pre('save', function (next) {
    this.totalPrice = this.items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    this.totalItems = this.items.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    next();
});

module.exports = mongoose.model('Cart', cartSchema);
