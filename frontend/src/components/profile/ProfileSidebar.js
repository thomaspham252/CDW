import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon, icons } from '../../utils/icons';

const ProfileSidebar = ({ user, avatar, activeTab, setActiveTab, logout }) => {
  const userRoleText = user?.role?.toUpperCase() === "ADMIN" ? "Quản trị viên" : "Khách hàng";

  return (
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
  );
};

export default ProfileSidebar;
