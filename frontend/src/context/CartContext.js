import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_KEY = 'tth_cart';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // State cho toast thông báo
    const [toastItem, setToastItem] = useState(null);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    /**
     * Thêm sản phẩm vào giỏ
     * item = { id, name, slug, image, price, size, quantity }
     */
    const addToCart = (item, quantity = 1) => {
        if (typeof item !== 'object') return;

        const key = item.size ? `${item.id}_${item.size}` : `${item.id}`;

        setCart(prev => {
            const existing = prev.find(i => i.key === key);
            if (existing) {
                return prev.map(i =>
                    i.key === key
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...item, key, quantity }];
        });

        // Hiện toast thông báo
        setToastItem({ ...item, quantity });
    };

    /** Cập nhật số lượng */
    const updateQuantity = (key, quantity) => {
        if (quantity <= 0) {
            removeFromCart(key);
            return;
        }
        setCart(prev =>
            prev.map(i => i.key === key ? { ...i, quantity } : i)
        );
    };

    /** Xóa 1 sản phẩm */
    const removeFromCart = (key) => {
        setCart(prev => prev.filter(i => i.key !== key));
    };

    /** Xóa toàn bộ giỏ */
    const clearCart = () => {
        setCart([]);
    };

    /** Tổng số lượng sản phẩm */
    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    /** Tổng tiền */
    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            getTotalItems,
            getTotalPrice,
            toastItem,        // export ra để MainLayout dùng
            clearToast: () => setToastItem(null)
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
