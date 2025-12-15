import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        search: searchParams.get('search') || '',
    });

    useEffect(() => {
        const category = searchParams.get('category');
        setFilters((prev) => ({ ...prev, category: category || '' }));
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.search) params.search = filters.search;
            params.sort = filters.sort;

            const data = await productService.getProducts(params);
            setProducts(data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            sort: 'newest',
            search: '',
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // The search is already in state, effect will trigger fetch
    };

    const categories = [
        'Electronics',
        'Clothing',
        'Home & Garden',
        'Sports & Outdoors',
        'Books',
        'Toys & Games',
        'Health & Beauty',
        'Automotive',
        'Food & Grocery',
        'Other',
    ];

    return (
        <div className="products-page">
            <div className="products-container">
                {/* Filters Sidebar */}
                <aside className={`filters-sidebar ${isFilterOpen ? 'open' : ''}`}>
                    <div className="filter-header">
                        <h3>Filter Products</h3>
                        <div className="filter-actions">
                            <button onClick={clearFilters} className="btn-clear">
                                <span>Reset</span>
                            </button>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="btn-close-filter"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="filter-scroll">
                        <div className="filter-section">
                            <h4>Categories</h4>
                            <div className="category-list">
                                <button
                                    className={`category-item ${filters.category === '' ? 'active' : ''}`}
                                    onClick={() => {
                                        handleFilterChange({ target: { name: 'category', value: '' } });
                                        setIsFilterOpen(false);
                                    }}
                                >
                                    All Categories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`category-item ${filters.category === cat ? 'active' : ''}`}
                                        onClick={() => {
                                            handleFilterChange({ target: { name: 'category', value: cat } });
                                            setIsFilterOpen(false);
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>Price Range</h4>
                            <div className="price-range-container">
                                <div className="price-inputs">
                                    <div className="price-input-group">
                                        <span className="currency-symbol">₹</span>
                                        <input
                                            type="number"
                                            name="minPrice"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={handleFilterChange}
                                            className="price-input"
                                        />
                                    </div>
                                    <span className="price-separator">to</span>
                                    <div className="price-input-group">
                                        <span className="currency-symbol">₹</span>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            className="price-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>Sort By</h4>
                            <div className="select-wrapper">
                                <select
                                    name="sort"
                                    value={filters.sort}
                                    onChange={handleFilterChange}
                                    className="filter-select"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isFilterOpen && (
                    <div
                        className="filters-overlay"
                        onClick={() => setIsFilterOpen(false)}
                    />
                )}

                {/* Products Grid */}
                <div className="products-main">
                    <div className="products-header">
                        <div className="header-toggle-group">
                            <button
                                className="btn-filter-toggle"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <span className="filter-icon">⚙️</span> Filters
                            </button>
                        </div>

                        {/* Search Bar */}
                        <form className="products-search-bar" onSubmit={handleSearchSubmit}>
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                name="search"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                autoComplete="off"
                            />
                        </form>

                        <p className="products-count">
                            {loading ? 'Loading...' : `${products.length} products found`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading">Loading products...</div>
                    ) : products.length > 0 ? (
                        <div className="products-grid">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-products">
                            <p>No products found. Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;
