const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require('../controllers/cartController');
const { getAllCarts } = require('../controllers/adminCartController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin route - must be before protect middleware
router.get('/all', protect, authorize('admin'), getAllCarts);

// All other cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
