const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate(
            'items.product',
            'name price images stock'
        );

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({
                user: req.user.id,
                items: [],
            });
        }

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: [],
            });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
            });
        }

        await cart.save();

        // Populate product details
        cart = await cart.populate('items.product', 'name price images stock');

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        const item = cart.items.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }

        // Check stock
        const product = await Product.findById(item.product);
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
            });
        }

        item.quantity = quantity;
        await cart.save();

        await cart.populate('items.product', 'name price images stock');

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== req.params.itemId
        );

        await cart.save();
        await cart.populate('items.product', 'name price images stock');

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
