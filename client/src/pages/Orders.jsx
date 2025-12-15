import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const { data } = await axios.get('/api/orders/my-orders', config);
                setOrders(data.orders || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div className="loading">Loading your orders...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="orders-page">
            <div className="orders-container">
                <h1 className="orders-title">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">📦</div>
                        <h2>No orders yet</h2>
                        <p>Looks like you haven't placed any orders yet.</p>
                        <Link to="/products" className="btn-shop">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => {
                            const isDelivered = order.orderStatus === 'delivered';
                            // Non-delivered orders are always expanded by default (unless we want to allow collapsing them too, but logic here implies delivered are special)
                            // We use local state `expandedOrders` to track manual overrides if needed, but for now let's just use a simple toggle for delivered ones.
                            // Actually, let's allow toggling for delivered ones ONLY, as per request.
                            const isExpanded = !isDelivered || expandedOrderId === order._id;

                            return (
                                <div
                                    key={order._id}
                                    className={`order-card ${isDelivered ? 'delivered-card' : ''} ${!isExpanded ? 'collapsed' : ''}`}
                                    onClick={() => {
                                        if (isDelivered) {
                                            setExpandedOrderId(prev => prev === order._id ? null : order._id);
                                        }
                                    }}
                                    style={{ cursor: isDelivered ? 'pointer' : 'default' }}
                                >
                                    <div className="order-header">
                                        <div className="order-id">
                                            <span className="label">Order ID:</span>
                                            <span className="value">#{order._id.substring(0, 8)}...</span>
                                        </div>
                                        <div className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="order-status-container">
                                            <div className={`status-badge ${order.orderStatus}`}>
                                                {order.orderStatus}
                                            </div>
                                            {isDelivered && (
                                                <span className="toggle-icon">
                                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cancellation Info for Cancelled Orders */}
                                    {order.orderStatus === 'cancelled' && (
                                        <div className="cancellation-notice">
                                            <div className="cancellation-icon">⚠️</div>
                                            <div className="cancellation-text">
                                                {order.cancelledBy === 'user'
                                                    ? 'You cancelled this order'
                                                    : 'This order was cancelled by admin'}
                                                {(order.paymentInfo?.status === 'completed' || order.paymentInfo?.status === 'succeeded') && (
                                                    <div className="refund-message">
                                                        ℹ️ Refund process initiated. Funds will be returned within 5-7 business days.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tracking Stepper - Always Visible per request "list with progress bar" */}
                                    {order.orderStatus !== 'cancelled' && (
                                        <div className="tracking-stepper">
                                            <div className="progress-bar-container">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: order.orderStatus === 'delivered' ? '100%' :
                                                            order.orderStatus === 'out-for-delivery' ? '75%' :
                                                                order.orderStatus === 'shipped' ? '60%' :
                                                                    order.orderStatus === 'processing' ? '25%' : '0%'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="steps">
                                                {/* Step 1: Placed */}
                                                <div className="step completed">
                                                    <div className="step-circle">✓</div>
                                                    <div className="step-label">Placed</div>
                                                    <div className="step-time">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </div>

                                                {/* Step 2: Processing */}
                                                <div className={`step ${['shipped', 'out-for-delivery', 'delivered'].includes(order.orderStatus) ? 'completed' :
                                                    order.orderStatus === 'processing' ? 'active' : ''
                                                    }`}>
                                                    <div className="step-circle">
                                                        {['shipped', 'out-for-delivery', 'delivered'].includes(order.orderStatus) ? '✓' : '2'}
                                                    </div>
                                                    <div className="step-label">Processing</div>
                                                </div>

                                                {/* Step 3: Shipped */}
                                                <div className={`step ${['shipped', 'out-for-delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
                                                    <div className="step-circle">
                                                        {['shipped', 'out-for-delivery', 'delivered'].includes(order.orderStatus) ? '✓' : '3'}
                                                    </div>
                                                    <div className="step-label">Shipped</div>
                                                    {order.shippedAt && (
                                                        <div className="step-time">{new Date(order.shippedAt).toLocaleDateString()}</div>
                                                    )}
                                                </div>

                                                {/* Step 4: Out for Delivery */}
                                                <div className={`step ${order.orderStatus === 'delivered' ? 'completed' :
                                                    order.orderStatus === 'out-for-delivery' ? 'active' : ''
                                                    }`}>
                                                    <div className="step-circle">
                                                        {order.orderStatus === 'delivered' ? '✓' : '4'}
                                                    </div>
                                                    <div className="step-label">Out for Delivery</div>
                                                    {order.outForDeliveryAt && (
                                                        <div className="step-time">{new Date(order.outForDeliveryAt).toLocaleDateString()}</div>
                                                    )}
                                                </div>

                                                {/* Step 5: Delivered */}
                                                <div className={`step ${order.orderStatus === 'delivered' ? 'completed' : ''}`}>
                                                    <div className="step-circle">
                                                        {order.orderStatus === 'delivered' ? '✓' : '5'}
                                                    </div>
                                                    <div className="step-label">Delivered</div>
                                                    {order.deliveredAt && (
                                                        <div className="step-time">{new Date(order.deliveredAt).toLocaleDateString()}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Details - Hidden if collapsed */}
                                    {isExpanded && (
                                        <>
                                            <div className="order-items" onClick={(e) => e.stopPropagation()}>
                                                {order.items.map((item) => (
                                                    <div key={item._id} className="order-item">
                                                        <img
                                                            src={item.product?.images?.[0] || 'https://via.placeholder.com/50'}
                                                            alt={item.product?.name}
                                                            className="item-thumb"
                                                        />
                                                        <div className="item-details">
                                                            <Link to={`/products/${item.product?._id}`} className="item-name">
                                                                {item.product?.name}
                                                            </Link>
                                                            <div className="item-meta">
                                                                Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <div className="item-total">
                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="order-footer" onClick={(e) => e.stopPropagation()}>
                                                <div className="order-details-grid">
                                                    <div className="detail-group">
                                                        <h4>Payment Info</h4>
                                                        <div className="payment-info-row">
                                                            <span className="payment-method-badge">{order.paymentInfo?.method || 'Method N/A'}</span>
                                                            <span className={`payment-status-dot ${order.paymentInfo?.status || 'pending'}`}></span>
                                                            <span className="status-text">{order.paymentInfo?.status || 'Pending'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="detail-group">
                                                        <h4>Shipping To</h4>
                                                        <p className="address-text">
                                                            {order.shippingAddress?.street},<br />
                                                            {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                                                        </p>
                                                    </div>
                                                    <div className="order-summary-group">
                                                        <div className="summary-row">
                                                            <span>Subtotal:</span>
                                                            <span>₹{order.itemsPrice?.toFixed(2)}</span>
                                                        </div>
                                                        <div className="summary-row">
                                                            <span>Tax & Handling:</span>
                                                            <span>₹{order.taxPrice?.toFixed(2)}</span>
                                                        </div>
                                                        <div className="summary-row">
                                                            <span>Shipping:</span>
                                                            <span>₹{order.shippingPrice?.toFixed(2)}</span>
                                                        </div>
                                                        <div className="summary-row total">
                                                            <span>Total:</span>
                                                            <span>₹{order.totalPrice?.toFixed(2)}</span>
                                                        </div>

                                                        {/* Cancel Button */}
                                                        {order.orderStatus === 'processing' && (
                                                            <button
                                                                className="btn-cancel-order"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation(); // Prevent toggling
                                                                    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                                                                        try {
                                                                            const token = localStorage.getItem('token');
                                                                            await axios.put(`/api/orders/${order._id}/cancel`, {}, {
                                                                                headers: { Authorization: `Bearer ${token}` }
                                                                            });
                                                                            // Refresh orders
                                                                            const { data } = await axios.get('/api/orders/my-orders', {
                                                                                headers: { Authorization: `Bearer ${token}` }
                                                                            });
                                                                            setOrders(data.orders || []);
                                                                        } catch (err) {
                                                                            alert(err.response?.data?.message || 'Failed to cancel order');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
