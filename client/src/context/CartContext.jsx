import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Fetch cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data.cart);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            const data = await cartService.addToCart(productId, quantity);
            setCart(data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            const data = await cartService.updateCartItem(itemId, quantity);
            setCart(data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const removeItem = async (itemId) => {
        try {
            const data = await cartService.removeCartItem(itemId);
            setCart(data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            const data = await cartService.clearCart();
            setCart(data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const getCartCount = () => {
        return cart?.totalItems || 0;
    };

    const getCartTotal = () => {
        return cart?.totalPrice || 0;
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        cartCount: getCartCount(),
        cartTotal: getCartTotal(),
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
