import React from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate  } from 'react-router-dom';
import { AuthProvider,useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

function App() {
  return (
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Trang chủ sử dụng MainLayout (Header + Footer) */}
              <Route 
                path="/" 
                element={
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                } 
              />
              
              {/* Trang Login/Register có thể không cần Header/Footer của trang chính */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
      </GoogleOAuthProvider>
  );
}

export default App;
