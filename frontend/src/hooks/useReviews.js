import { useState, useEffect } from 'react';

export const useReviews = (productId) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (productId) {
            // Mock reviews
            setReviews([
                { 
                    id: 1, 
                    rating: 5, 
                    comment: 'Sản phẩm tuyệt vời, rất đáng tiền!', 
                    author: 'Nguyễn Văn A', 
                    date: '2024-05-01',
                    avatar: 'A'
                },
                { 
                    id: 2, 
                    rating: 4, 
                    comment: 'Chất lượng tốt, giao hàng nhanh.', 
                    author: 'Trần Thị B', 
                    date: '2024-05-03',
                    avatar: 'B'
                }
            ]);
        }
    }, [productId]);

    const submitReview = async (rating, comment, media, reviewId) => {
        console.log('Submitting review:', { rating, comment, media, reviewId });
        return true;
    };

    const deleteReview = async (reviewId) => {
        console.log('Deleting review:', reviewId);
        return true;
    };

    return { 
        reviews, 
        loading, 
        error, 
        hasPurchased: true, 
        canReview: true, 
        hasReviewed: false,
        getUserReview: null,
        submitReview, 
        deleteReview 
    };
};
