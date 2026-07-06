import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';

const Favorites = ({
  favoriteProducts,
  favsLoading,
  handleRemoveFavorite,
  handleAddFavToCart,
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="profile-tab-title">Sản Phẩm Yêu Thích</h2>

      {favsLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Đang tải danh sách sản phẩm yêu thích...</div>
      ) : favoriteProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h3 style={{ color: "#4a3e3d", marginBottom: "10px" }}>Danh sách yêu thích trống</h3>
          <p style={{ color: "#a0938a", marginBottom: "25px" }}>Hãy thả tim những sản phẩm bạn yêu thích khi mua sắm nhé!</p>
          <Link to="/products" className="btn-order-buy-again" style={{ textDecoration: "none" }}>
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="favorites-list-grid">
          {favoriteProducts.map((prod) => (
            <div className="fav-card" key={prod.id}>
              <div className="fav-card-img" onClick={() => navigate(`/products/${prod.slug}`)}>
                <img
                  src={prod.image || "https://placehold.co/300x300?text=No+Image"}
                  alt={prod.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300?text=No+Image"; }}
                />
                <button
                  className="btn-remove-fav"
                  title="Xóa khỏi yêu thích"
                  onClick={(e) => handleRemoveFavorite(prod.id, e)}
                >
                  <FontAwesomeIcon icon={icons.trash} style={{ fontSize: "0.85rem" }} />
                </button>
              </div>
              <div className="fav-card-body">
                <span className="fav-card-cat">{prod.category}</span>
                <h4 className="fav-card-title" onClick={() => navigate(`/products/${prod.slug}`)}>
                  {prod.name}
                </h4>
                <div className="fav-card-footer">
                  <span className="fav-card-price">{formatPrice(prod.price)}</span>
                  <button
                    className="btn-fav-add-cart"
                    title="Thêm vào giỏ hàng"
                    onClick={() => handleAddFavToCart(prod)}
                  >
                    <FontAwesomeIcon icon={icons.cart} style={{ fontSize: "0.85rem" }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
