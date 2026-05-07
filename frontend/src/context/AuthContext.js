import React, { createContext, useContext, useState } from 'react';
import { login as loginService, register as registerService, logout as logoutService } from "../services/auth/authService";

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [user,setUser]= useState(()=>{
        const token =localStorage.getItem("token");
        return token?{token}:null;
    });

    const login = async (email,password)=>{
        const data = await loginService(email,password);
        setUser({token: data.token});
    };

    const register = async (fullName,email,password)=>{
        await  registerService(fullName,email,password);
        await login(email,password);
    };

    const logout= ()=>{
        logoutService();
        setUser(null);
    };

    return (<AuthContext.Provider value={{
        user,
            login,
            register,
            logout,
            isAuthenticated: !!user,
    }}>{children}</AuthContext.Provider>

    )};

export const useAuth = () => useContext(AuthContext);
