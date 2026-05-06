import React, { createContext, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const addToCart = async (productId, quantity) => {
        console.log(`Added product ${productId} to cart`);
    };

    return (
        <CartContext.Provider value={{ addToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
