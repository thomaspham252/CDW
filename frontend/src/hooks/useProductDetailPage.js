import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './useToast';
import { productsAPI, favoritesAPI, notificationsAPI } from '../services/api';
import { useReviews } from './useReviews';

export const useProductDetailPage = (id) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImage, setActiveImage] = useState('');
    const [adding, setAdding] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // Reviews hook integration
    const productId = id ? parseInt(id) : null;
    const {
        reviews,
        loading: reviewsLoading,
        error: reviewsError,
        hasPurchased,
        canReview,
        hasReviewed,
        getUserReview,
        submitReview,
        deleteReview
    } = useReviews(productId);

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewMedia, setReviewMedia] = useState([]);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);

    useEffect(() => {
        if (getUserReview && editingReviewId) {
            if (getUserReview.id === editingReviewId) {
                setReviewRating(getUserReview.rating);
                setReviewComment(getUserReview.comment);
                setReviewMedia(getUserReview.media || []);
                setShowReviewForm(true);
            }
        } else if (!editingReviewId && !showReviewForm) {
            setReviewRating(5);
            setReviewComment('');
            setReviewMedia([]);
        }
    }, [getUserReview, editingReviewId, showReviewForm]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError('');
                const pId = parseInt(id);
                if (isNaN(pId)) throw new Error('ID sản phẩm không hợp lệ');
                const p = await productsAPI.getById(pId);
                if (!p) throw new Error('Không tìm thấy sản phẩm');

                setProduct(p);
                setActiveImage(p.images?.[0] || p.image || '');
                setIsFavorite(user ? favoritesAPI.isFavorite(pId, user.id) : false);

                if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0]);
                if (p.types && p.types.length > 0) setSelectedType(p.types[0]);
                setQuantity(1);
            } catch (err) {
                setError(err.message || 'Đã xảy ra lỗi khi tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        if (id) loadData();
    }, [id, user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isTypeDropdownOpen && !event.target.closest('.custom-dropdown')) {
                setIsTypeDropdownOpen(false);
            }
        };
        if (isTypeDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isTypeDropdownOpen]);

    const handleAddToCart = async () => {
        if (!product) return;
        if (product.colors?.length > 0 && !selectedColor) return alert('Vui lòng chọn màu sắc');
        if (product.types?.length > 0 && !selectedType) return alert('Vui lòng chọn loại sản phẩm');
        if (quantity <= 0) return alert('Số lượng phải lớn hơn 0');
        if (quantity > product.stock) return alert(`Chỉ còn ${product.stock} sản phẩm trong kho`);

        try {
            setAdding(true);
            await addToCart(product.id, quantity, { color: selectedColor, type: selectedType });
            if (user) await notificationsAPI.create(user.id, 'order', `Đã thêm sản phẩm ${product.name} vào giỏ hàng`);
            addToast(`Đã thêm ${product.name} vào giỏ`, 'success');
            setQuantity(1);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi thêm vào giỏ hàng', 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const newQty = prev + delta;
            if (newQty < 1) return 1;
            if (product && newQty > product.stock) return product.stock;
            return newQty;
        });
    };

    const handleQuantityInput = (e) => {
        const value = parseInt(e.target.value) || 1;
        if (value < 1) setQuantity(1);
        else if (product && value > product.stock) setQuantity(product.stock);
        else setQuantity(value);
    };

    const handleToggleFavorite = async () => {
        if (!product) return;
        if (!user) {
            // Navigation handled or confirm
            if (window.confirm('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Bạn có muốn đăng nhập ngay bây giờ?')) {
                navigate('/login');
            }
            return;
        }
        try {
            if (isFavorite) {
                await favoritesAPI.removeFromFavorites(product.id, user.id);
                await notificationsAPI.create(user.id, 'system', 'Đã xóa sản phẩm khỏi yêu thích');
                addToast('Đã xóa khỏi yêu thích', 'success');
            } else {
                await favoritesAPI.addToFavorites(product.id, user.id);
                await notificationsAPI.create(user.id, 'system', 'Đã thêm sản phẩm vào yêu thích');
                addToast('Đã thêm vào yêu thích', 'success');
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi cập nhật yêu thích', 'error');
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + reviewMedia.length > 5) return setReviewError('Bạn chỉ được tải lên tối đa 5 ảnh/video');

        const newMedia = [];
        for (const file of files) {
            if (file.size > 50 * 1024 * 1024) {
                setReviewError(`File ${file.name} quá lớn (tối đa 50MB)`);
                continue;
            }
            const reader = new FileReader();
            await new Promise(resolve => {
                reader.onload = e => {
                    newMedia.push({ type: file.type.startsWith('video/') ? 'video' : 'image', url: e.target.result });
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }
        setReviewMedia(prev => [...prev, ...newMedia]);
    };

    const removeMedia = (index) => setReviewMedia(prev => prev.filter((_, i) => i !== index));

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!productId) return;
        if (reviewRating === 0) return setReviewError('Vui lòng chọn số sao đánh giá');
        if (!reviewComment.trim() || reviewComment.trim().length < 5) return setReviewError('Bình luận phải có ít nhất 5 ký tự');

        try {
            setSubmittingReview(true);
            await submitReview(reviewRating, reviewComment, reviewMedia, editingReviewId);
            if (user) await notificationsAPI.create(user.id, 'system', editingReviewId ? 'Đã cập nhật đánh giá' : 'Cảm ơn bạn đã đánh giá sản phẩm');
            addToast('Gửi đánh giá thành công', 'success');
            setReviewComment('');
            setReviewRating(5);
            setReviewMedia([]);
            setShowReviewForm(false);
            setEditingReviewId(null);
        } catch (err) {
            setReviewError(err.message || 'Có lỗi xảy ra khi gửi đánh giá');
            addToast(err.message || 'Lỗi gửi đánh giá', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review.id);
        setReviewRating(review.rating);
        setReviewComment(review.comment);
        setReviewMedia(review.media || []);
        setShowReviewForm(true);
        setReviewError('');
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
        try {
            await deleteReview(reviewId);
            if (user) await notificationsAPI.create(user.id, 'system', 'Đã xóa đánh giá');
            addToast('Đã xóa đánh giá', 'success');
            setShowReviewForm(false);
            setEditingReviewId(null);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi xóa đánh giá', 'error');
        }
    };

    const getColorHex = (colorName) => {
        const colorMap = {
            'Đỏ': '#dc3545',
            'Xanh dương': '#007bff',
            'Xanh lá': '#28a745',
            'Vàng': '#ffc107',
            'Cam': '#fd7e14',
            'Tím': '#6f42c1',
            'Hồng': '#e83e8c',
            'Đen': '#000000',
            'Trắng': '#ffffff',
            'Xám': '#6c757d',
            'Nâu': '#8b4513',
            'Be': '#f5f5dc',
            'Kem': '#fffdd0',
            'Xanh nhạt': '#87ceeb',
            'Hồng nhạt': '#ffb6c1',
        };
        return colorMap[colorName] || '#667eea';
    };

    const stockBadge = useMemo(() => {
        if (!product) return '';
        if (product.stock === 0) return 'Hết hàng';
        if (product.stock < 3) return `Chỉ còn ${product.stock}`;
        return `Còn ${product.stock} sản phẩm`;
    }, [product]);

    return {
        product,
        loading,
        error,
        isFavorite,
        activeImage,
        setActiveImage,
        adding,
        selectedColor,
        setSelectedColor,
        selectedType,
        setSelectedType,
        quantity,
        handleQuantityChange,
        handleQuantityInput,
        isTypeDropdownOpen,
        setIsTypeDropdownOpen,
        activeTab,
        setActiveTab,
        isDescExpanded,
        setIsDescExpanded,
        reviews,
        reviewsLoading,
        reviewsError,
        hasPurchased,
        canReview,
        hasReviewed,
        getUserReview,
        showReviewForm,
        setShowReviewForm,
        reviewRating,
        setReviewRating,
        reviewComment,
        setReviewComment,
        reviewMedia,
        setReviewMedia,
        submittingReview,
        reviewError,
        setReviewError,
        editingReviewId,
        setEditingReviewId,
        handleAddToCart,
        handleToggleFavorite,
        handleFileChange,
        removeMedia,
        handleSubmitReview,
        handleEditReview,
        handleDeleteReview,
        stockBadge,
        getColorHex,
        user
    };
};