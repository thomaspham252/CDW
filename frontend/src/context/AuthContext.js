import React, { createContext, useContext, useState } from 'react';
import { login as loginService, register as registerService, logout as logoutService, loginGoogle as loginGoogleService } from "../services/auth/authService";

const AuthContext = createContext(null);

// Lưu user info vào localStorage để giữ sau reload
const USER_KEY = 'tth_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(USER_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const saveUser = (data) => {
        const userInfo = {
            token: data.token,
            email: data.email,
            fullName: data.fullName,
            userId: data.userId
        };
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
        // Đồng bộ token riêng để axiosInstance dùng
        localStorage.setItem('token', data.token);
        setUser(userInfo);
    };

    const login = async (email, password) => {
        const data = await loginService(email, password);
        saveUser(data);
    };

    const loginGoogle = async (idToken) => {
        const data = await loginGoogleService(idToken);
        saveUser(data);
        return data;
    };

    const register = async (fullName, email, password) => {
        await registerService(fullName, email, password);
        await login(email, password);
    };

    const logout = () => {
        logoutService();
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginGoogle,
            register,
            logout,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
