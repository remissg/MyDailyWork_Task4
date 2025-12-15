import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'admin';
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Derived state
    const isWishlisted = user && product && user.wishlist?.includes(product._id);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productService.getProduct(id);
                setProduct(data.product);
            } catch (err) {
                setError('Failed to fetch product details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Fetch related products when product is loaded
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product || !product.category) return;
            try {
                const data = await productService.getProducts({
                    category: product.category,
                    limit: 5 // Fetch slightly more to account for filtering current product
                });
                // Filter out current product and take top 4
                const related = data.products
                    .filter(p => p._id !== product._id)
                    .slice(0, 4);
                setRelatedProducts(related);
            } catch (err) {
                console.error('Failed to fetch related products', err);
            }
        };

        fetchRelatedProducts();
    }, [product]);

    const handleToggleWishlist = async () => {
        if (!user) {
            showToast('Please login to add to wishlist', 'info');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/wishlist', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId: product._id })
            });

            const data = await response.json();

            if (data.success) {
                updateUser(data.user);
                showToast(user?.wishlist?.includes(product._id) ? 'Removed from wishlist' : 'Added to wishlist', 'success');
            }
        } catch (error) {
            showToast('Failed to update wishlist', 'error');
        }
    };

    const handleAddToCart = async () => {
        if (!product || isAdmin) return;
        try {
            await addToCart(product._id, quantity);
            showToast('Added to cart successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
            });
            const data = await res.json();

            if (data.success) {
                showToast('Review submitted successfully', 'success');
                setReviewComment('');
                setReviewRating(5);
                // Refresh product data to show new review
                const productData = await productService.getProduct(id);
                setProduct(productData.product);
            } else {
                showToast(data.message || 'Failed to submit review', 'error');
            }
        } catch (error) {
            showToast('Error submitting review', 'error');
        }
    };

    if (loading) return <div className="loading">Loading product details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!product) return <div className="error-message">Product not found</div>;

    return (
        <div className="product-details-page">
            <div className="product-details-container">
                <button onClick={() => navigate(-1)} className="btn-back">
                    ← Back
                </button>

                <div className="product-content">
                    {/* Product Images */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img
                                src={product.images?.[selectedImage] || 'https://via.placeholder.com/500'}
                                alt={product.name}
                            />
                        </div>
                        <div className="thumbnail-list">
                            {product.images?.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`${product.name} ${index + 1}`}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-meta">
                            <span className="product-category">{product.category}</span>
                            {product.brand && <span className="product-brand">| {product.brand}</span>}
                        </div>

                        <div className="product-rating">
                            {'⭐'.repeat(Math.round(product.ratings?.average || 0))}
                            <span className="rating-count">
                                ({product.ratings?.count || 0} reviews)
                            </span>
                        </div>

                        <div className="product-price">₹{product.price?.toFixed(2)}</div>
                        <div className="shipping-notice">
                            🚚 ₹40 delivery charge on orders below ₹499
                        </div>

                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="product-actions">
                            {!isAdmin ? (
                                <>
                                    <div className="quantity-selector">
                                        <label>Quantity:</label>
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            disabled={product.stock === 0}
                                        >
                                            {[...Array(Math.min(10, product.stock)).keys()].map(x => (
                                                <option key={x + 1} value={x + 1}>{x + 1}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="stock-status">
                                        {product.stock > 0 ? (
                                            <span className="in-stock">In Stock ({product.stock})</span>
                                        ) : (
                                            <span className="out-of-stock">Out of Stock</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className="btn-add-to-cart-large"
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>

                                    <button
                                        className={`btn-wishlist-large ${isWishlisted ? 'active' : ''}`}
                                        onClick={handleToggleWishlist}
                                    >
                                        {isWishlisted ? '❤️ Saved to Wishlist' : '🤍 Add to Wishlist'}
                                    </button>
                                </>
                            ) : (
                                <div className="admin-view-message">
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>
                                        You are viewing this product as an Admin.
                                    </p>
                                    <button
                                        className="btn-add-to-cart-large"
                                        disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#999', marginTop: '1rem' }}
                                    >
                                        Admin View Only
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="product-reviews-section">
                <div className="product-details-container">
                    <h2>Customer Reviews</h2>

                    <div className="reviews-grid">
                        {/* Review Form */}
                        <div className="review-form-container">
                            <h3>Write a Review</h3>
                            {user && !isAdmin ? (
                                <form onSubmit={handleSubmitReview} className="review-form">
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <div className="star-rating-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={`star ${star <= reviewRating ? 'filled' : ''}`}
                                                    onClick={() => setReviewRating(star)}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Comment</label>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Share your thoughts..."
                                            required
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn-submit-review">
                                        Submit Review
                                    </button>
                                </form>
                            ) : (
                                <div className="login-to-review">
                                    Please <a href="/login">login</a> as user to write a review.
                                </div>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className="reviews-list">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((review, index) => (
                                    <div key={index} className="review-card">
                                        <div className="review-header">
                                            <div className="review-avatar">
                                                {review.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="review-meta">
                                                <span className="review-author">{review.name}</span>
                                                <span className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="review-stars">
                                            {'★'.repeat(review.rating)}
                                            {'☆'.repeat(5 - review.rating)}
                                        </div>
                                        <p className="review-text">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-reviews">
                                    No reviews yet. Be the first to review!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', color: '#1e293b' }}>You Might Also Like</h2>
                    <div className="products-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        {relatedProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
