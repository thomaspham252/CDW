import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "./usePagination";
import { useFavorites } from "./useFavorites";
import { useToast } from "./useToast";
import { notificationsAPI } from "../services/api";
import productService from "../services/productService"; // API thật từ backend

export const useProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToast } = useToast();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const categoryParam = searchParams.get("category") || "";
  const appliedSearchKeyword = searchParams.get("search") || "";

  // Động số sản phẩm mỗi trang dựa vào sidebar
  const itemsPerPage = useMemo(() => (isSidebarOpen ? 6 : 8), [isSidebarOpen]);

  // Sử dụng usePagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    handlePageChange,
  } = usePagination(filteredProducts, itemsPerPage, true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const matchedCategory = categories.find(
          (category) =>
            String(category.id) === categoryParam ||
            category.slug === categoryParam ||
            category.name === categoryParam,
        );

        const response = await productService.getProducts({
          page: 0,
          size: 200,
          sort: "id,desc",
          categoryId: matchedCategory?.id,
          search: appliedSearchKeyword || undefined,
        });

        // Map data từ backend sang format frontend
        const mappedProducts = response.content.map((p) => ({
          id: p.id,
          variantId: p.variantId,
          name: p.name,
          slug: p.slug,
          image:
            p.mainUrl ||
            p.imgUrl ||
            p.img_url ||
            "https://placehold.co/300x300?text=No+Image",
          price: p.price ? parseFloat(p.price) : 0,
          categoryId: p.categoryId,
          category: p.categoryName || "Chưa phân loại",
          rating:
            p.rating !== null && p.rating !== undefined ? Number(p.rating) : 0,
          reviews:
            p.reviewCount !== null && p.reviewCount !== undefined
              ? Number(p.reviewCount)
              : p.reviews !== null && p.reviews !== undefined
                ? Number(p.reviews)
                : 0,
          stock: p.stock !== null && p.stock !== undefined ? p.stock : 0,
          defaultVariantId: p.defaultVariantId,
          description: "",
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setError(
          err.response?.data?.message || "Không thể tải danh sách sản phẩm",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryParam, appliedSearchKeyword, categories]);

  useEffect(() => {
    // Lấy category từ URL query params và cập nhật state
    if (categoryParam) {
      const matchedCategory = categories.find(
        (category) =>
          String(category.id) === categoryParam ||
          category.slug === categoryParam ||
          category.name === categoryParam,
      );
      setSelectedCategory(
        matchedCategory?.name || decodeURIComponent(categoryParam),
      );
    } else {
      setSelectedCategory("");
    }

    if (appliedSearchKeyword) {
      setSearchKeyword(decodeURIComponent(appliedSearchKeyword));
    } else {
      setSearchKeyword("");
    }
  }, [categoryParam, appliedSearchKeyword, categories]);

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Lọc theo giá
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter((p) => p.price >= min);
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((p) => p.price <= max);
      }
    }

    // Sắp xếp
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
  }, [products, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearchKeyword("");
    setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setSearchParams({ search: searchKeyword.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryChange = (category) => {
    const categoryValue = category?.name || "";
    setSelectedCategory(categoryValue);
    if (category) {
      setSearchParams({ category: category.slug || String(category.id) });
    } else {
      setSearchParams({});
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleAddToCart = async (productId) => {
    try {
      // Tìm product trong danh sách để lấy đầy đủ thông tin
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const variantId = product.variantId || product.defaultVariantId;
      if (!variantId) {
        addToast("Sản phẩm chưa có phân loại để thêm vào giỏ hàng", "error");
        return;
      }

      addToCart(
        {
          id: variantId,
          productId: product.id,
          variantId,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: product.price,
          size: null, // Trang danh sách không chọn size
        },
        1,
      );

      if (user)
        await notificationsAPI.create(
          user.id,
          "order",
          "Đã thêm sản phẩm vào giỏ hàng",
        );
      addToast(`Đã thêm "${product.name}" vào giỏ hàng`, "success");
    } catch (err) {
      console.error(err);
      addToast("Lỗi khi thêm vào giỏ hàng", "error");
    }
  };

  const handleToggleFavorite = async (productId) => {
    if (!user) {
      const confirmLogin = window.confirm(
        "Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Bạn có muốn đăng nhập ngay bây giờ?",
      );
      if (confirmLogin) {
        navigate("/login");
      }
      return;
    }

    const result = await toggleFavorite(productId);
    if (result.success) {
      await notificationsAPI.create(user.id, "system", result.message);
      addToast(result.message, "success");
    } else {
      console.error(result.message);
      addToast(result.message || "Lỗi khi cập nhật yêu thích", "error");
    }
  };

  const handleProductClick = (productId) => {
    // Tìm product để lấy slug
    const product = products.find((p) => p.id === productId);
    if (product && product.slug) {
      navigate(`/products/${product.slug}`);
    } else {
      navigate(`/products/${productId}`);
    }
  };

  return {
    products,
    loading,
    error,
    searchKeyword,
    setSearchKeyword,
    selectedCategory,
    sortBy,
    categories,
    filteredProducts,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    isSidebarOpen,
    setIsSidebarOpen,
    currentPage,
    totalPages,
    paginatedProducts,
    handlePageChange,
    handleClearFilters,
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handleAddToCart,
    handleToggleFavorite,
    handleProductClick,
    itemsPerPage,
    isFavorite,
  };
};
