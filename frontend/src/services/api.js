import api from "./axiosInstance";

export const favoritesAPI = {
  getProducts: async () => {
    const response = await api.get("/api/wishlist");
    return response.data;
  },

  getIds: async () => {
    const response = await api.get("/api/wishlist/ids");
    return response.data;
  },

  getCount: async () => {
    const response = await api.get("/api/wishlist/count");
    return response.data.count || 0;
  },

  isFavorite: async (productId) => {
    const response = await api.get(`/api/wishlist/${productId}/exists`);
    return Boolean(response.data.favorite);
  },

  addToFavorites: async (productId) => {
    const response = await api.post(`/api/wishlist/${productId}`);
    window.dispatchEvent(new Event("wishlist-updated"));
    return response.data;
  },

  removeFromFavorites: async (productId) => {
    const response = await api.delete(`/api/wishlist/${productId}`);
    window.dispatchEvent(new Event("wishlist-updated"));
    return response.data;
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
  getUnreadCount: () => Promise.resolve(5),
  create: (userId, type, message) => {
    console.log(
      `Notification created for user ${userId}: [${type}] ${message}`,
    );
    return Promise.resolve(true);
  },
};
