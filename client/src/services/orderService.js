import api from './api';

export const orderService = {
    // Create new order
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get user's orders
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    // Get single order
    getOrder: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Get all orders (Admin)
    getAllOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    // Update order status (Admin)
    updateOrderStatus: async (id, status) => {
        const response = await api.put(`/orders/${id}/status`, { orderStatus: status });
        return response.data;
    },
};
