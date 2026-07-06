import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { FontAwesomeIcon, icons } from "../../utils/icons";
import { formatPrice } from "../../utils/formatPrice";
import { updateProfile, changePassword, getMyOrders } from "../../services/auth/authService";
import { favoritesAPI } from "../../services/api";

// Import Components
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import ProfileInfo from "../../components/profile/ProfileInfo";
import PasswordChange from "../../components/profile/PasswordChange";
import AddressBook from "../../components/profile/AddressBook";
import Orders from "../../components/profile/Orders";
import Favorites from "../../components/profile/Favorites";

// Import Styles
import "../../styles/profile/Profile.css";
import "../../styles/profile/OrdersNew.css";

const ProfilePage = () => {
  const { user, isAuthenticated, authLoaded, logout, updateUserLocal } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Navigation Guard
  useEffect(() => {
    if (authLoaded && !isAuthenticated) {
      navigate("/login?redirect=profile");
    }
  }, [authLoaded, isAuthenticated, navigate]);

  // Tab State: 'profile' | 'orders' | 'favorites'
  const [activeTab, setActiveTab] = useState("profile");

  // Avatar State (stored in localStorage per user)
  const [avatar, setAvatar] = useState("https://placehold.co/150x150?text=Avatar");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    gender: "MALE",
  });
  const [originalForm, setOriginalForm] = useState({
    fullName: "",
    phone: "",
    gender: "MALE",
  });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Address Book State
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    detail: "",
    type: "Nhà riêng",
    isDefault: false,
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Favorites State
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favsLoading, setFavsLoading] = useState(false);

  // Load User Data & Initialize Profile Form
  useEffect(() => {
    if (user) {
      const initialData = {
        fullName: user.fullName || "",
        phone: user.phone || "",
        gender: user.gender || "MALE",
      };
      setProfileForm(initialData);
      setOriginalForm(initialData);

      // Load avatar from localStorage
      const savedAvatar = localStorage.getItem(`cdw_avatar_${user.userId}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      } else {
        setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`);
      }

      // Load Address Book
      const savedAddresses = localStorage.getItem(`cdw_addresses_${user.userId}`);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      } else {
        const defaultAddress = [
          {
            id: 1,
            name: user.fullName || "Nguyễn Văn A",
            phone: user.phone || "0912345678",
            detail: "123 Đường Nguyễn Trãi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
            isDefault: true,
            type: "Nhà riêng",
          },
        ];
        setAddresses(defaultAddress);
        localStorage.setItem(`cdw_addresses_${user.userId}`, JSON.stringify(defaultAddress));
      }
    }
  }, [user]);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
      setOrdersError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/api")) return url;
    const backendBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const loadFavoriteProducts = useCallback(async () => {
    if (!user) return;
    try {
      setFavsLoading(true);
      const wishlistProducts = await favoritesAPI.getProducts();

      const mappedFavs = wishlistProducts.map((p) => ({
        id: p.id,
        variantId: p.variantId,
        name: p.name,
        slug: p.slug,
        image: resolveImageUrl(p.mainUrl || p.imgUrl || p.img_url),
        price: p.price ? parseFloat(p.price) : 0,
        category: p.categoryName || "Chưa phân loại",
      }));

      setFavoriteProducts(mappedFavs);
    } catch (err) {
      console.error("Lỗi lấy sản phẩm yêu thích:", err);
    } finally {
      setFavsLoading(false);
    }
  }, [user]);

  // Load Order History when clicking on Tab
  useEffect(() => {
    if (activeTab === "orders" && user) {
      loadOrders();
    }
  }, [activeTab, user, loadOrders]);

  // Load Favorite Products when clicking on Tab
  useEffect(() => {
    if (activeTab === "favorites" && user) {
      loadFavoriteProducts();
    }
  }, [activeTab, user, loadFavoriteProducts]);

  // Profile Form Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileCancel = () => {
    setProfileForm(originalForm);
    setProfileSuccess("");
    setProfileError("");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setProfileSaving(true);

    if (!profileForm.fullName.trim()) {
      setProfileError("Họ tên không được để trống");
      setProfileSaving(false);
      return;
    }

    try {
      const updatedUser = await updateProfile(
        profileForm.fullName,
        profileForm.phone,
        profileForm.gender
      );

      updateUserLocal({
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
      });

      setOriginalForm(profileForm);
      setProfileSuccess("Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || "Lỗi xảy ra khi cập nhật thông tin.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Password Form Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");
    setPasswordSaving(true);

    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ các thông tin mật khẩu.");
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và mật khẩu xác nhận không khớp.");
      setPasswordSaving(false);
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess("Đổi mật khẩu thành công!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || "Đổi mật khẩu thất bại. Mật khẩu cũ không chính xác.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Avatar Upload Handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Dung lượng ảnh phải nhỏ hơn 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setAvatar(base64Data);
        localStorage.setItem(`cdw_avatar_${user.userId}`, base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Address Book Handlers
  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        phone: address.phone,
        detail: address.detail,
        type: address.type,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: user?.fullName || "",
        phone: user?.phone || "",
        detail: "",
        type: "Nhà riêng",
        isDefault: addresses.length === 0,
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSave = (e) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.detail) {
      alert("Vui lòng điền đầy đủ các thông tin địa chỉ.");
      return;
    }

    let updatedAddresses = [...addresses];

    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAddress) {
      updatedAddresses = updatedAddresses.map((a) =>
        a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a
      );
    } else {
      const newAddress = {
        ...addressForm,
        id: Date.now(),
      };
      updatedAddresses.push(newAddress);
    }

    if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    setAddresses(updatedAddresses);
    localStorage.setItem(`cdw_addresses_${user.userId}`, JSON.stringify(updatedAddresses));
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (addressId, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      let updatedAddresses = addresses.filter((a) => a.id !== addressId);
      
      if (addresses.find((a) => a.id === addressId)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setAddresses(updatedAddresses);
      localStorage.setItem(`cdw_addresses_${user.userId}`, JSON.stringify(updatedAddresses));
    }
  };

  const handleOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleBuyAgain = (order) => {
    if (!order.items || order.items.length === 0) return;

    order.items.forEach((item) => {
      addToCart(
        {
          id: item.variantId,
          variantId: item.variantId,
          name: item.productName,
          slug: item.productSlug,
          image: item.imageUrl,
          price: parseFloat(item.price),
          size: item.size || null,
        },
        item.quantity
      );
    });

    alert("Đã thêm toàn bộ sản phẩm trong đơn hàng vào giỏ hàng!");
    navigate("/cart");
  };

  const getOrderStatusLabel = (status) => {
    const labels = {
      WAITING_CONFIRMATION: "Chờ xác nhận",
      WAITING_PICKUP: "Chờ lấy hàng",
      SHIPPING: "Chờ vận chuyển",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return labels[status] || status || "Chờ xử lý";
  };

  const getPaymentStatusLabel = (status, method) => {
    if (method === "COD") return "COD";
    const labels = {
      UNPAID: "Chờ thanh toán",
      PAID: "Đã thanh toán",
      FAILED: "Thanh toán lỗi",
      COD: "COD",
    };
    return labels[status] || "Chờ thanh toán";
  };

  const getPaymentMethodLabel = (method) => {
    if (method === "COD") return "COD";
    if (method === "VNPAY") return "VNPay";
    return "QR VietQR";
  };

  // Favorites Tab Actions
  const handleRemoveFavorite = async (productId, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn muốn xóa sản phẩm này khỏi danh sách yêu thích?")) {
      await favoritesAPI.removeFromFavorites(productId, user.userId);
      setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleAddFavToCart = (product) => {
    addToCart(
      {
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        size: null,
      },
      1
    );
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  if (!authLoaded || !user) {
    return (
      <div className="profile-page" style={{ textAlign: "center", padding: "100px 0" }}>
        <div className="profile-loading-spinner">Đang tải thông tin cá nhân...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar
          user={user}
          avatar={avatar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          logout={logout}
        />

        <main className="profile-content">
          {activeTab === "profile" && (
            <div>
              <ProfileInfo
                user={user}
                avatar={avatar}
                profileForm={profileForm}
                originalForm={originalForm}
                profileSuccess={profileSuccess}
                profileError={profileError}
                profileSaving={profileSaving}
                handleProfileChange={handleProfileChange}
                handleProfileCancel={handleProfileCancel}
                handleProfileSave={handleProfileSave}
                handleAvatarChange={handleAvatarChange}
              />

              <PasswordChange
                passwordForm={passwordForm}
                passwordSuccess={passwordSuccess}
                passwordError={passwordError}
                passwordSaving={passwordSaving}
                handlePasswordChange={handlePasswordChange}
                handlePasswordSubmit={handlePasswordSubmit}
              />

              <AddressBook
                addresses={addresses}
                openAddressModal={openAddressModal}
                handleDeleteAddress={handleDeleteAddress}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <Orders
              orders={orders}
              ordersLoading={ordersLoading}
              ordersError={ordersError}
              handleOrderDetails={handleOrderDetails}
              handleBuyAgain={handleBuyAgain}
            />
          )}

          {activeTab === "favorites" && (
            <Favorites
              favoriteProducts={favoriteProducts}
              favsLoading={favsLoading}
              handleRemoveFavorite={handleRemoveFavorite}
              handleAddFavToCart={handleAddFavToCart}
            />
          )}
        </main>
      </div>

      {/* ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="order-modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="order-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>{editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
              <button className="btn-close-modal" onClick={() => setIsAddressModalOpen(false)}>
                <FontAwesomeIcon icon={icons.times} />
              </button>
            </div>
            <form onSubmit={handleAddressSave} className="order-modal-content">
              <div className="profile-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="profile-form-group">
                  <label>Tên người nhận *</label>
                  <input
                    type="text"
                    name="name"
                    value={addressForm.name}
                    onChange={handleAddressChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>Số điện thoại nhận hàng *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={addressForm.phone}
                    onChange={handleAddressChange}
                    placeholder="09xxxxxxxx"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    name="detail"
                    value={addressForm.detail}
                    onChange={handleAddressChange}
                    placeholder="Ví dụ: 123 Nguyễn Trãi, P. Bến Nghé, Q.1, TP.HCM"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>Loại địa chỉ</label>
                  <select name="type" value={addressForm.type} onChange={handleAddressChange}>
                    <option value="Nhà riêng">Nhà riêng</option>
                    <option value="Văn phòng">Văn phòng</option>
                  </select>
                </div>

                <div className="profile-form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressChange}
                    disabled={editingAddress?.isDefault}
                  />
                  <label htmlFor="isDefault" style={{ cursor: "pointer", margin: 0 }}>
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              <div className="profile-actions-row" style={{ marginTop: "24px" }}>
                <button type="button" className="btn-profile-cancel" onClick={() => setIsAddressModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-profile-save">
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {isOrderModalOpen && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setIsOrderModalOpen(false)}>
          <div className="order-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Chi tiết đơn hàng #CDW-{selectedOrder.id}</h3>
              <button className="btn-close-modal" onClick={() => setIsOrderModalOpen(false)}>
                <FontAwesomeIcon icon={icons.times} />
              </button>
            </div>
            <div className="order-modal-content">
              <div className="modal-section">
                <h4>Thông tin chung</h4>
                <ul className="modal-info-list">
                  <li>
                    <span>Ngày đặt hàng:</span>
                    <strong>
                      {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}{" "}
                      {new Date(selectedOrder.createdAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                    </strong>
                  </li>
                  <li>
                    <span>Trạng thái:</span>
                    <strong>{getOrderStatusLabel(selectedOrder.status)}</strong>
                  </li>
                  <li>
                    <span>Thanh toán:</span>
                    <strong>{getPaymentStatusLabel(selectedOrder.paymentStatus, selectedOrder.paymentMethod)}</strong>
                  </li>
                  <li>
                    <span>Phương thức thanh toán:</span>
                    <strong>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</strong>
                  </li>
                </ul>
              </div>

              <div className="modal-section">
                <h4>Thông tin giao hàng</h4>
                <div className="modal-address-block">
                  <p><strong>Người nhận:</strong> {selectedOrder.fullname}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.email}</p>
                  <p>
                    <strong>Địa chỉ:</strong> {[
                      selectedOrder.address,
                      selectedOrder.ward,
                      selectedOrder.district,
                      selectedOrder.province,
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>

              <div className="modal-section">
                <h4>Sản phẩm</h4>
                <div className="modal-prods-list">
                  {selectedOrder.items?.map((item) => (
                    <div className="modal-prod-item" key={item.id}>
                      <img
                        src={item.imageUrl || "https://placehold.co/60x80?text=No+Image"}
                        alt={item.productName}
                        className="modal-prod-img"
                      />
                      <div className="modal-prod-details">
                        <h5>{item.productName}</h5>
                        {item.size && <span>Loại: {item.size}</span>}
                      </div>
                      <div className="modal-prod-price-info">
                        <span>{formatPrice(item.price)}</span>
                        <div>x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <ul className="modal-info-list">
                  <li>
                    <span>Tạm tính:</span>
                    <strong>{formatPrice(selectedOrder.subtotal || 0)}</strong>
                  </li>
                  {Number(selectedOrder.discountAmount || 0) > 0 && (
                    <li>
                      <span>Giảm giá{selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : ""}:</span>
                      <strong>-{formatPrice(selectedOrder.discountAmount)}</strong>
                    </li>
                  )}
                  <li>
                    <span>Phí vận chuyển:</span>
                    <strong>{selectedOrder.shippingFee === 0 ? "Miễn phí" : formatPrice(selectedOrder.shippingFee)}</strong>
                  </li>
                  <li>
                    <span>Tổng thanh toán:</span>
                    <strong style={{ color: "#c07a4d" }}>{formatPrice(selectedOrder.totalAmount)}</strong>
                  </li>
                </ul>
              </div>

              <div className="profile-actions-row" style={{ marginTop: "24px" }}>
                <button type="button" className="btn-profile-cancel" onClick={() => setIsOrderModalOpen(false)}>
                  Đóng
                </button>
                <button type="button" className="btn-profile-save" onClick={() => {
                  handleBuyAgain(selectedOrder);
                  setIsOrderModalOpen(false);
                }}>
                  Mua lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
