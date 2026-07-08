import { useState, useEffect } from "react";

export const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      setReviews([]);
      setError(null);
    }
  }, [productId]);

  const submitReview = async (rating, comment, media, reviewId) => {
    throw new Error("Tính năng đánh giá chưa được kết nối dữ liệu từ database");
  };

  const deleteReview = async (reviewId) => {
    throw new Error("Tính năng đánh giá chưa được kết nối dữ liệu từ database");
  };

  return {
    reviews,
    loading,
    error,
    hasPurchased: false,
    canReview: false,
    hasReviewed: false,
    getUserReview: null,
    submitReview,
    deleteReview,
  };
};
