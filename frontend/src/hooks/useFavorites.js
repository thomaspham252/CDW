import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../services/api';

export const useFavorites = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        if (user) {
            const updateFavs = () => {
                try {
                    const saved = localStorage.getItem(`tth_favs_${user.id}`);
                    setFavorites(saved ? JSON.parse(saved) : []);
                } catch {
                    setFavorites([]);
                }
            };
            updateFavs();
            window.addEventListener('favorites-updated', updateFavs);
            return () => window.removeEventListener('favorites-updated', updateFavs);
        } else {
            setFavorites([]);
        }
    }, [user]);

    const isFavorite = (productId) => favorites.includes(productId);

    const toggleFavorite = async (productId) => {
        if (!user) return { success: false, message: 'Vui lòng đăng nhập' };
        
        if (isFavorite(productId)) {
            await favoritesAPI.removeFromFavorites(productId, user.id);
            return { success: true, message: 'Đã xóa khỏi yêu thích' };
        } else {
            await favoritesAPI.addToFavorites(productId, user.id);
            return { success: true, message: 'Đã thêm vào yêu thích' };
        }
    };

    return { favorites, isFavorite, toggleFavorite };
};
