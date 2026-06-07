import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../services/api';

export const useFavorites = () => {
    const { user, isAuthenticated, authLoaded } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    const normalizeId = (id) => Number(id);

    const loadFavorites = useCallback(async () => {
        if (!authLoaded || !isAuthenticated || !user) {
            setFavorites([]);
            return;
        }

        try {
            setLoading(true);
            const ids = await favoritesAPI.getIds();
            setFavorites(ids.map(normalizeId));
        } catch (err) {
            console.error('Lỗi tải wishlist:', err);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, [authLoaded, isAuthenticated, user]);

    useEffect(() => {
        loadFavorites();

        const handleWishlistUpdated = () => loadFavorites();
        window.addEventListener('wishlist-updated', handleWishlistUpdated);

        return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
    }, [loadFavorites]);

    const isFavorite = (productId) => favorites.includes(normalizeId(productId));

    const toggleFavorite = async (productId) => {
        const normalizedProductId = normalizeId(productId);

        if (isFavorite(productId)) {
            await favoritesAPI.removeFromFavorites(normalizedProductId);
            setFavorites(prev => prev.filter(id => id !== normalizedProductId));
            return { success: true, message: 'Đã xóa khỏi yêu thích' };
        } else {
            await favoritesAPI.addToFavorites(normalizedProductId);
            setFavorites(prev => [...new Set([...prev, normalizedProductId])]);
            return { success: true, message: 'Đã thêm vào yêu thích' };
        }
    };

    return { favorites, loading, isFavorite, toggleFavorite, reloadFavorites: loadFavorites };
};
