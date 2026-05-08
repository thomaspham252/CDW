import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <Header />
            <main className="content-wrapper" style={{ minHeight: '80vh' }}>
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;

