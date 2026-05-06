import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <Header />
            <main className="content-wrapper" style={{ minHeight: '80vh' }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
