import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./useToast";
import productService from "../services/productService";

// DỮ LIỆU CỨNG CHO HOMEPAGE (KHI CHƯA CÓ DB)
export const useHomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [favorites, setFavorites] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({
          page: 0,
          size: 20,
          sort: "id,desc",
        });

        const mappedProducts = response.content.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image:
            p.mainUrl || "https://via.placeholder.com/300x300?text=No+Image",
          price: p.price ? parseFloat(p.price) : 0,
          originalPrice: p.basePrice ? parseFloat(p.basePrice) : null,
          category: p.categoryName || "Chưa phân loại",
          rating: 5,
          reviews: 0,
          stock: 10,
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Lỗi tải sản phẩm trang chủ:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const bestSelling = [...products].slice(0, 4);
      setBestSellingProducts(bestSelling);

      const discounted = products
        .filter((p) => p.originalPrice && p.originalPrice > p.price)
        .slice(0, 4);
      setDiscountedProducts(discounted);
    } else {
      setBestSellingProducts([]);
      setDiscountedProducts([]);
    }
  }, [products]);

  const handleAddToCart = async (productId) => {
    addToCart(productId, 1);
    addToast("Đã thêm sản phẩm vào giỏ hàng", "success");
  };

  const handleToggleFavorite = async (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter((id) => id !== productId));
      addToast("Đã xóa khỏi yêu thích", "success");
    } else {
      setFavorites([...favorites, productId]);
      addToast("Đã thêm vào yêu thích", "success");
    }
  };

  const handleProductClick = (product) => {
    const target = product.slug || product.id;
    navigate(`/products/${target}`);
  };

  const handleViewProducts = () => {
    navigate("/products");
  };

  return {
    products,
    loading,
    favorites,
    bestSellingProducts,
    discountedProducts,
    handleAddToCart,
    handleToggleFavorite,
    handleProductClick,
    handleViewProducts,
  };
};
