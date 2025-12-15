import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { useCart } from '../context/CartContext';
import './Navbar.css';
import beeLogo from '../assets/bee-logo.jpg';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsMenuOpen(false); // Close mobile menu if open
            setSearchQuery(''); // Optional: clear after search
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    const isAdmin = user?.role === 'admin';

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <img src={beeLogo} alt="BuyHive Logo" className="logo-icon" />
                    <span className="logo-text">BuyHive</span>
                </Link>



                {/* Search Bar - Desktop & Tablet */}
                <form className="navbar-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-btn" aria-label="Search">
                        🔍
                    </button>
                </form>

                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger"></span>
                </button>

                <div
                    className={`menu-backdrop ${isMenuOpen ? 'active' : ''}`}
                    onClick={closeMenu}
                />

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <button className="menu-close" onClick={closeMenu}>✕</button>

                    {/* Products link - only for regular users */}
                    {!isAdmin && (
                        <Link to="/products" className="nav-link" onClick={closeMenu}>Products</Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            {/* Show Cart and Orders only for regular users */}
                            {!isAdmin && (
                                <>
                                    <Link to="/wishlist" className="nav-link" onClick={closeMenu}>
                                        ❤️
                                    </Link>
                                    <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                                        Cart
                                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                    </Link>
                                    <Link to="/orders" className="nav-link" onClick={closeMenu}>Orders</Link>
                                </>
                            )}

                            {/* Admin links */}
                            {isAdmin && (
                                <>
                                    <Link to="/products" className="nav-link" onClick={closeMenu}>Products</Link>
                                    <Link to="/admin" className="nav-link admin-link" onClick={closeMenu}>Dashboard</Link>
                                </>
                            )}

                            <div className="user-menu">
                                <Link to="/profile" className="user-name-link">
                                    <span className="user-name">Hi, {user?.name}</span>
                                </Link>
                                <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="btn btn-secondary" onClick={closeMenu}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
