export const favoritesAPI = {
  getCount: (userId) => 3,
  isFavorite: (productId, userId) => false,
  addToFavorites: (productId, userId) => Promise.resolve(true),
  removeFromFavorites: (productId, userId) => Promise.resolve(true),
};

export const notificationsAPI = {
  getUnreadCount: (userId) => Promise.resolve(5),
  create: (userId, type, message) => {
    console.log(
      `Notification created for user ${userId}: [${type}] ${message}`,
    );
    return Promise.resolve(true);
  },
};
