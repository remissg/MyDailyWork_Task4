import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const { cart, updateQuantity, removeItem, cartTotal, loading } = useCart();
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [allCarts, setAllCarts] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);

    // Fetch all carts for admin
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAllCarts();
        }
    }, [user]);

    const fetchAllCarts = async () => {
        try {
            setAdminLoading(true);
            const response = await fetch('/api/cart/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setAllCarts(data.carts || []);
        } catch (error) {
            console.error('Failed to fetch all carts:', error);
        } finally {
            setAdminLoading(false);
        }
    };

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemove(itemId);
            return;
        }
        try {
            await updateQuantity(itemId, newQuantity);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update quantity', 'error');
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await removeItem(itemId);
            // Optionally show success toast for removal
            // showToast('Item removed from cart', 'info');
        } catch (error) {
            showToast('Failed to remove item', 'error');
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };



    // Admin View - Show all users' carts
    if (user?.role === 'admin') {
        return (
            <div className="cart-page">
                <div className="cart-container">
                    <h1 className="cart-title">All Users' Carts (Admin View)</h1>
                    <p className="admin-notice">
                        ℹ️ As an admin, you can view all users' shopping carts but cannot make purchases.
                        <Link to="/admin" className="link-admin"> Go to Admin Dashboard →</Link>
                    </p>

                    {adminLoading ? (
                        <div className="loading">Loading all carts...</div>
                    ) : allCarts.length === 0 ? (
                        <div className="empty-cart">
                            <p>No users have items in their carts yet.</p>
                        </div>
                    ) : (
                        <div className="admin-carts-view">
                            {allCarts.map((userCart) => (
                                <div key={userCart._id} className="user-cart-section">
                                    <div className="user-cart-header">
                                        <h3>👤 {userCart.user?.name || 'Unknown User'}</h3>
                                        <p className="user-email">{userCart.user?.email}</p>
                                        <p className="cart-stats">
                                            {userCart.totalItems} items • ₹{userCart.totalPrice?.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="user-cart-items">
                                        {userCart.items?.map((item) => (
                                            <div key={item._id} className="admin-cart-item">
                                                <img
                                                    src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                                                    alt={item.product?.name}
                                                    className="item-thumb"
                                                />
                                                <div className="item-info">
                                                    <p className="item-name">{item.product?.name}</p>
                                                    <p className="item-details">
                                                        Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="item-total">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Regular User View - Normal cart functionality
    if (loading) {
        return <div className="loading">Loading cart...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="empty-cart">
                <div className="empty-cart-content">
                    <div className="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                    <Link to="/products" className="btn-shop">Continue Shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <h1 className="cart-title">Shopping Cart</h1>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cart.items.map((item) => (
                            <div key={item._id} className="cart-item">
                                <img
                                    src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
                                    alt={item.product?.name}
                                    className="cart-item-image"
                                />

                                <div className="cart-item-info">
                                    <Link
                                        to={`/products/${item.product?._id}`}
                                        className="cart-item-name"
                                    >
                                        {item.product?.name}
                                    </Link>
                                    <div className="cart-item-price">₹{item.price?.toFixed(2)}</div>
                                    {item.product?.stock < 5 && (
                                        <div className="low-stock">Only {item.product.stock} left in stock</div>
                                    )}
                                </div>

                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                            className="qty-btn"
                                        >
                                            -
                                        </button>
                                        <span className="qty-display">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                            className="qty-btn"
                                            disabled={item.quantity >= item.product?.stock}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-item-total">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>

                                    <button
                                        onClick={() => handleRemove(item._id)}
                                        className="btn-remove"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        <div className="summary-row">
                            <span>Subtotal ({cart.totalItems} items)</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{cartTotal >= 499 ? 'FREE' : '₹40.00'}</span>
                        </div>

                        <div className="summary-row">
                            <span>Tax & Handling</span>
                            <span>₹{((Math.round(cartTotal) % 5) + 6).toFixed(2)}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>
                                ₹{(cartTotal + (cartTotal >= 499 ? 0 : 40) + ((Math.round(cartTotal) % 5) + 6)).toFixed(2)}
                            </span>
                        </div>

                        <div className="cart-actions">
                            <button onClick={handleCheckout} className="btn-checkout">
                                Proceed to Checkout
                            </button>

                            <Link to="/products" className="btn-continue">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
