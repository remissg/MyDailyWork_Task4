import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        revenue: 0,
        ordersCount: 0,
        productsCount: 0,
        cartsCount: 0
    });
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [carts, setCarts] = useState([]); // New state for carts
    const [loading, setLoading] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [selectedCart, setSelectedCart] = useState(null); // State for selected cart details
    const [showCartModal, setShowCartModal] = useState(false); // State for cart modal visibility
    const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order details
    const [showOrderModal, setShowOrderModal] = useState(false); // State for order modal visibility
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        descriptionPoints: [''],
        price: '',
        category: 'Electronics',
        brand: '',
        stock: '',
        images: [''],
    });

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    // Read tab from URL query params
    // Read tab from URL query params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'overview' || tab === 'products' || tab === 'orders' || tab === 'carts') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Fetch products, orders, or carts based on active tab
    useEffect(() => {
        if (activeTab === 'products') {
            fetchProducts();
        } else if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'carts') {
            fetchCarts();
        } else if (activeTab === 'overview') {
            fetchOverviewData();
        }
    }, [activeTab]);

    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            const [productsData, ordersRes, cartsRes] = await Promise.all([
                productService.getProducts({}),
                fetch('/api/orders', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('/api/cart/all', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const ordersData = await ordersRes.json();
            const cartsData = await cartsRes.json();

            const fetchedProducts = productsData.products || [];
            const fetchedOrders = ordersData.orders || [];
            const fetchedCarts = cartsData.carts || [];

            setProducts(fetchedProducts);
            setOrders(fetchedOrders);
            setCarts(fetchedCarts);

            // Calculate Stats
            const revenue = fetchedOrders
                .filter(o => o.orderStatus !== 'cancelled')
                .reduce((acc, order) => acc + (order.totalPrice || 0), 0);

            setStats({
                revenue,
                ordersCount: fetchedOrders.length,
                productsCount: fetchedProducts.length,
                cartsCount: fetchedCarts.filter(c => c.items && c.items.length > 0).length
            });

        } catch (error) {
            console.error('Failed to fetch overview data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts({});
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            alert('Error fetching products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            // Optimistic update
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, orderStatus: newStatus } : order
            ));

            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ orderStatus: newStatus }),
            });

            const data = await response.json();

            if (!data.success) {
                // Revert if failed
                fetchOrders();
                alert(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            fetchOrders();
            alert('Error updating status');
        }
    };

    const handlePaymentUpdate = async (orderId) => {
        if (!confirm('Mark this payment as Received/Completed?')) return;

        try {
            const response = await fetch(`/api/orders/${orderId}/payment`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: 'completed' }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Payment marked as completed');
                fetchOrders();
                setShowOrderModal(false);
            } else {
                alert(data.message || 'Failed to update payment');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Error updating payment');
        }
    };

    const fetchCarts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/cart/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setCarts(data.carts || []);
        } catch (error) {
            console.error('Failed to fetch carts:', error);
            alert('Error fetching carts');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const handleDescriptionPointChange = (index, value) => {
        const newPoints = [...formData.descriptionPoints];
        newPoints[index] = value;
        setFormData({ ...formData, descriptionPoints: newPoints });
    };

    const addDescriptionPoint = () => {
        setFormData({ ...formData, descriptionPoints: [...formData.descriptionPoints, ''] });
    };

    const removeDescriptionPoint = (index) => {
        const newPoints = formData.descriptionPoints.filter((_, i) => i !== index);
        setFormData({ ...formData, descriptionPoints: newPoints.length > 0 ? newPoints : [''] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                images: formData.images.filter(img => img.trim() !== ''),
                descriptionPoints: formData.descriptionPoints.filter(point => point.trim() !== ''),
            };

            if (editingProduct) {
                // Update product
                await productService.updateProduct(editingProduct._id, productData);
                alert('Product updated successfully!');
            } else {
                // Create product
                await productService.createProduct(productData);
                alert('Product created successfully!');
            }

            setShowProductForm(false);
            setEditingProduct(null);
            resetForm();
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            descriptionPoints: product.descriptionPoints && product.descriptionPoints.length > 0 ? product.descriptionPoints : [''],
            price: product.price.toString(),
            category: product.category,
            brand: product.brand || '',
            stock: product.stock.toString(),
            images: product.images.length > 0 ? product.images : [''],
        });
        setShowProductForm(true);
    };

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productService.deleteProduct(productId);
            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            descriptionPoints: [''],
            price: '',
            category: 'Electronics',
            brand: '',
            stock: '',
            images: [''],
        });
    };

    const getStockStatus = (stock) => {
        if (stock <= 0) return { label: 'Out of Stock', class: 'out-of-stock' };
        if (stock < 5) return { label: 'Low Stock', class: 'low-stock' };
        return { label: 'In Stock', class: 'in-stock' };
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = [
        'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
        'Books', 'Toys & Games', 'Health & Beauty', 'Automotive',
        'Food & Grocery', 'Other'
    ];

    if (user?.role !== 'admin') {
        return <div className="admin-access-denied">Access Denied: Admin Only</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-container">
                <h1 className="admin-title">Admin Dashboard</h1>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={`tab ${activeTab === 'carts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('carts')}
                    >
                        Carts
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="admin-content">
                        <h2>Store Overview</h2>

                        {loading ? (
                            <div className="loading">Loading dashboard...</div>
                        ) : (
                            <>
                                {/* Stats Cards */}
                                <div className="stats-grid">
                                    <div className="stat-card revenue" onClick={() => setActiveTab('orders')}>
                                        <div className="stat-icon">💰</div>
                                        <div className="stat-info">
                                            <h3>Total Revenue</h3>
                                            <p className="stat-value">₹{stats.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="stat-card orders" onClick={() => setActiveTab('orders')}>
                                        <div className="stat-icon">📦</div>
                                        <div className="stat-info">
                                            <h3>Total Orders</h3>
                                            <p className="stat-value">{stats.ordersCount}</p>
                                        </div>
                                    </div>
                                    <div className="stat-card products" onClick={() => setActiveTab('products')}>
                                        <div className="stat-icon">🏷️</div>
                                        <div className="stat-info">
                                            <h3>Products</h3>
                                            <p className="stat-value">{stats.productsCount}</p>
                                        </div>
                                    </div>
                                    <div className="stat-card carts" onClick={() => setActiveTab('carts')}>
                                        <div className="stat-icon">🛒</div>
                                        <div className="stat-info">
                                            <h3>Active Carts</h3>
                                            <p className="stat-value">{stats.cartsCount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders Section */}
                                <div className="recent-section">
                                    <div className="section-header">
                                        <h3>Recent Orders</h3>
                                        <button onClick={() => setActiveTab('orders')} className="btn-link">View All</button>
                                    </div>

                                    <div className="orders-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.slice(0, 5).map(order => (
                                                    <tr key={order._id}>
                                                        <td>{order._id.substring(0, 8)}...</td>
                                                        <td>{order.user?.name || 'N/A'}</td>
                                                        <td>₹{order.totalPrice?.toFixed(2)}</td>
                                                        <td>
                                                            <span className={`status-badge ${order.orderStatus}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {orders.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">No orders found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <div className="search-bar">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <h2>Manage Products</h2>
                            <button
                                onClick={() => {
                                    setShowProductForm(true);
                                    setEditingProduct(null);
                                    resetForm();
                                }}
                                className="btn-add"
                            >
                                + Add Product
                            </button>
                        </div>

                        {/* Product Form Modal */}
                        {showProductForm && (
                            <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                    <form onSubmit={handleSubmit} className="product-form">
                                        <div className="form-group">
                                            <label>Product Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleFormChange}
                                                required
                                                rows="4"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Description Points (Optional)</label>
                                            <small style={{ display: 'block', color: '#666', marginBottom: '0.5rem' }}>
                                                Add key features or highlights as bullet points
                                            </small>
                                            {formData.descriptionPoints.map((point, index) => (
                                                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        value={point}
                                                        onChange={(e) => handleDescriptionPointChange(index, e.target.value)}
                                                        placeholder="e.g., High-quality materials"
                                                        className="image-input"
                                                        style={{ flex: 1 }}
                                                    />
                                                    {formData.descriptionPoints.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDescriptionPoint(index)}
                                                            className="btn-icon delete"
                                                            style={{ padding: '0.5rem 1rem' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" onClick={addDescriptionPoint} className="btn-add-image">
                                                + Add Description Point
                                            </button>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Price (₹)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleFormChange}
                                                    required
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Stock</label>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    value={formData.stock}
                                                    onChange={handleFormChange}
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Category</label>
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleFormChange}
                                                    required
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Brand</label>
                                                <input
                                                    type="text"
                                                    name="brand"
                                                    value={formData.brand}
                                                    onChange={handleFormChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Image URLs</label>
                                            {formData.images.map((img, index) => (
                                                <input
                                                    key={index}
                                                    type="url"
                                                    value={img}
                                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="image-input"
                                                />
                                            ))}
                                            <button type="button" onClick={addImageField} className="btn-add-image">
                                                + Add Image URL
                                            </button>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="btn-submit" disabled={loading}>
                                                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowProductForm(false);
                                                    setEditingProduct(null);
                                                    resetForm();
                                                }}
                                                className="btn-cancel"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Products Table */}
                        {loading ? (
                            <div className="loading">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="empty-state">
                                <p>No products found matching your search.</p>
                                {products.length === 0 && (
                                    <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        Or seed the database with sample products by running: npm run seed
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="products-table-container">
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => {
                                            const stockStatus = getStockStatus(product.stock);
                                            return (
                                                <tr key={product._id}>
                                                    <td>
                                                        <div className="product-cell">
                                                            <img
                                                                src={product.images?.[0] || 'https://via.placeholder.com/50'}
                                                                alt={product.name}
                                                                className="product-thumb"
                                                            />
                                                            <div className="product-info-compact">
                                                                <span className="product-name-compact">{product.name}</span>
                                                                <span className="product-brand-compact">{product.brand}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="category-badge">{product.category}</span></td>
                                                    <td className="price-cell">₹{product.price.toFixed(2)}</td>
                                                    <td>
                                                        <span className={`stock-badge ${stockStatus.class}`}>
                                                            {stockStatus.label} ({product.stock})
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="btn-icon edit"
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product._id)}
                                                                className="btn-icon delete"
                                                                title="Delete"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="admin-content">
                        <h2>All Orders</h2>
                        {loading ? (
                            <div className="loading">Loading orders...</div>
                        ) : (
                            <div className="orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td>{order._id.substring(0, 8)}...</td>
                                                <td>{order.user?.name || 'N/A'}</td>
                                                <td>{order.items?.length || 0}</td>
                                                <td>₹{order.totalPrice?.toFixed(2)}</td>
                                                <td>
                                                    <div className="payment-info-cell">
                                                        <span className="payment-method-badge">{order.paymentInfo?.method || 'N/A'}</span>
                                                        <span className={`payment-status-dot ${order.paymentInfo?.status || 'pending'}`}></span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                        className={`status-select ${order.orderStatus}`}
                                                        disabled={loading ||
                                                            (order.orderStatus === 'delivered' && (order.paymentInfo?.status === 'completed' || order.paymentInfo?.status === 'succeeded' || order.paymentInfo?.status === 'paid')) ||
                                                            (order.orderStatus === 'cancelled' && order.cancelledBy === 'user')}
                                                    >
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="out-for-delivery">Out for Delivery</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowOrderModal(true);
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Order Details Modal */}
                {showOrderModal && selectedOrder && (
                    <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Order Details</h3>
                                <button className="close-btn" onClick={() => setShowOrderModal(false)}>×</button>
                            </div>

                            <div className="order-modal-body">
                                <div className="order-info-grid">
                                    <div className="info-group">
                                        <h4>Order Info</h4>
                                        <p><strong>ID:</strong> #{selectedOrder._id.substring(0, 8)}</p>
                                        <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                        <p><strong>Status:</strong> <span className={`status-badge ${selectedOrder.orderStatus}`}>{selectedOrder.orderStatus}</span></p>
                                        {selectedOrder.orderStatus === 'cancelled' && selectedOrder.cancelledBy && (
                                            <p><strong>Cancelled by:</strong> <span className="cancelled-by-badge">{selectedOrder.cancelledBy}</span></p>
                                        )}

                                    </div>
                                    <div className="info-group">
                                        <h4>Customer</h4>
                                        <p><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                                        <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="info-group">
                                        <h4>Payment Info</h4>
                                        <p><strong>Method:</strong> <span className="payment-method-badge">{selectedOrder.paymentInfo?.method || 'N/A'}</span></p>
                                        <p><strong>Status:</strong> <span className={`status-badge ${selectedOrder.paymentInfo?.status || 'pending'}`}>{selectedOrder.paymentInfo?.status || 'Pending'}</span></p>
                                        {selectedOrder.paymentInfo?.transactionId && (
                                            <p><strong>Ref:</strong> {selectedOrder.paymentInfo.transactionId}</p>
                                        )}
                                        {selectedOrder.paymentInfo?.status !== 'completed' &&
                                            selectedOrder.paymentInfo?.status !== 'succeeded' &&
                                            (selectedOrder.orderStatus === 'out-for-delivery' || selectedOrder.orderStatus === 'delivered') && (
                                                <button
                                                    className="btn-mark-paid"
                                                    onClick={() => handlePaymentUpdate(selectedOrder._id)}
                                                    style={{ marginTop: '0.5rem' }}
                                                >
                                                    ✓ Mark as Paid
                                                </button>
                                            )}
                                    </div>
                                    <div className="info-group">
                                        <h4>Shipping Address</h4>
                                        <p>{selectedOrder.shippingAddress?.street}</p>
                                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                                        <p>{selectedOrder.shippingAddress?.country}</p>
                                    </div>
                                </div>

                                <h4>Order Items</h4>
                                <div className="table-responsive">
                                    <table className="cart-details-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="cart-item-product">
                                                        <img
                                                            src={item.image || 'https://via.placeholder.com/40'}
                                                            alt={item.name}
                                                            className="cart-item-thumb"
                                                        />
                                                        <span>{item.name}</span>
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.price?.toFixed(2)}</td>
                                                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right' }}>Subtotal:</td>
                                                <td>₹{selectedOrder.itemsPrice?.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right' }}>Shipping:</td>
                                                <td>₹{selectedOrder.shippingPrice?.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right' }}>Tax:</td>
                                                <td>₹{selectedOrder.taxPrice?.toFixed(2)}</td>
                                            </tr>
                                            <tr className="cart-total-row">
                                                <td colSpan="3" style={{ textAlign: 'right' }}>Total:</td>
                                                <td>₹{selectedOrder.totalPrice?.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Carts Tab */}
                {activeTab === 'carts' && (
                    <div className="admin-content">
                        <h2>Active Carts</h2>
                        {loading ? (
                            <div className="loading">Loading carts...</div>
                        ) : carts.length === 0 ? (
                            <div className="empty-state">No active carts found</div>
                        ) : (
                            <>
                                <div className="orders-table"> {/* Reusing orders table style */}
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Items Count</th>
                                                <th>Cart Total</th>
                                                <th>Last Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {carts.filter(cart => cart.items && cart.items.length > 0).map(cart => {
                                                const cartTotal = cart.items.reduce((total, item) => {
                                                    const price = item.product?.price || item.price || 0;
                                                    return total + (price * item.quantity);
                                                }, 0);

                                                return (
                                                    <tr
                                                        key={cart._id}
                                                        onClick={() => {
                                                            setSelectedCart(cart);
                                                            setShowCartModal(true);
                                                        }}
                                                        className="clickable-row"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <td>
                                                            <div style={{ fontWeight: '600' }}>{cart.user?.name || 'Unknown User'}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{cart.user?.email}</div>
                                                        </td>
                                                        <td>{cart.items.length} items</td>
                                                        <td>₹{cartTotal.toFixed(2)}</td>
                                                        <td>{new Date(cart.updatedAt).toLocaleDateString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Cart Details Modal */}
                                {showCartModal && selectedCart && (
                                    <div className="modal-overlay" onClick={() => setShowCartModal(false)}>
                                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3>Cart Details: {selectedCart.user?.name}</h3>
                                                <button className="close-btn" onClick={() => setShowCartModal(false)}>×</button>
                                            </div>

                                            <div className="cart-items-list">
                                                <table className="cart-details-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Quantity</th>
                                                            <th>Price</th>
                                                            <th>Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedCart.items.map((item, index) => {
                                                            const product = item.product || {};
                                                            const price = product.price || 0;
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="cart-item-product">
                                                                        <img
                                                                            src={product.images?.[0] || 'https://via.placeholder.com/40'}
                                                                            alt={product.name}
                                                                            className="cart-item-thumb"
                                                                        />
                                                                        <span>{product.name || 'Unknown Product'}</span>
                                                                    </td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>₹{price.toFixed(2)}</td>
                                                                    <td>₹{(price * item.quantity).toFixed(2)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="cart-total-row">
                                                            <td colSpan="3">Total:</td>
                                                            <td>
                                                                ₹{selectedCart.items.reduce((total, item) => {
                                                                    const price = item.product?.price || 0;
                                                                    return total + (price * item.quantity);
                                                                }, 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            <div className="form-actions">
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => setShowCartModal(false)}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
