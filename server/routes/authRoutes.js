const express = require('express');
const {
    register,
    login,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
    toggleWishlist,
    getWishlist,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/wishlist', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

module.exports = router;
