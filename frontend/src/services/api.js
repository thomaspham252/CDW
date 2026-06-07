const getFavs = (userId) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(`tth_favs_${userId}`);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveFavs = (userId, favs) => {
  if (!userId) return;
  localStorage.setItem(`tth_favs_${userId}`, JSON.stringify(favs));
  window.dispatchEvent(new Event('favorites-updated'));
};

export const favoritesAPI = {
  getCount: (userId) => getFavs(userId).length,
  isFavorite: (productId, userId) => getFavs(userId).includes(productId),
  addToFavorites: (productId, userId) => {
    if (!userId) return Promise.resolve(false);
    const favs = getFavs(userId);
    if (!favs.includes(productId)) {
      favs.push(productId);
      saveFavs(userId, favs);
    }
    return Promise.resolve(true);
  },
  removeFromFavorites: (productId, userId) => {
    if (!userId) return Promise.resolve(false);
    const favs = getFavs(userId);
    const updated = favs.filter(id => id !== productId);
    saveFavs(userId, updated);
    return Promise.resolve(true);
  },
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
