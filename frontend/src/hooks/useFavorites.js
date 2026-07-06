import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../services/api';
import axiosInstance from '../services/axiosInstance';

export const useFavorites = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);

    const fetchFavoritesFromDB = async () => {
        const userId = user?.id || user?.userId;
        if (!userId) return;
        try {
            const response = await axiosInstance.get('/api/favorites/ids');
            const data = response.data || [];
            setFavorites(data);
            localStorage.setItem(`tth_favs_${userId}`, JSON.stringify(data));
            window.dispatchEvent(new Event('favorites-updated'));
        } catch (e) {
            console.error("Lỗi khi tải danh sách yêu thích từ DB:", e);
        }
    };

    useEffect(() => {
        const userId = user?.id || user?.userId;
        if (userId) {
            fetchFavoritesFromDB();

            const handleUpdate = () => {
                try {
                    const saved = localStorage.getItem(`tth_favs_${userId}`);
                    setFavorites(saved ? JSON.parse(saved) : []);
                } catch {
                    setFavorites([]);
                }
            };

            window.addEventListener('favorites-updated', handleUpdate);
            return () => window.removeEventListener('favorites-updated', handleUpdate);
        } else {
            setFavorites([]);
        }
    }, [user]);

    const isFavorite = (productId) => favorites.includes(productId);

    const toggleFavorite = async (productId) => {
        const userId = user?.id || user?.userId;
        if (!userId) return { success: false, message: 'Vui lòng đăng nhập' };
        
        try {
            if (isFavorite(productId)) {
                const success = await favoritesAPI.removeFromFavorites(productId, userId);
                if (success) {
                    return { success: true, message: 'Đã xóa khỏi yêu thích' };
                }
            } else {
                const success = await favoritesAPI.addToFavorites(productId, userId);
                if (success) {
                    return { success: true, message: 'Đã thêm vào yêu thích' };
                }
            }
            return { success: false, message: 'Thao tác thất bại' };
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    };

    return { favorites, isFavorite, toggleFavorite, refreshFavorites: fetchFavoritesFromDB };
};
