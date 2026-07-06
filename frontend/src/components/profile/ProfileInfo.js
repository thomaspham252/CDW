import React from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';

const ProfileInfo = ({
  user,
  avatar,
  profileForm,
  originalForm,
  profileSuccess,
  profileError,
  profileSaving,
  handleProfileChange,
  handleProfileCancel,
  handleProfileSave,
  handleAvatarChange,
}) => {
  return (
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
    </div>
  );
};

export default ProfileInfo;
