import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_KEY = 'cdw_cart';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            const parsedCart = saved ? JSON.parse(saved) : [];
            
            console.log('[CartContext] Loading cart from localStorage:', parsedCart);
            
            // MIGRATION: Fix old cart items without variantId
            // This ensures backward compatibility with old localStorage data
            const migratedCart = parsedCart.map(item => {
                if (!item.variantId && item.id) {
                    console.log('[CartContext] Migrating item - adding variantId:', item);
                    // Assume id is variantId if variantId is missing (old cart format)
                    return {
                        ...item,
                        variantId: item.id,
                        productId: item.productId || item.id
                    };
                }
                
                // Check if item has valid variantId
                if (!item.variantId && !item.id) {
                    console.error('[CartContext] Item missing both variantId and id:', item);
                    return null; // Mark for removal
                }
                
                return item;
            }).filter(item => item !== null); // Remove invalid items
            
            // Save migrated cart back to localStorage if any changes were made
            if (JSON.stringify(migratedCart) !== JSON.stringify(parsedCart)) {
                console.log('[CartContext] Saving migrated cart:', migratedCart);
                localStorage.setItem(CART_KEY, JSON.stringify(migratedCart));
            }
            
            return migratedCart;
        } catch (error) {
            console.error('[CartContext] Error loading cart:', error);
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
     * item = { id, variantId, productId, name, slug, image, price, size, quantity }
     * IMPORTANT: variantId is REQUIRED for checkout to work!
     */
    const addToCart = (item, quantity = 1) => {
        if (typeof item !== 'object') {
            console.error('[CartContext] Invalid item type:', typeof item);
            return false;
        }

        // Ensure variantId exists (fallback to id if not provided)
        const cartItem = {
            ...item,
            variantId: item.variantId || item.id,
            productId: item.productId || item.id
        };
        
        // Validate variantId exists
        if (!cartItem.variantId) {
            console.error('[CartContext] Cannot add item without variantId:', item);
            alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
            return false;
        }
        
        console.log('[CartContext] Adding to cart:', cartItem);

        const itemKeyId = cartItem.variantId || cartItem.id;
        const key = cartItem.size ? `${itemKeyId}_${cartItem.size}` : `${itemKeyId}`;

        setCart(prev => {
            const existing = prev.find(i => i.key === key);
            if (existing) {
                return prev.map(i =>
                    i.key === key
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...cartItem, key, quantity }];
        });

        // Hiện toast thông báo
        setToastItem({ ...cartItem, quantity });
        return true;
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
