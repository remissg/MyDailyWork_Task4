const express = require('express');
const {
    createCheckoutSession,
    createPaymentIntent,
    stripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-session', protect, createCheckoutSession);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/webhook', stripeWebhook); // No auth - Stripe calls this
router.get('/verify-session', protect, require('../controllers/paymentController').verifyStripeSession);

module.exports = router;
