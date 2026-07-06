import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { FontAwesomeIcon, icons } from "../../utils/icons";
import { formatPrice } from "../../utils/formatPrice";
import { updateProfile, changePassword, getMyOrders } from "../../services/auth/authService";
import { favoritesAPI } from "../../services/api";
import "../../styles/profile/Profile.css";

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
  const [editingAddress, setEditingAddress] = useState(null); // null for new, address object for edit
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
  const [ordersFilter, setOrdersFilter] = useState("all");
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
      const savedAvatar = localStorage.getItem(`tth_avatar_${user.userId}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      } else {
        setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`);
      }

      // Load Address Book
      const savedAddresses = localStorage.getItem(`tth_addresses_${user.userId}`);
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
        localStorage.setItem(`tth_addresses_${user.userId}`, JSON.stringify(defaultAddress));
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
          image: p.mainUrl || p.imgUrl || p.img_url || "https://placehold.co/300x300?text=No+Image",
          price: p.price ? parseFloat(p.price) : 0,
          category: p.categoryName || "Chưa phân loại",
      setFavoriteProducts(mappedFavs);
    } catch (err) {
      console.error("Lỗi lấy sản phẩm yêu thích:", err);
    } finally {
      setFavsLoading(false);
    }
  }, [user]);

  // Load Order History when clicking on Tab or filters
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

      // Sync local context and storage
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
        localStorage.setItem(`tth_avatar_${user.userId}`, base64Data);
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
        isDefault: addresses.length === 0, // Default if first address
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
      // Set all other addresses to false
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAddress) {
      // Edit mode
      updatedAddresses = updatedAddresses.map((a) =>
        a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a
      );
    } else {
      // Add mode
      const newAddress = {
        ...addressForm,
        id: Date.now(),
      };
      updatedAddresses.push(newAddress);
    }

    // Ensure there is at least one default address if possible
    if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    setAddresses(updatedAddresses);
    localStorage.setItem(`tth_addresses_${user.userId}`, JSON.stringify(updatedAddresses));
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (addressId, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      let updatedAddresses = addresses.filter((a) => a.id !== addressId);
      
      // If deleted default, make another one default
      if (addresses.find((a) => a.id === addressId)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setAddresses(updatedAddresses);
      localStorage.setItem(`tth_addresses_${user.userId}`, JSON.stringify(updatedAddresses));
    }
  };

  // Orders Tab Filter logic
  const filteredOrders = orders.filter((order) => {
    if (ordersFilter === "all") return true;
    const status = order.status?.toLowerCase();
    if (ordersFilter === "pending") {
      return ["pending", "pending_payment", "cod_pending", "paid"].includes(status);
    }
    return status === ordersFilter.toLowerCase();
  });

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

  const userRoleText = user?.role?.toUpperCase() === "ADMIN" ? "Quản trị viên" : "Khách hàng";

  return (
    <div className="profile-page">
      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-user">
            <img src={avatar} alt={user.fullName || "User"} className="sidebar-avatar" />
            <div className="sidebar-user-info">
              <h3>{user.fullName || "Tài khoản"}</h3>
              <span>{userRoleText}</span>
            </div>
          </div>

          <div className="profile-menu">
            <button
              className={`profile-menu-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <FontAwesomeIcon icon={icons.user} /> Thông tin cá nhân
            </button>
            <button
              className={`profile-menu-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FontAwesomeIcon icon={icons.shoppingBag} /> Đơn hàng của tôi
            </button>
            <button
              className={`profile-menu-item ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              <FontAwesomeIcon icon={icons.heart} /> Sản phẩm yêu thích
            </button>

            {user?.role?.toUpperCase() === "ADMIN" && (
              <Link to="/admin" className="profile-menu-item admin-menu-item">
                <FontAwesomeIcon icon={icons.shield} /> Trang quản trị
              </Link>
            )}

            <button className="profile-menu-item logout-btn" onClick={() => logout()}>
              <FontAwesomeIcon icon={icons.logout} /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="profile-content">
          {/* TAB 1: PROFILE INFO & PASSWORD */}
          {activeTab === "profile" && (
            <div>
              <h2 className="profile-tab-title">Hồ Sơ Cá Nhân</h2>

              {/* Avatar Section */}
              <div className="profile-avatar-section">
                <div className="avatar-wrapper">
                  <img src={avatar} alt="Avatar" className="large-avatar" />
                  <label htmlFor="avatar-file" className="avatar-upload-btn" title="Tải ảnh đại diện mới">
                    <FontAwesomeIcon icon={icons.edit} style={{ fontSize: "0.85rem" }} />
                  </label>
                  <input
                    type="file"
                    id="avatar-file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="avatar-info-text">
                  <h3>{user.fullName || "Người dùng"}</h3>
                  <p>Email liên kết: {user.email}</p>
                  <button
                    className="btn-change-avatar-text"
                    onClick={() => document.getElementById("avatar-file").click()}
                  >
                    Đổi ảnh đại diện
                  </button>
                </div>
              </div>

              {/* Personal Info Form */}
              <form onSubmit={handleProfileSave} className="profile-form-section">
                <h3>Thông tin tài khoản</h3>

                {profileSuccess && (
                  <div className="profile-alert success">
                    <FontAwesomeIcon icon={icons.checkCircle} /> {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="profile-alert error">
                    <FontAwesomeIcon icon={icons.warning} /> {profileError}
                  </div>
                )}

                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      placeholder="Nhập họ tên đầy đủ"
                      required
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Email (Không thể thay đổi)</label>
                    <input type="email" value={user.email} disabled />
                  </div>

                  <div className="profile-form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Giới tính</label>
                    <select name="gender" value={profileForm.gender} onChange={handleProfileChange}>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="profile-actions-row">
                  <button type="button" className="btn-profile-cancel" onClick={handleProfileCancel}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-profile-save" disabled={profileSaving}>
                    {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>

              {/* Change Password Form */}
              <form onSubmit={handlePasswordSubmit} className="profile-form-section">
                <h3>Đổi mật khẩu</h3>

                {passwordSuccess && (
                  <div className="profile-alert success">
                    <FontAwesomeIcon icon={icons.checkCircle} /> {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="profile-alert error">
                    <FontAwesomeIcon icon={icons.warning} /> {passwordError}
                  </div>
                )}

                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label>Mật khẩu cũ *</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Mật khẩu mới (Tối thiểu 6 ký tự) *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Mật khẩu mới"
                      required
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Xác nhận mật khẩu mới *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                  </div>
                </div>

                <div className="profile-actions-row">
                  <button type="submit" className="btn-profile-save" disabled={passwordSaving}>
                    {passwordSaving ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </div>
              </form>

              {/* Address Book Section */}
              <div className="profile-form-section">
                <div className="address-section-header">
                  <h3>Sổ địa chỉ giao hàng</h3>
                  <button className="btn-add-address" onClick={() => openAddressModal()}>
                    <FontAwesomeIcon icon={icons.plus} /> Thêm địa chỉ mới
                  </button>
                </div>

                <div className="address-list-grid">
                  {addresses.length === 0 ? (
                    <p style={{ color: "#a0938a", fontStyle: "italic" }}>Chưa có địa chỉ nào được thêm.</p>
                  ) : (
                    addresses.map((addr) => (
                      <div className="address-card" key={addr.id}>
                        <div className="address-card-info">
                          <div className="address-card-header">
                            <span className="address-name">{addr.name}</span>
                            {addr.isDefault && <span className="address-badge">Mặc định</span>}
                            <span
                              className="address-badge"
                              style={{ backgroundColor: "#f5ece1", color: "#8c5333" }}
                            >
                              {addr.type}
                            </span>
                          </div>
                          <span className="address-detail">{addr.detail}</span>
                          <span className="address-phone">SĐT: {addr.phone}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn-edit-address"
                            title="Sửa địa chỉ"
                            onClick={() => openAddressModal(addr)}
                          >
                            <FontAwesomeIcon icon={icons.edit} />
                          </button>
                          {!addr.isDefault && (
                            <button
                              className="btn-edit-address"
                              style={{ color: "#d9534f" }}
                              title="Xóa địa chỉ"
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                            >
                              <FontAwesomeIcon icon={icons.trash} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div>
              <h2 className="profile-tab-title">Lịch Sử Đơn Hàng</h2>

              {/* Filter Tabs */}
              <div className="orders-filter-tabs">
                <button
                  className={`orders-filter-tab-btn ${ordersFilter === "all" ? "active" : ""}`}
                  onClick={() => setOrdersFilter("all")}
                >
                  Tất cả đơn
                </button>
                <button
                  className={`orders-filter-tab-btn ${ordersFilter === "pending" ? "active" : ""}`}
                  onClick={() => setOrdersFilter("pending")}
                >
                  Chờ xử lý
                </button>
                <button
                  className={`orders-filter-tab-btn ${ordersFilter === "processing" ? "active" : ""}`}
                  onClick={() => setOrdersFilter("processing")}
                >
                  Đang xử lý
                </button>
                <button
                  className={`orders-filter-tab-btn ${ordersFilter === "shipped" ? "active" : ""}`}
                  onClick={() => setOrdersFilter("shipped")}
                >
                  Đang giao
                </button>
                <button
                  className={`orders-filter-tab-btn ${ordersFilter === "delivered" ? "active" : ""}`}
                  onClick={() => setOrdersFilter("delivered")}
                >
                  Đã giao
                </button>
                <button
                  className={`orders-filter-tab-btn ${ordersFilter === "cancelled" ? "active" : ""}`}
                  onClick={() => setOrdersFilter("cancelled")}
                >
                  Đã hủy
                </button>
              </div>

              {ordersLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Đang tải danh sách đơn hàng...</div>
              ) : ordersError ? (
                <div className="profile-alert error">{ordersError}</div>
              ) : filteredOrders.length === 0 ? (
                <div className="order-history-empty">
                  <h3>Chưa có đơn hàng nào</h3>
                  <p>Bạn chưa đặt đơn hàng nào trong phân mục này.</p>
                  <Link to="/products" className="btn-order-buy-again" style={{ textDecoration: "none" }}>
                    Mua sắm ngay
                  </Link>
                </div>
              ) : (
                <div className="order-history-list">
                  {filteredOrders.map((order) => {
                    const firstItem = order.items && order.items[0];
                    const otherItemsCount = order.items ? order.items.length - 1 : 0;
                    
                    // Format Order status
                    let statusLabel = "Chờ xử lý";
                    let statusClass = "pending";
                    switch (order.status?.toLowerCase()) {
                      case "pending_payment":
                        statusLabel = "Chờ thanh toán";
                        statusClass = "pending";
                        break;
                      case "cod_pending":
                        statusLabel = "Chờ xử lý COD";
                        statusClass = "pending";
                        break;
                      case "pending":
                        statusLabel = "Chờ xử lý";
                        statusClass = "pending";
                        break;
                      case "paid":
                        statusLabel = "Đã thanh toán";
                        statusClass = "processing";
                        break;
                      case "processing":
                        statusLabel = "Đang xử lý";
                        statusClass = "processing";
                        break;
                      case "shipped":
                        statusLabel = "Đang giao";
                        statusClass = "shipped";
                        break;
                      case "delivered":
                        statusLabel = "Đã giao";
                        statusClass = "delivered";
                        break;
                      case "cancelled":
                        statusLabel = "Đã hủy";
                        statusClass = "cancelled";
                        break;
                      default:
                        statusLabel = order.status || "Chờ xử lý";
                        statusClass = "pending";
                    }

                    return (
                      <div className="order-history-item" key={order.id}>
                        <div className="order-item-header">
                          <div className="order-item-meta">
                            <span className="order-id-label">Mã đơn hàng: #CDW-{order.id}</span>
                            <span className="order-date-label">
                              Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")} {new Date(order.createdAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <span className={`order-status-badge ${statusClass}`}>{statusLabel}</span>
                        </div>

                        {firstItem && (
                          <div className="order-item-body">
                            <div className="order-prod-preview">
                              <img
                                src={firstItem.imageUrl || "https://placehold.co/80x80?text=No+Image"}
                                alt={firstItem.productName}
                                className="order-prod-thumb"
                                onError={(e) => (e.target.src = "https://placehold.co/80x80?text=No+Image")}
                              />
                              <div className="order-prod-info">
                                <h4>{firstItem.productName}</h4>
                                {firstItem.size && (
                                  <div className="order-prod-attrs">Kích thước/Loại: {firstItem.size}</div>
                                )}
                                <div className="order-price-qty">
                                  <span className="order-price">{formatPrice(firstItem.price)}</span>
                                  <span className="order-qty">x{firstItem.quantity}</span>
                                </div>
                              </div>
                            </div>
                            {otherItemsCount > 0 && (
                              <div className="order-more-products-text">
                                và {otherItemsCount} sản phẩm khác trong đơn hàng này...
                              </div>
                            )}
                          </div>
                        )}

                        <div className="order-item-footer">
                          <span className="order-total-amount">
                            Tổng thanh toán: <strong>{formatPrice(order.totalAmount)}</strong>
                          </span>
                          <div className="order-item-actions">
                            <button className="btn-order-detail" onClick={() => handleOrderDetails(order)}>
                              Xem chi tiết
                            </button>
                            <button className="btn-order-buy-again" onClick={() => handleBuyAgain(order)}>
                              Mua lại
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAVORITES */}
          {activeTab === "favorites" && (
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
                        <img src={prod.image} alt={prod.name} onError={(e) => (e.target.src = "https://placehold.co/300x300?text=No+Image")} />
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
                  <label>Địa chỉ chi tiết (Số nhà, tên đường, phường, quận, thành phố...) *</label>
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
                    disabled={editingAddress?.isDefault} // Cannot uncheck default if it is default
                  />
                  <label htmlFor="isDefault" style={{ cursor: "pointer", margin: 0 }}>Đặt làm địa chỉ mặc định</label>
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
              {/* Order Info */}
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
                    <span>Trạng thái đơn hàng:</span>
                    <strong style={{ textTransform: "uppercase" }}>
                      {{
                        pending_payment: "Chờ thanh toán",
                        cod_pending: "Chờ xử lý COD",
                        pending: "Chờ xử lý",
                        paid: "Đã thanh toán",
                        processing: "Đang xử lý",
                        shipped: "Đang giao hàng",
                        delivered: "Đã giao hàng",
                        cancelled: "Đã hủy",
                      }[selectedOrder.status] || selectedOrder.status}
                    </strong>
                  </li>
                  <li>
                    <span>Phương thức thanh toán:</span>
                    <strong>{selectedOrder.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng"}</strong>
                  </li>
                </ul>
              </div>

              {/* Delivery Info */}
              <div className="modal-section">
                <h4>Thông tin giao hàng</h4>
                <div className="modal-address-block">
                  <p><strong>Người nhận:</strong> {selectedOrder.fullname}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.email}</p>
                  <p>
                    <strong>Địa chỉ:</strong> {selectedOrder.address}
                    {selectedOrder.ward ? `, Phường/Xã ${selectedOrder.ward}` : ""}
                    {selectedOrder.district ? `, Quận/Huyện ${selectedOrder.district}` : ""}
                    {selectedOrder.province ? `, Tỉnh/Thành ${selectedOrder.province}` : ""}
                  </p>
                  {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
                </div>
              </div>

              {/* Products List */}
              <div className="modal-section">
                <h4>Sản phẩm trong đơn hàng</h4>
                <div className="modal-prods-list">
                  {selectedOrder.items?.map((item) => (
                    <div className="modal-prod-item" key={item.id}>
                      <img
                        src={item.imageUrl || "https://placehold.co/60x80?text=No+Image"}
                        alt={item.productName}
                        className="modal-prod-img"
                        onError={(e) => (e.target.src = "https://placehold.co/60x80?text=No+Image")}
                      />
                      <div className="modal-prod-details">
                        <h5 className="modal-prod-name">{item.productName}</h5>
                        {item.size && <span className="modal-prod-sub">Phân loại: {item.size}</span>}
                      </div>
                      <div className="modal-prod-price-info">
                        <span className="modal-prod-price">{formatPrice(item.price)}</span>
                        <div className="modal-prod-qty">Số lượng: x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Calculations */}
              <div className="modal-section" style={{ borderTop: "1px solid #f5ece1", paddingTop: "15px" }}>
                <ul className="modal-info-list">
                  <li>
                    <span>Phí vận chuyển:</span>
                    <strong>{selectedOrder.shippingFee === 0 || parseFloat(selectedOrder.shippingFee) === 0 ? "Miễn phí" : formatPrice(selectedOrder.shippingFee)}</strong>
                  </li>
                  <li style={{ fontSize: "1.1rem", marginTop: "5px" }}>
                    <span>Tổng thanh toán:</span>
                    <strong style={{ color: "#c07a4d", fontSize: "1.25rem" }}>{formatPrice(selectedOrder.totalAmount)}</strong>
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
                  Mua lại đơn này
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
