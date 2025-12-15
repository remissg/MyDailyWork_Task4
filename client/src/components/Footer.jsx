import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

import './Footer.css';
import beeLogo from '../assets/bee-logo.jpg';

const Footer = () => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();

        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        // Simulate API call
        showToast('Thanks for subscribing! 📩', 'success');
        setEmail('');
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-section brand-section">
                        <Link to="/" className="footer-logo">
                            <img src={beeLogo} alt="BuyHive" className="footer-logo-icon" /> BuyHive
                        </Link>
                        <p className="brand-desc">
                            Your premium destination for quality products.
                            Discover the best deals on electronics, fashion, and home essentials.
                        </p>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook" className="social-icon">📘</a>
                            <a href="#" aria-label="Twitter" className="social-icon">🐦</a>
                            <a href="#" aria-label="Instagram" className="social-icon">📷</a>
                            <a href="#" aria-label="LinkedIn" className="social-icon">💼</a>
                        </div>
                    </div>

                    {/* Quick Linls */}
                    <div className="footer-section">
                        <h4>Shop</h4>
                        <ul className="footer-links">
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/products?category=Electronics">Electronics</Link></li>
                            <li><Link to="/products?category=Clothing">Fashion</Link></li>
                            <li><Link to="/products?category=Home">Home & Living</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul className="footer-links">
                            <li><Link to="/help-center">Help Center</Link></li>
                            <li><Link to="/shipping">Shipping & Delivery</Link></li>
                            <li><Link to="/returns">Returns & Refunds</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-section newsletter-section">
                        <h4>Stay Connected</h4>
                        <p>Subscribe to our newsletter for exclusive offers and updates.</p>
                        <form className="newsletter-form" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p>&copy; {new Date().getFullYear()} BuyHive. All rights reserved.</p>
                    <div className="footer-legal">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
