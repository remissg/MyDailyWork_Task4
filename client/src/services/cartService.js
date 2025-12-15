import api from './api';

export const cartService = {
    // Get user's cart
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    // Add item to cart
    addToCart: async (productId, quantity = 1) => {
        const response = await api.post('/cart', { productId, quantity });
        return response.data;
    },

    // Update cart item quantity
    updateCartItem: async (itemId, quantity) => {
        const response = await api.put(`/cart/${itemId}`, { quantity });
        return response.data;
    },

    // Remove item from cart
    removeCartItem: async (itemId) => {
        const response = await api.delete(`/cart/${itemId}`);
        return response.data;
    },

    // Clear cart
    clearCart: async () => {
        const response = await api.delete('/cart');
        return response.data;
    },
};
