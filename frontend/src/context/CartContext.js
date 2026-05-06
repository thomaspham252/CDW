import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = async (productId, quantity) => {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            setCart(cart.map(item => 
                item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
            ));
        } else {
            setCart([...cart, { id: productId, quantity }]);
        }
        console.log(`Added product ${productId} to cart`);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, getTotalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
