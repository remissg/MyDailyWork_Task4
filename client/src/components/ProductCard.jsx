import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'admin';
    const isWishlisted = user?.wishlist?.includes(product._id);
    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast('Please login to add to wishlist', 'info');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Using fetch since we just want to toggle
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
                showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
            }
        } catch (error) {
            showToast('Failed to update wishlist', 'error');
        }
    };


    const handleAddToCart = async (e) => {
        e.preventDefault(); // Prevent link click if button is inside link (safe-guard)
        try {
            await addToCart(product._id, 1);
            showToast(`Added ${product.name} to cart`, 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    return (
        <div className="product-card">
            <Link to={`/products/${product._id}`} className="product-image-link">
                <div className="product-image">
                    <img
                        src={product.images?.[0] || 'https://via.placeholder.com/300'}
                        alt={product.name}
                    />
                    {!isAdmin && (
                        <button
                            className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                            onClick={handleToggleWishlist}
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            ♥
                        </button>
                    )}
                    {product.stock === 0 && <div className="out-of-stock-badge">Out of Stock</div>}
                </div>
            </Link>

            <div className="product-info">
                <div className="product-category-brand">
                    {product.category} {product.brand && `• ${product.brand}`}
                </div>

                <Link to={`/products/${product._id}`} className="product-title">
                    {product.name}
                </Link>

                <div className="product-rating">
                    <span className="stars">{'⭐'.repeat(Math.round(product.ratings?.average || 0))}</span>
                    <span className="rating-text">
                        ({product.ratings?.count || 0} reviews)
                    </span>
                </div>

                <div className="product-footer">
                    <div className="product-price">₹{product.price?.toFixed(2)}</div>
                    {isAdmin ? (
                        <button
                            className="btn-add-to-cart"
                            disabled
                        >
                            Admin Only
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="btn-add-to-cart"
                            disabled={product.stock === 0}
                        >
                            {product.stock === 0 ? 'Sold Out' : 'Add'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;