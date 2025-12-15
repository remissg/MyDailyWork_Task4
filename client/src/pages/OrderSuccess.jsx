import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const { fetchCart } = useCart();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/payment/verify-session?session_id=${sessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                console.log('Payment verification:', data);
                // Refresh cart to reflect empty state
                await fetchCart();
            } catch (error) {
                console.error('Error verifying payment:', error);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="order-success-page">
                <div className="loading">Processing your order...</div>
            </div>
        );
    }

    return (
        <div className="order-success-page">
            <div className="success-container">
                <div className="success-icon">✅</div>

                <h1>Order Placed Successfully!</h1>
                <p className="success-message">
                    Thank you for your purchase. Your order has been confirmed and will be processed soon.
                </p>

                {sessionId && (
                    <div className="session-info">
                        <p className="session-id">
                            Session ID: <span>{sessionId.substring(0, 20)}...</span>
                        </p>
                    </div>
                )}

                <div className="order-details">
                    <div className="detail-card">
                        <div className="detail-icon">📦</div>
                        <h3>Order Processing</h3>
                        <p>We're preparing your items for shipment</p>
                    </div>

                    <div className="detail-card">
                        <div className="detail-icon">📧</div>
                        <h3>Confirmation Email</h3>
                        <p>Check your inbox for order details</p>
                    </div>

                    <div className="detail-card">
                        <div className="detail-icon">🚚</div>
                        <h3>Estimated Delivery</h3>
                        <p>5-7 business days</p>
                    </div>
                </div>

                <div className="success-actions">
                    <Link to="/products" className="btn-continue">
                        Continue Shopping
                    </Link>
                    <Link to="/orders/my-orders" className="btn-track">
                        Track Your Order
                    </Link>
                </div>

                <div className="next-steps">
                    <h3>What's Next?</h3>
                    <ul>
                        <li>✅ You'll receive an email confirmation shortly</li>
                        <li>📦 Your order is being processed</li>
                        <li>🚚 You'll get tracking info when shipped</li>
                        <li>💳 Payment receipt sent to your email</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
