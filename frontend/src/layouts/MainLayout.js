import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartToast from '../components/CartToast';
import { useCart } from '../context/CartContext';

const MainLayout = ({ children }) => {
    const { toastItem, clearToast } = useCart();

    return (
        <div className="main-layout">
            <Header />
            <main className="content-wrapper" style={{ minHeight: '80vh' }}>
                {children || <Outlet />}
            </main>
            <Footer />
            {/* Toast thêm vào giỏ - nằm trong Router nên dùng được useNavigate */}
            <CartToast item={toastItem} onClose={clearToast} />
        </div>
    );
};

export default MainLayout;

