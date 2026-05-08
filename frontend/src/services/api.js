// Mock API services với đầy đủ các phương thức cho ProductsPage và ProductDetailPage

const MOCK_PRODUCTS = [
    {
        id: 1,
        name: 'Túi vải Canvas phong cách Vintage',
        price: 150000,
        originalPrice: 200000,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600',
        images: [
            'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600',
            'https://images.unsplash.com/photo-1590739225287-bd31519780c3?q=80&w=600'
        ],
        rating: 4.8,
        reviewsCount: 124,
        category: 'Túi vải',
        stock: 15,
        sold: 85,
        description: 'Túi vải canvas cao cấp, bền đẹp, phong cách vintage thời thượng.',
        colors: ['Be', 'Trắng', 'Đen'],
        types: ['Size S', 'Size M', 'Size L']
    },
    {
        id: 2,
        name: 'Nến thơm tinh dầu Lavender',
        price: 120000,
        originalPrice: 150000,
        image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=600',
        images: ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=600'],
        rating: 4.9,
        reviewsCount: 56,
        category: 'Nến thơm',
        stock: 20,
        sold: 120,
        description: 'Nến thơm tự nhiên giúp thư giãn và tạo không gian ấm cúng.',
        colors: ['Tím nhạt'],
        types: ['100g', '200g']
    },
    {
        id: 3,
        name: 'Tranh giấy cuộn Quilling nghệ thuật',
        price: 450000,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600',
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600'],
        rating: 5.0,
        reviewsCount: 32,
        category: 'Tranh nghệ thuật',
        stock: 5,
        sold: 15,
        description: 'Tranh thủ công tinh xảo, quà tặng độc đáo cho người thân.'
    },
    {
        id: 4,
        name: 'Ví da thủ công handmade',
        price: 350000,
        originalPrice: 400000,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600'],
        rating: 4.7,
        reviewsCount: 89,
        category: 'Đồ da',
        stock: 10,
        sold: 200,
        description: 'Ví da thật khâu tay tỉ mỉ, độ bền cực cao.'
    }
];

export const productsAPI = {
    getAll: () => Promise.resolve(MOCK_PRODUCTS),
    getById: (id) => Promise.resolve(MOCK_PRODUCTS.find(p => p.id === parseInt(id))),
    getCategories: () => Promise.resolve(['Túi vải', 'Nến thơm', 'Tranh nghệ thuật', 'Đồ da', 'Phụ kiện']),
    search: (keyword) => {
        const filtered = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
        return Promise.resolve(filtered);
    },
    sort: (products, sortBy) => {
        let sorted = [...products];
        if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
        return Promise.resolve(sorted);
    }
};

export const favoritesAPI = {
    getCount: (userId) => 3,
    isFavorite: (productId, userId) => false,
    addToFavorites: (productId, userId) => Promise.resolve(true),
    removeFromFavorites: (productId, userId) => Promise.resolve(true)
};

export const notificationsAPI = {
    getUnreadCount: (userId) => Promise.resolve(5),
    create: (userId, type, message) => {
        console.log(`Notification created for user ${userId}: [${type}] ${message}`);
        return Promise.resolve(true);
    }
};
