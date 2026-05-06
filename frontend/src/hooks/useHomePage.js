import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from './useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './useToast';

// DỮ LIỆU CỨNG CHO HOMEPAGE (KHI CHƯA CÓ DB)
export const useHomePage = () => {
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [favorites, setFavorites] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [discountedProducts, setDiscountedProducts] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            // 1. Sản phẩm bán chạy: Sắp xếp theo số lượng đã bán (sold) giảm dần
            const sortedBySold = [...products]
                .sort((a, b) => (b.sold || 0) - (a.sold || 0))
                .slice(0, 4);
            setBestSellingProducts(sortedBySold);

            // 2. Sản phẩm giảm giá: Có originalPrice > price
            const discounted = products
                .filter(p => p.originalPrice && p.originalPrice > p.price)
                .slice(0, 4);
            setDiscountedProducts(discounted);
        }
    }, [products]);

    const handleAddToCart = async (productId) => {
        addToCart(productId, 1);
        addToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
    };

    const handleToggleFavorite = async (productId) => {
        if (favorites.includes(productId)) {
            setFavorites(favorites.filter(id => id !== productId));
            addToast('Đã xóa khỏi yêu thích', 'success');
        } else {
            setFavorites([...favorites, productId]);
            addToast('Đã thêm vào yêu thích', 'success');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleViewProducts = () => {
        navigate('/products');
    };

    return {
        products,
        loading,
        favorites,
        bestSellingProducts,
        discountedProducts,
        handleAddToCart,
        handleToggleFavorite,
        handleProductClick,
        handleViewProducts
    };
};