import axiosInstance from './axiosInstance';

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
  addToFavorites: async (productId, userId) => {
    if (!userId) return false;
    try {
      const response = await axiosInstance.post(`/api/favorites/toggle/${productId}`);
      if (response.data.success) {
        const favs = getFavs(userId);
        if (!favs.includes(productId)) {
          favs.push(productId);
          saveFavs(userId, favs);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Lỗi khi thêm yêu thích:", e);
      return false;
    }
  },
  removeFromFavorites: async (productId, userId) => {
    if (!userId) return false;
    try {
      const response = await axiosInstance.post(`/api/favorites/toggle/${productId}`);
      if (response.data.success) {
        const favs = getFavs(userId);
        const updated = favs.filter(id => id !== productId);
        saveFavs(userId, updated);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Lỗi khi xóa yêu thích:", e);
      return false;
    }
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
