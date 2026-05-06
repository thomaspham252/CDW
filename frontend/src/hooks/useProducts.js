import { useState, useEffect } from 'react';

export const useProducts = () => {
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Túi vải Canvas phong cách Vintage',
            price: 150000,
            originalPrice: 200000,
            image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600',
            rating: 4.8,
            reviews: 124,
            category: 'Túi vải',
            stock: 15,
            sold: 85
        },
        {
            id: 2,
            name: 'Nến thơm tinh dầu Lavender',
            price: 120000,
            originalPrice: 150000,
            image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=600',
            rating: 4.9,
            reviews: 56,
            category: 'Nến thơm',
            stock: 20,
            sold: 120
        },
        {
            id: 3,
            name: 'Tranh giấy cuộn Quilling nghệ thuật',
            price: 450000,
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600',
            rating: 5.0,
            reviews: 32,
            category: 'Tranh nghệ thuật',
            stock: 5,
            sold: 15
        },
        {
            id: 4,
            name: 'Ví da thủ công handmade',
            price: 350000,
            originalPrice: 400000,
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600',
            rating: 4.7,
            reviews: 89,
            category: 'Đồ da',
            stock: 10,
            sold: 200
        },
        {
            id: 5,
            name: 'Sổ tay bìa da khắc tên',
            price: 180000,
            image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=600',
            rating: 4.6,
            reviews: 45,
            category: 'Văn phòng phẩm',
            stock: 30,
            sold: 60
        },
        {
            id: 6,
            name: 'Móc khóa gỗ khắc laser',
            price: 45000,
            originalPrice: 60000,
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600',
            rating: 4.5,
            reviews: 210,
            category: 'Phụ kiện',
            stock: 100,
            sold: 450
        }
    ]);
    const [loading, setLoading] = useState(false);

    return { products, loading };
};
