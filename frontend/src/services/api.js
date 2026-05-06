// Mock API services
export const productsAPI = {
    getAll: () => Promise.resolve([]),
    getById: (id) => Promise.resolve({ id, name: 'Product ' + id })
};

export const favoritesAPI = {
    // Mock count
    getCount: (userId) => 3, 
    toggle: (userId, productId) => Promise.resolve(true)
};

export const notificationsAPI = {
    getUnreadCount: (userId) => Promise.resolve(5)
};
