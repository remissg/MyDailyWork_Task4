const Cart = require('../models/Cart');

// @desc    Get all carts (Admin only)
// @route   GET /api/cart/all
// @access  Private/Admin
exports.getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price images stock');

        res.status(200).json({
            success: true,
            count: carts.length,
            carts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
