import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { favoritesAPI } from '../services/api';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/Header.css';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            setFavoritesCount(favoritesAPI.getCount(user.id));
        } else {
            setFavoritesCount(0);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setIsMenuOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <h1>TTH Shop</h1>
                    <span className="logo-subtitle">Handmade</span>
                </Link>

                <div className="header-search">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="search-btn">
                            <FontAwesomeIcon icon={icons.search || "search"} />
                        </button>
                    </form>
                </div>

                {/* Navigation Desktop */}
                <nav className="header-nav">
                    <Link to="/" className="nav-link">
                        <FontAwesomeIcon icon={icons.home} /> Trang Chủ
                    </Link>
                    <Link to="/blog" className="nav-link">
                        <FontAwesomeIcon icon={icons.blog || icons.edit} /> Tin Tức
                    </Link>
                    <Link to="/products" className="nav-link">
                        <FontAwesomeIcon icon={icons.products} /> Sản Phẩm
                    </Link>
                    <Link to="/contact" className="nav-link">
                        <FontAwesomeIcon icon={icons.contact} /> Liên Hệ
                    </Link>

                    <Link to="/cart" className="nav-link cart-link">
                        <FontAwesomeIcon icon={icons.cart} /> <span>Giỏ Hàng</span>
                        {getTotalItems() > 0 && (
                            <span className="cart-badge">{getTotalItems()}</span>
                        )}
                    </Link>

                    {isAuthenticated && (
                        <Link to="/favorites" className="nav-link favorites-link">
                            <FontAwesomeIcon icon={icons.heart} /> <span>Yêu Thích</span>
                            {favoritesCount > 0 && (
                                <span className="cart-badge">{favoritesCount}</span>
                            )}
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <div className="user-menu">
                            <Link to="/profile" className="nav-link user-name">
                                <FontAwesomeIcon icon={icons.user} /> {user?.name || user?.email}
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">
                                <FontAwesomeIcon icon={icons.logout} />
                            </button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="nav-link">Đăng Nhập</Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Mobile Navigation */}
            <nav className={`mobile-nav ${isMenuOpen ? 'mobile-nav-open' : ''}`}>
                <div className="mobile-search-wrapper">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="search-btn" >
                            <FontAwesomeIcon icon={icons.search || "search"} />
                        </button>
                    </form>
                </div>

                <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FontAwesomeIcon icon={icons.home} /> Trang Chủ
                </Link>
                <Link to="/blog" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FontAwesomeIcon icon={icons.blog || icons.edit} /> Tin Tức
                </Link>
                <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FontAwesomeIcon icon={icons.products} /> Sản Phẩm
                </Link>
                <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FontAwesomeIcon icon={icons.cart} /> Giỏ Hàng {getTotalItems() > 0 && `(${getTotalItems()})`}
                </Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <FontAwesomeIcon icon={icons.user} /> Hồ Sơ
                        </Link>
                        <button onClick={handleLogout} className="mobile-nav-link mobile-logout">
                            <FontAwesomeIcon icon={icons.logout} /> Đăng Xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Đăng Nhập</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;