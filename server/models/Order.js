const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                image: String,
            },
        ],
        shippingAddress: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            zipCode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
                default: 'USA',
            },
        },
        paymentInfo: {
            method: {
                type: String,
                required: true,
                default: 'stripe',
            },
            transactionId: String,
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed'],
                default: 'pending',
            },
            paidAt: Date,
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        orderStatus: {
            type: String,
            enum: ['processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'],
            default: 'processing',
        },
        cancelledBy: {
            type: String,
            enum: ['user', 'admin'],
        },
        shippedAt: Date,
        outForDeliveryAt: Date,
        deliveredAt: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Order', orderSchema);
