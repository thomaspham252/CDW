import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../hooks/useFavorites";
import { useToast } from "../../hooks/useToast";
import { FontAwesomeIcon, icons } from "../../utils/icons";
import { formatPrice } from "../../utils/formatPrice";
import productService from "../../services/productService";
import "../../styles/favorites/FavoritesPage.css";
import {favoritesAPI} from "../../services/api";

const FavoritesPage = () => {
  const { isAuthenticated, authLoaded } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tải danh sách sản phẩm từ backend và lọc
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const [wishlistProducts, catalogResponse] = await Promise.all([
          favoritesAPI.getProducts(),
          productService.getProducts({
            page: 0,
            size: 200,
            sort: "id,desc",
          }),
        ]);
        const catalogById = new Map(
          (catalogResponse.content || []).map((product) => [Number(product.id), product]),
        );

        setProducts(
          wishlistProducts.map((product) => {
            const catalogProduct = catalogById.get(Number(product.id)) || {};
            const image =
              product.mainUrl ||
              product.imgUrl ||
              product.img_url ||
              catalogProduct.mainUrl ||
              catalogProduct.imgUrl ||
              catalogProduct.img_url ||
              "https://placehold.co/500x500?text=No+Image";
            const rawPrice =
              product.price ??
              catalogProduct.price ??
              null;

            return {
              id: product.id,
              variantId: product.variantId || catalogProduct.variantId,
              name: catalogProduct.name || product.name,
              slug: catalogProduct.slug || product.slug,
              image,
              price: rawPrice !== null && rawPrice !== undefined ? parseFloat(rawPrice) : 0,
              category: catalogProduct.categoryName || product.categoryName || "Chưa phân loại",
            };
          }),
        );
      } catch (err) {
        console.error("Lỗi tải sản phẩm yêu thích:", err);
        setError(err.response?.data?.message || "Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (authLoaded && isAuthenticated) {
      loadProducts();
    }
  }, [authLoaded, isAuthenticated]);

  // Lọc sản phẩm đã thích từ danh sách ID trong localStorage
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const handleRemoveFavorite = async (e, productId, name) => {
    e.stopPropagation();
    e.preventDefault();
    const result = await toggleFavorite(productId);
    if (result.success) {
      addToast(`Đã xóa "${name}" khỏi danh sách yêu thích`, "success");
    } else {
      addToast("Lỗi khi xóa sản phẩm", "error");
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        size: null,
      },
      1
    );
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`, "success");
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authLoaded && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoaded, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page">
        <div className="favorites-error">
          <FontAwesomeIcon icon={icons.warning} className="error-icon" />
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <Link to="/products" className="btn-back">Quay lại mua sắm</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        {/* Header */}
        <div className="favorites-header">
          <h1>
            <FontAwesomeIcon icon={icons.heart} className="heart-header-icon" />
            Sản phẩm yêu thích của bạn
          </h1>
          <span className="favorites-count">
            Đang lưu {favoriteProducts.length} sản phẩm
          </span>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="favorites-empty">
            <div className="empty-icon-wrapper">
              <FontAwesomeIcon icon={icons.heartRegular} />
            </div>
            <h2>Danh sách yêu thích trống</h2>
            <p>Hãy lưu những sản phẩm bạn yêu thích nhất khi tham quan mua sắm để tiện theo dõi nhé!</p>
            <Link to="/products" className="btn-shop-now">
              <FontAwesomeIcon icon={icons.chevronLeft} /> Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="fav-card">
                <Link to={`/products/${product.slug}`} className="fav-card-link">
                  {/* Image Container */}
                  <div className="fav-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/300x300?text=No+Image";
                      }}
                    />
                    {/* Action buttons on image hover / corner */}
                    <button
                      className="btn-fav-remove"
                      onClick={(e) => handleRemoveFavorite(e, product.id, product.name)}
                      title="Xóa khỏi yêu thích"
                    >
                      <FontAwesomeIcon icon={icons.trash} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="fav-info">
                    <span className="fav-category">{product.category}</span>
                    <h3 className="fav-name">{product.name}</h3>
                    <div className="fav-footer">
                      <span className="fav-price">{formatPrice(product.price)}</span>
                      <button
                        className="btn-fav-cart"
                        onClick={(e) => handleAddToCart(e, product)}
                        title="Thêm vào giỏ hàng"
                      >
                        <FontAwesomeIcon icon={icons.cart} /> Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
