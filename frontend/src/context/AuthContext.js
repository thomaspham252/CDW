import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Mock user
    const [user, setUser] = useState({ id: 1, name: 'Người dùng mẫu', email: 'user@example.com' });
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
