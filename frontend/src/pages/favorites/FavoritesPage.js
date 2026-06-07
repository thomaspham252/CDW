import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { favoritesAPI } from "../../services/api";
import productService from "../../services/productService";
import { formatPrice } from "../../utils/formatPrice";
import { FontAwesomeIcon, icons } from "../../utils/icons";
import "../../styles/favorites/FavoritesPage.css";

const ITEMS_PER_PAGE = 8;

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { authLoaded, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoaded) return;

    if (!isAuthenticated) {
      navigate("/login?redirect=favorites", { replace: true });
      return;
    }

    const loadFavorites = async () => {
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
            name: catalogProduct.name || product.name,
            slug: catalogProduct.slug || product.slug,
            image,
            price: rawPrice !== null && rawPrice !== undefined ? parseFloat(rawPrice) : null,
          };
          }),
        );
      } catch (err) {
        console.error("Lỗi tải wishlist:", err);
        setError("Không thể tải danh sách sản phẩm yêu thích.");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [authLoaded, isAuthenticated, navigate]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRemoveFavorite = async (productId) => {
    try {
      await favoritesAPI.removeFromFavorites(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (err) {
      console.error("Lỗi xóa wishlist:", err);
      setError("Không thể xóa sản phẩm khỏi yêu thích.");
    }
  };

  if (!authLoaded || loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-shell">
          <div className="favorites-loading">Đang tải sản phẩm yêu thích...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <section className="favorites-shell">
        <div className="favorites-header">
          <h1>Sản Phẩm Yêu Thích</h1>
          <span className="favorites-count">{products.length} sản phẩm</span>
        </div>

        {error && <div className="favorites-error">{error}</div>}

        {products.length === 0 ? (
          <div className="favorites-empty">
            <FontAwesomeIcon icon={icons.heartRegular} />
            <h2>Chưa có sản phẩm yêu thích</h2>
            <p>Hãy bấm tim ở sản phẩm bạn thích để lưu lại tại đây.</p>
            <Link to="/products" className="favorites-shop-link">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <div className="favorites-grid">
              {paginatedProducts.map((product) => (
                <article key={product.id} className="favorite-card">
                  <div
                    className="favorite-image-wrap"
                    onClick={() => navigate(`/products/${product.slug || product.id}`)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/500x500?text=No+Image";
                      }}
                    />
                    <button
                      type="button"
                      className="favorite-heart active"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(product.id);
                      }}
                      title="Xóa khỏi yêu thích"
                    >
                      <FontAwesomeIcon icon={icons.heart} />
                    </button>
                  </div>

                  <h2
                    className="favorite-name"
                    onClick={() => navigate(`/products/${product.slug || product.id}`)}
                  >
                    {product.name}
                  </h2>
                  <div className="favorite-price">
                    {product.price !== null ? formatPrice(product.price) : "Chưa cập nhật giá"}
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="favorites-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  <FontAwesomeIcon icon={icons.chevronLeft} />
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  <FontAwesomeIcon icon={icons.chevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default FavoritesPage;
