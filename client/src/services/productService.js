import api from './api';

export const productService = {
    // Get all products with filtering and pagination
    getProducts: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    // Get single product
    getProduct: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Get featured products
    getFeaturedProducts: async () => {
        const response = await api.get('/products/featured');
        return response.data;
    },

    // Create product (Admin)
    createProduct: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    // Update product (Admin)
    updateProduct: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // Delete product (Admin)
    deleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
