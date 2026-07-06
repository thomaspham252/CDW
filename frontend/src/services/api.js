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
