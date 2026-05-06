export const favoritesAPI = {
    getAll: async (userId) => [],
    isFavorite: async (productId, userId) => false,
    addToFavorites: async (productId, userId) => {},
    removeFromFavorites: async (productId, userId) => {}
};

export const notificationsAPI = {
    create: async (userId, type, message) => {}
};
