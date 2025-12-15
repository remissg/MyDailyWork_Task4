const Product = require('../models/Product');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            brand,
            search,
            sort,
            page = 1,
            limit = 12,
        } = req.query;

        // Build query
        let query = {};

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Filter by brand
        if (brand) {
            query.brand = brand;
        }

        // Search by name only
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Sort options
        let sortOptions = {};
        if (sort === 'price_asc') {
            sortOptions = { price: 1 };
        } else if (sort === 'price_desc') {
            sortOptions = { price: -1 };
        } else if (sort === 'rating') {
            sortOptions = { 'ratings.average': -1 };
        } else if (sort === 'newest') {
            sortOptions = { createdAt: -1 };
        } else {
            sortOptions = { createdAt: -1 }; // Default sort
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip(skip);

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            'reviews.user',
            'name'
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true }).limit(8);

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user.id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({
                    success: false,
                    message: 'Product already reviewed',
                });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user.id,
            };

            product.reviews.push(review);

            product.ratings.count = product.reviews.length;
            product.ratings.average =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();

            res.status(201).json({
                success: true,
                message: 'Review added',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
