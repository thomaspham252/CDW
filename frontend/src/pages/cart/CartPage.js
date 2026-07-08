import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon, icons } from "../../utils/icons";
import { formatPrice } from "../../utils/formatPrice";
import {
  FREE_SHIPPING_THRESHOLD,
  getShippingFee,
} from "../../config/paymentConfig";
import "../../styles/cart/CartPage.css";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalPrice } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [removingKey, setRemovingKey] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    type: null,
    key: null,
  });
  const [selectedKeys, setSelectedKeys] = useState(() =>
    cart.map((item) => item.key),
  );

  useEffect(() => {
    setSelectedKeys((prev) =>
      prev.filter((key) => cart.some((item) => item.key === key)),
    );
  }, [cart]);

  const selectedItems = useMemo(
    () => cart.filter((item) => selectedKeys.includes(item.key)),
    [cart, selectedKeys],
  );

  const selectedTotalPrice = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [selectedItems],
  );

  const isAllSelected = cart.length > 0 && selectedKeys.length === cart.length;
  const hasSelectedItems = selectedItems.length > 0;

  const handleRequestRemove = (key) => {
    setConfirmDelete({ open: true, type: "single", key });
  };

  const handleRequestClearAll = () => {
    setConfirmDelete({ open: true, type: "all", key: null });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.type === "single" && confirmDelete.key) {
      const key = confirmDelete.key;
      setRemovingKey(key);
      setTimeout(() => {
        removeFromCart(key);
        setSelectedKeys((prev) => prev.filter((itemKey) => itemKey !== key));
        setRemovingKey(null);
      }, 300);
    }

    if (confirmDelete.type === "all") {
      clearCart();
      setSelectedKeys([]);
    }

    setConfirmDelete({ open: false, type: null, key: null });
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, type: null, key: null });
  };

  const handleToggleItem = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key)
        ? prev.filter((itemKey) => itemKey !== key)
        : [...prev, key],
    );
  };

  const handleToggleAll = () => {
    setSelectedKeys(isAllSelected ? [] : cart.map((item) => item.key));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      if (window.confirm("Bạn cần đăng nhập để thanh toán. Đăng nhập ngay?")) {
        navigate("/login?redirect=checkout");
      }
      return;
    }
    if (!hasSelectedItems) {
      window.alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }
    navigate("/checkout", { state: { selectedItems } });
  };

  // Giỏ hàng trống
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <FontAwesomeIcon icon={icons.cart} />
          </div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Link to="/products" className="btn-continue-shopping">
            <FontAwesomeIcon icon={icons.chevronLeft} />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const shippingFee = getShippingFee(selectedTotalPrice);
  const finalTotal = selectedTotalPrice + shippingFee;

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h1>
            <FontAwesomeIcon icon={icons.cart} />
            Giỏ hàng của bạn
          </h1>
          <span className="cart-count">
            {cart.reduce((t, i) => t + i.quantity, 0)} sản phẩm
          </span>
        </div>

        <div className="cart-layout">
          {/* Danh sách sản phẩm */}
          <div className="cart-items">
            {/* Tiêu đề cột */}
            <div className="cart-items-header">
              <span className="col-select">
                <input
                  type="checkbox"
                  className="cart-select-all"
                  checked={isAllSelected}
                  onChange={handleToggleAll}
                  aria-label="Chọn tất cả sản phẩm"
                />
              </span>
              <span className="col-product">Sản phẩm</span>
              <span className="col-price">Đơn giá</span>
              <span className="col-qty">Số lượng</span>
              <span className="col-total">Thành tiền</span>
              <span className="col-action"></span>
            </div>

            {/* Từng sản phẩm */}
            {cart.map((item) => (
              <div
                key={item.key}
                className={`cart-item ${removingKey === item.key ? "removing" : ""}`}
              >
                <div className="col-select">
                  <input
                    type="checkbox"
                    className="cart-select-item"
                    checked={selectedKeys.includes(item.key)}
                    onChange={() => handleToggleItem(item.key)}
                    aria-label={`Chọn ${item.name}`}
                  />
                </div>

                {/* Ảnh + Tên */}
                <div className="col-product">
                  <div className="item-image">
                    <img
                      src={
                        item.image || "https://placehold.co/80x80?text=No+Image"
                      }
                      alt={item.name}
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/80x80?text=No+Image")
                      }
                    />
                  </div>
                  <div className="item-info">
                    <Link to={`/products/${item.slug}`} className="item-name">
                      {item.name}
                    </Link>
                    {item.size && (
                      <span className="item-variant">
                        Phân loại: {item.size}
                      </span>
                    )}
                  </div>
                </div>

                {/* Đơn giá */}
                <div className="col-price">
                  <span className="price">{formatPrice(item.price)}</span>
                </div>

                {/* Số lượng */}
                <div className="col-qty">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <FontAwesomeIcon icon={icons.minus} />
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={item.quantity}
                      min="1"
                      onChange={(e) =>
                        updateQuantity(item.key, parseInt(e.target.value) || 1)
                      }
                    />
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                    >
                      <FontAwesomeIcon icon={icons.plus} />
                    </button>
                  </div>
                </div>

                {/* Thành tiền */}
                <div className="col-total">
                  <span className="item-total">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                {/* Xóa */}
                <div className="col-action">
                  <button
                    className="btn-remove"
                    onClick={() => handleRequestRemove(item.key)}
                    title="Xóa sản phẩm"
                  >
                    <FontAwesomeIcon icon={icons.times} />
                  </button>
                </div>
              </div>
            ))}

            {/* Footer của danh sách */}
            <div className="cart-items-footer">
              <Link to="/products" className="btn-continue">
                <FontAwesomeIcon icon={icons.chevronLeft} />
                Tiếp tục mua sắm
              </Link>
              <button className="btn-clear" onClick={handleRequestClearAll}>
                <FontAwesomeIcon icon={icons.times} />
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(selectedTotalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? "free-shipping" : ""}>
                  {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <div className="shipping-note">
                  <FontAwesomeIcon icon={icons.tag} />
                  Mua thêm{" "}
                  {formatPrice(
                    Math.max(0, FREE_SHIPPING_THRESHOLD - selectedTotalPrice),
                  )}{" "}
                  để được miễn phí ship
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>Tổng cộng</span>
                <span className="total-price">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={!hasSelectedItems}
            >
              <FontAwesomeIcon icon={icons.cart} />
              Tiến hành thanh toán
            </button>
            {!isAuthenticated && (
              <p className="login-hint">
                <Link to="/login">Đăng nhập</Link> để thanh toán nhanh hơn
              </p>
            )}
          </div>
        </div>

        {confirmDelete.open && (
          <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
            <div
              className="delete-confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Bạn có muốn xóa không</h3>
              <p>
                {confirmDelete.type === "all"
                  ? "Toàn bộ sản phẩm trong giỏ sẽ bị xóa."
                  : "Sản phẩm này sẽ bị xóa khỏi giỏ hàng."}
              </p>
              <div className="delete-confirm-actions">
                <button className="btn-confirm-no" onClick={handleCancelDelete}>
                  Không
                </button>
                <button
                  className="btn-confirm-yes"
                  onClick={handleConfirmDelete}
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
