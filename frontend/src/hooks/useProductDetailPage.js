import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./useToast";
import { favoritesAPI, notificationsAPI } from "../services/api";
import { useReviews } from "./useReviews";
import productService from "../services/productService"; // API thật từ backend

export const useProductDetailPage = (id) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
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
    deleteReview,
  } = useReviews(productId);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMedia, setReviewMedia] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
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
      setReviewComment("");
      setReviewMedia([]);
    }
  }, [getUserReview, editingReviewId, showReviewForm]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) throw new Error("ID sản phẩm không hợp lệ");

        // Gọi API backend thật - dùng slug
        const data = await productService.getProductBySlug(id);

        if (!data) throw new Error("Không tìm thấy sản phẩm");

        // Map data từ backend sang format frontend
        const mappedProduct = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || "Chưa có mô tả",
          category: data.categoryName || "Chưa phân loại",
          rating: 5, // Backend chưa có rating
          stock: 10, // Backend chưa có stock
          image: null,
          images: [],
          price: 0,
          colors: [],
          types: [],
        };

        // Xử lý variants
        if (data.variants && data.variants.length > 0) {
          // Lấy variant đầu tiên làm mặc định
          const firstVariant = data.variants[0];
          mappedProduct.price = firstVariant.price
            ? parseFloat(firstVariant.price)
            : 0;

          // Lấy images từ variant
          if (firstVariant.images && firstVariant.images.length > 0) {
            mappedProduct.images = firstVariant.images.map((img) => img.imgUrl);
            mappedProduct.image =
              firstVariant.images.find((img) => img.isMain)?.imgUrl ||
              firstVariant.images[0].imgUrl;
          }

          // Tạo types từ variants (size)
          mappedProduct.types = data.variants
            .filter((v) => v.size)
            .map((v) => v.size);
        }

        setProduct(mappedProduct);
        setActiveImage(
          mappedProduct.image ||
            mappedProduct.images[0] ||
            "https://placehold.co/600x600?text=No+Image",
        );
        setIsFavorite(user ? favoritesAPI.isFavorite(data.id, user.id) : false);

        if (mappedProduct.colors && mappedProduct.colors.length > 0)
          setSelectedColor(mappedProduct.colors[0]);
        if (mappedProduct.types && mappedProduct.types.length > 0)
          setSelectedType(mappedProduct.types[0]);
        setQuantity(1);

        setRelatedLoading(true);
        try {
          const relatedResponse = await productService.getProducts({
            page: 0,
            size: 12,
            sort: "id,desc",
          });

          const mappedRelated = relatedResponse.content.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            image:
              p.mainUrl || "https://placehold.co/300x300?text=No+Image",
            price: p.price ? parseFloat(p.price) : 0,
            category: p.categoryName || "Chưa phân loại",
          }));

          const filteredRelated = mappedRelated
            .filter((p) => p.id !== mappedProduct.id)
            .filter((p) => p.category === mappedProduct.category)
            .slice(0, 8);

          setRelatedProducts(filteredRelated);
        } catch (relatedErr) {
          console.error("Lỗi tải sản phẩm liên quan:", relatedErr);
          setRelatedProducts([]);
        } finally {
          setRelatedLoading(false);
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Đã xảy ra lỗi khi tải sản phẩm",
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTypeDropdownOpen && !event.target.closest(".custom-dropdown")) {
        setIsTypeDropdownOpen(false);
      }
    };
    if (isTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isTypeDropdownOpen]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.colors?.length > 0 && !selectedColor)
      return alert("Vui lòng chọn màu sắc");
    if (product.types?.length > 0 && !selectedType)
      return alert("Vui lòng chọn loại sản phẩm");
    if (quantity <= 0) return alert("Số lượng phải lớn hơn 0");
    if (quantity > product.stock)
      return alert(`Chỉ còn ${product.stock} sản phẩm trong kho`);

    try {
      setAdding(true);
      // Truyền object đầy đủ vào CartContext
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        size: selectedType || selectedColor || null,
      }, quantity);
      if (user)
        await notificationsAPI.create(
          user.id,
          "order",
          `Đã thêm sản phẩm ${product.name} vào giỏ hàng`,
        );
      addToast(`Đã thêm ${product.name} vào giỏ`, "success");
      setQuantity(1);
    } catch (err) {
      console.error(err);
      addToast("Lỗi khi thêm vào giỏ hàng", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
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
      if (
        window.confirm(
          "Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Bạn có muốn đăng nhập ngay bây giờ?",
        )
      ) {
        navigate("/login");
      }
      return;
    }
    try {
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(product.id, user.id);
        await notificationsAPI.create(
          user.id,
          "system",
          "Đã xóa sản phẩm khỏi yêu thích",
        );
        addToast("Đã xóa khỏi yêu thích", "success");
      } else {
        await favoritesAPI.addToFavorites(product.id, user.id);
        await notificationsAPI.create(
          user.id,
          "system",
          "Đã thêm sản phẩm vào yêu thích",
        );
        addToast("Đã thêm vào yêu thích", "success");
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
      addToast("Lỗi khi cập nhật yêu thích", "error");
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewMedia.length > 5)
      return setReviewError("Bạn chỉ được tải lên tối đa 5 ảnh/video");

    const newMedia = [];
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setReviewError(`File ${file.name} quá lớn (tối đa 50MB)`);
        continue;
      }
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (e) => {
          newMedia.push({
            type: file.type.startsWith("video/") ? "video" : "image",
            url: e.target.result,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setReviewMedia((prev) => [...prev, ...newMedia]);
  };

  const removeMedia = (index) =>
    setReviewMedia((prev) => prev.filter((_, i) => i !== index));

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!productId) return;
    if (reviewRating === 0)
      return setReviewError("Vui lòng chọn số sao đánh giá");
    if (!reviewComment.trim() || reviewComment.trim().length < 5)
      return setReviewError("Bình luận phải có ít nhất 5 ký tự");

    try {
      setSubmittingReview(true);
      await submitReview(
        reviewRating,
        reviewComment,
        reviewMedia,
        editingReviewId,
      );
      if (user)
        await notificationsAPI.create(
          user.id,
          "system",
          editingReviewId
            ? "Đã cập nhật đánh giá"
            : "Cảm ơn bạn đã đánh giá sản phẩm",
        );
      addToast("Gửi đánh giá thành công", "success");
      setReviewComment("");
      setReviewRating(5);
      setReviewMedia([]);
      setShowReviewForm(false);
      setEditingReviewId(null);
    } catch (err) {
      setReviewError(err.message || "Có lỗi xảy ra khi gửi đánh giá");
      addToast(err.message || "Lỗi gửi đánh giá", "error");
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
    setReviewError("");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await deleteReview(reviewId);
      if (user)
        await notificationsAPI.create(user.id, "system", "Đã xóa đánh giá");
      addToast("Đã xóa đánh giá", "success");
      setShowReviewForm(false);
      setEditingReviewId(null);
    } catch (err) {
      console.error(err);
      addToast("Lỗi khi xóa đánh giá", "error");
    }
  };

  const getColorHex = (colorName) => {
    const colorMap = {
      Đỏ: "#dc3545",
      "Xanh dương": "#007bff",
      "Xanh lá": "#28a745",
      Vàng: "#ffc107",
      Cam: "#fd7e14",
      Tím: "#6f42c1",
      Hồng: "#e83e8c",
      Đen: "#000000",
      Trắng: "#ffffff",
      Xám: "#6c757d",
      Nâu: "#8b4513",
      Be: "#f5f5dc",
      Kem: "#fffdd0",
      "Xanh nhạt": "#87ceeb",
      "Hồng nhạt": "#ffb6c1",
    };
    return colorMap[colorName] || "#667eea";
  };

  const stockBadge = useMemo(() => {
    if (!product) return "";
    if (product.stock === 0) return "Hết hàng";
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
    relatedProducts,
    relatedLoading,
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
    user,
  };
};
