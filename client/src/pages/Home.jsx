import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            console.log('Fetching featured products...');
            const data = await productService.getFeaturedProducts();
            console.log('Featured products data:', data);
            if (data?.products) {
                setFeaturedProducts(data.products);
                setError(null);
                console.log('Set featured products:', data.products.length);
            } else {
                console.error('No products array in response:', data);
                setError('Failed to load products.');
            }
        } catch (error) {
            console.error('Failed to fetch featured products:', error);
            setError('Failed to load featured products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to E-Shop</h1>
                    <p className="hero-subtitle">Discover amazing products at unbeatable prices</p>
                    <Link to="/products" className="btn-hero">Shop Now</Link>
                </div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <h2>Shop by Category</h2>
                <div className="categories-grid">
                    {[
                        { name: 'Electronics', image: 'https://plus.unsplash.com/premium_photo-1679079456083-9f288e224e96?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                        { name: 'Clothing', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1611862529826-28393d066110?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                        { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3BvcnRzfGVufDB8fDB8fHww' }
                    ].map((category) => (
                        <Link
                            key={category.name}
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            className="category-card"
                            style={{ backgroundImage: `url(${category.image})` }}
                        >
                            <div className="category-overlay">
                                <h3>{category.name}</h3>
                                <span className="btn-explore">Explore Now</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <h2>Featured Products</h2>
                {loading ? (
                    <div className="loading">Loading products...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : featuredProducts.length === 0 ? (
                    <div className="no-products">No featured products found.</div>
                ) : (
                    <div className="products-grid">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
                <div className="view-all-container">
                    <Link to="/products" className="btn-view-all">View All Products</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
