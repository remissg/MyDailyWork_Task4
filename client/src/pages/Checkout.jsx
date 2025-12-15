import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
    const { cart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saveAddress, setSaveAddress] = useState(true);

    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
    });

    const [contactInfo, setContactInfo] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
    });

    // Auto-fill address if available
    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0) {
            const lastAddress = user.addresses[user.addresses.length - 1]; // Use most recent
            setShippingAddress({
                street: lastAddress.street || '',
                city: lastAddress.city || '',
                state: lastAddress.state || '',
                zipCode: lastAddress.zipCode || '',
                country: lastAddress.country || 'India',
            });
        }
    }, [user]);

    const [paymentMethod, setPaymentMethod] = useState('Card');

    const handleAddressChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    const handleContactChange = (e) => {
        setContactInfo({
            ...contactInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleCODCheckout = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify({
                    shippingAddress,
                    saveAddress,
                    paymentInfo: {
                        method: 'COD',
                        status: 'pending',
                        transactionId: `COD-${Date.now()}`
                    }
                }),
            });

            const data = await response.json();

            if (data.success) {
                navigate('/order-success');
            } else {
                setError(data.message || 'Failed to place order');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleStripeCheckout = async () => {
        setLoading(true);
        setError('');

        try {
            // Prepare cart items for Stripe
            const items = cart.items.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
            }));

            // Call your payment API
            const response = await fetch('/api/payment/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    items,
                    shippingAddress,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                setError(data.message || 'Failed to create checkout session');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error('Checkout error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate contact information
        if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
            setError('Please fill in all contact information fields');
            return;
        }

        // Validate shipping address
        if (!shippingAddress.street || !shippingAddress.city ||
            !shippingAddress.state || !shippingAddress.zipCode) {
            setError('Please fill in all shipping address fields');
            return;
        }

        if (paymentMethod === 'COD') {
            handleCODCheckout();
        } else {
            // For UPI, NetBanking, and Card, we currently route to Stripe
            // In a real app, you might have specific gateways for each
            handleStripeCheckout();
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <div className="empty-checkout">
                <h2>Your cart is empty</h2>
                <p>Add some items before checking out</p>
                <button onClick={() => navigate('/products')} className="btn-shop">
                    Continue Shopping
                </button>
            </div>
        );
    }

    const shippingPrice = cartTotal >= 499 ? 0 : 40;
    const taxPrice = (Math.round(cartTotal) % 5) + 6;
    const totalPrice = (cartTotal + shippingPrice + parseFloat(taxPrice)).toFixed(2);

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1 className="checkout-title">Checkout</h1>

                <div className="checkout-content">
                    {/* Shipping Form */}
                    <div className="checkout-form">
                        <h2>Shipping Address</h2>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Contact Information */}
                            <h3>Contact Information</h3>

                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={contactInfo.name}
                                    onChange={handleContactChange}
                                    placeholder="Rajesh Kumar"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={contactInfo.email}
                                        onChange={handleContactChange}
                                        placeholder="rajesh.kumar@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={contactInfo.phone}
                                        onChange={handleContactChange}
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                            </div>

                            <h3 style={{ marginTop: '2rem' }}>Shipping Address</h3>

                            <div className="form-group">
                                <label htmlFor="street">Street Address</label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={shippingAddress.street}
                                    onChange={handleAddressChange}
                                    placeholder="123 MG Road, Andheri West"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={shippingAddress.city}
                                        onChange={handleAddressChange}
                                        placeholder="Mumbai"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="state">State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={shippingAddress.state}
                                        onChange={handleAddressChange}
                                        placeholder="Maharashtra"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="zipCode">PIN Code</label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={shippingAddress.zipCode}
                                        onChange={handleAddressChange}
                                        placeholder="400058"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country">Country</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={shippingAddress.country}
                                        onChange={handleAddressChange}
                                        placeholder="India"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            {/* Payment Method Selection */}
                            <div className="payment-method-section">
                                <h2>Select Payment Method</h2>
                                <div className="payment-options">
                                    <div className={`payment-card ${paymentMethod === 'Card' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('Card')}>
                                        <div className="payment-icon-wrapper">
                                            <span className="payment-icon">💳</span>
                                        </div>
                                        <div className="payment-info">
                                            <h3>Credit / Debit Card</h3>
                                            <p>Secure payment via Stripe</p>
                                        </div>
                                        <div className="radio-circle">
                                            {paymentMethod === 'Card' && <div className="radio-dot"></div>}
                                        </div>
                                    </div>

                                    <div className={`payment-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('COD')}>
                                        <div className="payment-icon-wrapper">
                                            <span className="payment-icon">💵</span>
                                        </div>
                                        <div className="payment-info">
                                            <h3>Cash on Delivery</h3>
                                            <p>Pay when you receive</p>
                                        </div>
                                        <div className="radio-circle">
                                            {paymentMethod === 'COD' && <div className="radio-dot"></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-checkout-submit"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment')}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-items">
                            {cart.items.map((item) => (
                                <div key={item._id} className="summary-item">
                                    <img
                                        src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                                        alt={item.product?.name}
                                    />
                                    <div className="item-details">
                                        <p className="item-name">{item.product?.name}</p>
                                        <p className="item-quantity">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}</span>
                        </div>

                        <div className="summary-row">
                            <span>Tax & Handling</span>
                            <span>₹{taxPrice}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>₹{totalPrice}</span>
                        </div>

                        {cartTotal >= 499 && (
                            <div className="free-shipping-notice">
                                🎉 You qualify for FREE shipping!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
