import React from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';

const PasswordChange = ({
  passwordForm,
  passwordSuccess,
  passwordError,
  passwordSaving,
  handlePasswordChange,
  handlePasswordSubmit,
}) => {
  return (
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
  );
};

export default PasswordChange;
