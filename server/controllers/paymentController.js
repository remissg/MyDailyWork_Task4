const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-session
// @access  Private
exports.createCheckoutSession = async (req, res) => {
    try {
        const { items, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items provided',
            });
        }

        // Fetch product details and create line items
        const lineItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            lineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: product.name,
                        description: product.description.substring(0, 100),
                        images: product.images.length > 0 ? [product.images[0]] : [],
                    },
                    unit_amount: Math.round(product.price * 100), // Convert to paise
                },
                quantity: item.quantity,
            });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cart`,
            customer_email: req.user.email,
            client_reference_id: req.user.id,
            metadata: {
                userId: req.user.id,
                items: JSON.stringify(items),
                shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
            },
            payment_intent_data: {
                shipping: {
                    name: shippingAddress.name || req.user.name,
                    address: {
                        line1: shippingAddress.street,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        postal_code: shippingAddress.zipCode,
                        country: 'IN', // Use 'IN' for India, or map from shippingAddress.country
                    },
                },
                description: `Export transaction for order by ${req.user.name}`,
            },
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create payment intent (alternative method)
// @route   POST /api/payment/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'inr',
            metadata: {
                userId: req.user.id,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/payment/webhook
// @access  Public (Stripe only)
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Checkout session completed:', session.id);

                // Create order from session metadata
                if (session.metadata && session.metadata.userId) {
                    const items = JSON.parse(session.metadata.items);
                    const shippingAddress = session.metadata.shippingAddress
                        ? JSON.parse(session.metadata.shippingAddress)
                        : null;

                    // Fetch product details for order
                    const orderItems = [];
                    let itemsPrice = 0;

                    for (const item of items) {
                        const product = await Product.findById(item.productId);
                        if (product) {
                            // Deduct stock
                            product.stock -= item.quantity;
                            await product.save();

                            orderItems.push({
                                product: product._id,
                                name: product.name,
                                quantity: item.quantity,
                                price: product.price,
                                image: product.images[0],
                            });

                            itemsPrice += product.price * item.quantity;
                        }
                    }

                    // Calculate prices
                    const shippingPrice = itemsPrice > 100 ? 0 : 10;
                    const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
                    const totalPrice = itemsPrice + shippingPrice + taxPrice;

                    // Create order
                    await Order.create({
                        user: session.metadata.userId,
                        items: orderItems,
                        shippingAddress: shippingAddress || {
                            street: 'N/A',
                            city: 'N/A',
                            state: 'N/A',
                            zipCode: 'N/A',
                            country: 'N/A',
                        },
                        paymentInfo: {
                            method: 'stripe',
                            transactionId: session.payment_intent,
                            status: 'completed',
                            paidAt: new Date(),
                        },
                        itemsPrice,
                        shippingPrice,
                        taxPrice,
                        totalPrice,
                        orderStatus: 'processing',
                    });

                    // Clear the user's cart after successful order
                    const Cart = require('../models/Cart');
                    const cart = await Cart.findOne({ user: session.metadata.userId });
                    if (cart) {
                        cart.items = [];
                        await cart.save();
                        console.log('Cart cleared for user:', session.metadata.userId);
                    }

                    console.log('Order created successfully from Stripe session');
                }
                break;

            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('PaymentIntent was successful:', paymentIntent.id);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Verify Stripe Session and Create Order if needed
// @route   GET /api/payment/verify-session
// @access  Private
exports.verifyStripeSession = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ success: false, message: 'Session ID is required' });
        }

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Payment not completed' });
        }

        // Check if order already exists
        const existingOrder = await Order.findOne({ 'paymentInfo.transactionId': session.payment_intent });

        if (existingOrder) {
            return res.status(200).json({ success: true, orderId: existingOrder._id, message: 'Order already exists' });
        }

        // Create order if it doesn't exist (Backup for Webhook failure)
        if (session.metadata && session.metadata.userId) {
            const items = JSON.parse(session.metadata.items);
            const shippingAddress = session.metadata.shippingAddress
                ? JSON.parse(session.metadata.shippingAddress)
                : null;

            const orderItems = [];
            let itemsPrice = 0;

            for (const item of items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    orderItems.push({
                        product: product._id,
                        name: product.name,
                        quantity: item.quantity,
                        price: product.price,
                        image: product.images[0],
                    });

                    itemsPrice += product.price * item.quantity;
                }
            }

            const shippingPrice = itemsPrice >= 499 ? 0 : 40;
            const taxPrice = (Math.round(itemsPrice) % 5) + 6;
            const totalPrice = itemsPrice + shippingPrice + taxPrice;

            const newOrder = await Order.create({
                user: session.metadata.userId,
                items: orderItems,
                shippingAddress: shippingAddress || {
                    street: 'N/A', city: 'N/A', state: 'N/A', zipCode: 'N/A', country: 'IN'
                },
                paymentInfo: {
                    method: 'stripe',
                    transactionId: session.payment_intent,
                    status: 'completed',
                    paidAt: new Date(),
                },
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
                orderStatus: 'processing',
            });

            // Clear cart
            const Cart = require('../models/Cart');
            const cart = await Cart.findOne({ user: session.metadata.userId });
            if (cart) {
                cart.items = [];
                await cart.save();
            }

            return res.status(201).json({ success: true, orderId: newOrder._id, message: 'Order created successfully' });
        }

        res.status(400).json({ success: false, message: 'Invalid session metadata' });

    } catch (error) {
        console.error('Verify session error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
