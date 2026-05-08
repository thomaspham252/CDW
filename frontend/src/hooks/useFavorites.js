import { useState } from 'react';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);

    const isFavorite = (productId) => favorites.includes(productId);

    const toggleFavorite = async (productId) => {
        if (isFavorite(productId)) {
            setFavorites(favorites.filter(id => id !== productId));
            return { success: true, message: 'Đã xóa khỏi yêu thích' };
        } else {
            setFavorites([...favorites, productId]);
            return { success: true, message: 'Đã thêm vào yêu thích' };
        }
    };

    return { favorites, isFavorite, toggleFavorite };
};
