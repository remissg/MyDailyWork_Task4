const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentInfo } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty',
            });
        }

        // 1. Verify availability for ALL items first
        const productUpdates = [];
        const orderItems = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product.name} not found`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }

            // Store product and quantity for later update
            productUpdates.push({ product, quantity: item.quantity });

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                image: product.images[0],
            });
        }

        // 2. All validations passed, now deduct stock
        for (const update of productUpdates) {
            update.product.stock -= update.quantity;
            await update.product.save();
        }

        // 3. Save Address if requested
        if (req.body.saveAddress) {
            const user = await User.findById(req.user.id);
            if (user) {
                // Check if address already exists to avoid duplicates
                const addressExists = user.addresses.some(addr =>
                    addr.street === shippingAddress.street &&
                    addr.city === shippingAddress.city &&
                    addr.zipCode === shippingAddress.zipCode
                );

                if (!addressExists) {
                    user.addresses.push(shippingAddress);
                    await user.save();
                }
            }
        }

        // Calculate prices
        const itemsPrice = cart.totalPrice;
        const shippingPrice = itemsPrice >= 499 ? 0 : 40; // Free shipping if 499 or more
        const taxPrice = (Math.round(itemsPrice) % 5) + 6; // Handling fee range 6-10
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        // Create order
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentInfo,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Check if user owns the order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order',
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.orderStatus = orderStatus;

        // Set timestamps for status changes
        if (orderStatus === 'shipped') {
            order.shippedAt = Date.now();
        } else if (orderStatus === 'out-for-delivery') {
            order.outForDeliveryAt = Date.now();
        } else if (orderStatus === 'delivered') {
            order.deliveredAt = Date.now();
        } else if (orderStatus === 'cancelled') {
            order.cancelledBy = 'admin';
        }

        await order.save();

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update payment status (Admin)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.paymentInfo) {
            order.paymentInfo.status = status;
            if (status === 'completed' || status === 'paid') {
                order.paymentInfo.paidAt = Date.now();
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
        }

        if (order.orderStatus !== 'processing') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage',
            });
        }

        order.orderStatus = 'cancelled';
        order.cancelledBy = 'user';
        await order.save();

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
