import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                // We need an endpoint that returns populated wishlist
                const { data } = await axios.get('/api/auth/wishlist', config);
                setWishlist(data.wishlist || []);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    if (loading) return <div className="loading">Loading wishlist...</div>;

    return (
        <div className="wishlist-page">
            <h1 className="wishlist-title">My Wishlist ❤️</h1>

            {wishlist.length === 0 ? (
                <div className="empty-wishlist">
                    <h2>Your wishlist is empty</h2>
                    <p>Save items you love to buy later.</p>
                    <Link to="/products" className="btn-shop">Explore Products</Link>
                </div>
            ) : (
                <div className="products-grid">
                    {wishlist.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
