import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon, icons } from '../utils/icons';
import { formatPrice } from '../utils/formatPrice';
import '../styles/CartToast.css';

const CartToast = ({ item, onClose }) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!item) return;
        setVisible(true);
        const timer = setTimeout(() => handleClose(), 3500);
        return () => clearTimeout(timer);
    }, [item]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onClose(), 300);
    };

    const handleViewCart = () => {
        handleClose();
        navigate('/cart');
    };

    if (!item) return null;

    return (
        <div className={`cart-toast ${visible ? 'show' : 'hide'}`}>
            {/* Header */}
            <div className="cart-toast-header">
                <span className="cart-toast-title">
                    <FontAwesomeIcon icon={icons.cart} />
                    Đã thêm vào giỏ hàng
                </span>
                <button className="cart-toast-close" onClick={handleClose}>
                    <FontAwesomeIcon icon={icons.times} />
                </button>
            </div>

            {/* Product info */}
            <div className="cart-toast-body">
                <div className="cart-toast-image">
                    <img
                        src={item.image || 'https://placehold.co/64x64?text=No+Image'}
                        alt={item.name}
                        onError={e => e.target.src = 'https://placehold.co/64x64?text=No+Image'}
                    />
                </div>
                <div className="cart-toast-info">
                    <p className="cart-toast-name">{item.name}</p>
                    {item.size && (
                        <p className="cart-toast-size">Phân loại: {item.size}</p>
                    )}
                    <p className="cart-toast-price">{formatPrice(item.price)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="cart-toast-actions">
                <button className="btn-toast-continue" onClick={handleClose}>
                    Tiếp tục mua
                </button>
                <button
                    className="btn-toast-cart"
                    onClick={handleViewCart}
                >
                    <FontAwesomeIcon icon={icons.cart} />
                    Xem giỏ hàng
                </button>
            </div>

            {/* Progress bar tự đóng */}
            <div className="cart-toast-progress" />
        </div>
    );
};

export default CartToast;
