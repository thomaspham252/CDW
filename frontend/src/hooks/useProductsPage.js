import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from './useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePagination } from './usePagination';
import { useFavorites } from './useFavorites';
import { useToast } from './useToast';
import { productsAPI, notificationsAPI } from '../services/api';

export const useProductsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, loading, error, loadProducts, searchProducts } = useProducts();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToast } = useToast();

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    // Động số sản phẩm mỗi trang dựa vào sidebar
    const itemsPerPage = useMemo(() => isSidebarOpen ? 6 : 8, [isSidebarOpen]);

    // Sử dụng usePagination hook
    const {
        currentPage,
        totalPages,
        paginatedItems: paginatedProducts,
        handlePageChange
    } = usePagination(filteredProducts, itemsPerPage, true);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        // Lấy category từ URL query params và cập nhật state
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(decodeURIComponent(categoryFromUrl));
        } else {
            setSelectedCategory('');
        }

        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchKeyword(decodeURIComponent(searchFromUrl));
        }
    }, [searchParams]);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, selectedCategory, sortBy, searchKeyword, minPrice, maxPrice]);

    const loadCategories = async () => {
        try {
            const cats = await productsAPI.getCategories();
            setCategories(cats);
        } catch (err) {
            console.error('Lỗi tải danh mục:', err);
        }
    };

    const filterAndSortProducts = async () => {
        let filtered = [...products];

        // Lọc theo danh mục
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Tìm kiếm
        if (searchKeyword) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())))
            );
        }

        // Lọc theo giá
        if (minPrice) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                filtered = filtered.filter(p => p.price >= min);
            }
        }
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                filtered = filtered.filter(p => p.price <= max);
            }
        }

        // Sắp xếp
        const sorted = await productsAPI.sort(filtered, sortBy);
        setFilteredProducts(sorted);
    };

    const handleClearFilters = () => {
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSearchKeyword('');
        setSearchParams({});
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            setSearchParams({ search: searchKeyword.trim() });
            searchProducts(searchKeyword);
        } else {
            loadProducts();
            setSearchParams({});
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category) {
            setSearchParams({ category: category });
        } else {
            setSearchParams({});
        }
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1);
            if (user) await notificationsAPI.create(user.id, 'order', 'Đã thêm sản phẩm vào giỏ hàng');
            addToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi thêm vào giỏ hàng', 'error');
        }
    };

    const handleToggleFavorite = async (productId) => {
        if (!user) {
            const confirmLogin = window.confirm('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Bạn có muốn đăng nhập ngay bây giờ?');
            if (confirmLogin) {
                navigate('/login');
            }
            return;
        }

        const result = await toggleFavorite(productId);
        if (result.success) {
            await notificationsAPI.create(user.id, 'system', result.message);
            addToast(result.message, 'success');
        } else {
            console.error(result.message);
            addToast(result.message || 'Lỗi khi cập nhật yêu thích', 'error');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
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
        isFavorite
    };
};
