import React, { createContext, useContext, useEffect, useState } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  loginGoogle as loginGoogleService,
} from "../services/auth/authService";

const AuthContext = createContext(null);

// Lưu user info vào localStorage để giữ sau reload
const USER_KEY = "tth_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Validate token on startup to avoid showing stale user info (fast-refresh / old state)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthLoaded(true);
      return;
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("invalid token");
      const payload = JSON.parse(atob(parts[1]));
      // exp is in seconds
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        const saved = localStorage.getItem(USER_KEY);
        setUser(saved ? JSON.parse(saved) : null);
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (e) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setAuthLoaded(true);
    }
  }, []);

  const saveUser = (data) => {
    const userInfo = {
      token: data.token,
      email: data.email,
      fullName: data.fullName,
      userId: data.userId,
      role: data.role,
      phone: data.phone,
      gender: data.gender,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    // Đồng bộ token riêng để axiosInstance dùng
    localStorage.setItem("token", data.token);
    setUser(userInfo);
  };

  const updateUserLocal = (data) => {
    const userInfo = {
      ...user,
      fullName: data.fullName,
      phone: data.phone,
      gender: data.gender,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
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
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginGoogle,
        register,
        logout,
        updateUserLocal,
        isAuthenticated: !!user,
        authLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
