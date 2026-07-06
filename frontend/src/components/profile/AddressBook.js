import React from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';

const AddressBook = ({ addresses, openAddressModal, handleDeleteAddress }) => {
  return (
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
  );
};

export default AddressBook;
