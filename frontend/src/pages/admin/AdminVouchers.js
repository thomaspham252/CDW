import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/axiosInstance';

const AdminVouchers = ({ readOnly = false }) => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [isOpen, setIsOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState('PERCENT');
    const [discountValue, setDiscountValue] = useState(0);
    const [minOrderValue, setMinOrderValue] = useState(0);
    const [maxDiscountAmount, setMaxDiscountAmount] = useState(0);
    const [usageLimit, setUsageLimit] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [expiredAt, setExpiredAt] = useState('');

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/vouchers');
            setVouchers(res.data || []);
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            setError('Không thể tải danh sách voucher.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleOpenCreate = () => {
        if (readOnly) return;
        setEditingVoucher(null);
        setCode('');
        setDescription('');
        setDiscountType('PERCENT');
        setDiscountValue(0);
        setMinOrderValue(0);
        setMaxDiscountAmount(0);
        setUsageLimit(0);
        setIsActive(true);
        setExpiredAt('');
        setIsOpen(true);
    };

    const handleOpenEdit = (voucher) => {
        if (readOnly) return;
        setEditingVoucher(voucher);
        setCode(voucher.code || '');
        setDescription(voucher.description || '');
        setDiscountType(voucher.discountType || 'PERCENT');
        setDiscountValue(voucher.discountValue || 0);
        setMinOrderValue(voucher.minOrderValue || 0);
        setMaxDiscountAmount(voucher.maxDiscountAmount || 0);
        setUsageLimit(voucher.usageLimit || 0);
        setIsActive(voucher.isActive !== false);

        if (voucher.expiredAt) {
            const date = new Date(voucher.expiredAt);
            const tzoffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
            setExpiredAt(localISOTime);
        } else {
            setExpiredAt('');
        }

        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (readOnly) return;
        if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;

        try {
            await api.delete(`/api/admin/vouchers/${id}`);
            setSuccessMessage('Xóa voucher thành công!');
            fetchVouchers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting voucher:', err);
            setError('Không thể xóa voucher.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;
        setError('');

        if (!code.trim()) {
            setError('Vui lòng nhập mã voucher.');
            return;
        }

        if (discountValue <= 0) {
            setError('Giá trị giảm phải lớn hơn 0.');
            return;
        }

        if (discountType === 'PERCENT' && discountValue > 100) {
            setError('Phần trăm giảm giá không được vượt quá 100%.');
            return;
        }

        const payload = {
            code: code.trim().toUpperCase(),
            description,
            discountType,
            discountValue: parseFloat(discountValue),
            minOrderValue: parseFloat(minOrderValue),
            maxDiscountAmount: parseFloat(maxDiscountAmount),
            usageLimit: parseInt(usageLimit, 10),
            isActive,
            expiredAt: expiredAt ? new Date(expiredAt).toISOString() : null
        };

        try {
            if (editingVoucher) {
                await api.put(`/api/admin/vouchers/${editingVoucher.id}`, payload);
                setSuccessMessage('Cập nhật voucher thành công!');
            } else {
                await api.post('/api/admin/vouchers', payload);
                setSuccessMessage('Thêm voucher mới thành công!');
            }

            setIsOpen(false);
            fetchVouchers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving voucher:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher.');
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Đang hoạt động';
            case 'EXPIRED': return 'Đã hết hạn';
            case 'USED_UP': return 'Hết lượt dùng';
            case 'INACTIVE': return 'Đã ẩn';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'status-select delivered';
            case 'EXPIRED': return 'status-select cancelled';
            case 'USED_UP': return 'status-select pending_payment';
            case 'INACTIVE': return 'status-select cod_pending';
            default: return '';
        }
    };

    return (
        <div className="admin-vouchers-tab">
            {!readOnly ? (
                <div className="action-header-row">
                    <button className="btn-add-product" onClick={handleOpenCreate}>
                        <FontAwesomeIcon icon={icons.plus} /> Thêm Voucher mới
                    </button>
                </div>
            ) : (
                <div className="admin-readonly-note">
                    <FontAwesomeIcon icon={icons.shield} /> STAFF chỉ có quyền xem voucher.
                </div>
            )}

            {successMessage && (
                <div className="admin-alert success">
                    <FontAwesomeIcon icon={icons.checkCircle} /> {successMessage}
                </div>
            )}
            {error && !isOpen && (
                <div className="admin-alert danger">
                    <FontAwesomeIcon icon={icons.warning} /> {error}
                </div>
            )}

            {loading ? (
                <div className="admin-loading-spinner">Đang tải danh sách voucher...</div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã Voucher</th>
                                <th>Mô tả</th>
                                <th>Loại giảm</th>
                                <th>Giá trị giảm</th>
                                <th>Đơn tối thiểu</th>
                                <th>Giới hạn lượt</th>
                                <th>Hạn dùng</th>
                                <th>Trạng thái</th>
                                {!readOnly && <th style={{ textAlign: 'center' }}>Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={readOnly ? 8 : 9} style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>
                                        Chưa có mã voucher nào được tạo.
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map((voucher) => (
                                    <tr key={voucher.id}>
                                        <td>
                                            <strong style={{ color: '#C07A4D', fontSize: '1rem', letterSpacing: '0.5px' }}>
                                                {voucher.code}
                                            </strong>
                                        </td>
                                        <td>{voucher.description || '-'}</td>
                                        <td>{voucher.discountType === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền cố định'}</td>
                                        <td>
                                            <strong>
                                                {voucher.discountType === 'PERCENT'
                                                    ? `${voucher.discountValue}%`
                                                    : formatPrice(voucher.discountValue)}
                                            </strong>
                                        </td>
                                        <td>{voucher.minOrderValue > 0 ? formatPrice(voucher.minOrderValue) : 'Không có'}</td>
                                        <td>
                                            {voucher.usageLimit > 0
                                                ? `${voucher.usedCount} / ${voucher.usageLimit}`
                                                : 'Vô hạn'}
                                        </td>
                                        <td>
                                            {voucher.expiredAt
                                                ? new Date(voucher.expiredAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                                                : 'Không giới hạn'}
                                        </td>
                                        <td>
                                            <span className={getStatusClass(voucher.status)}>
                                                {getStatusText(voucher.status)}
                                            </span>
                                        </td>
                                        {!readOnly && (
                                            <td className="actions-cell">
                                                <button className="btn-edit-action" title="Chỉnh sửa" onClick={() => handleOpenEdit(voucher)}>
                                                    <FontAwesomeIcon icon={icons.edit} />
                                                </button>
                                                <button
                                                    className="btn-edit-action"
                                                    style={{ background: '#fff5f5', color: '#e74c3c', borderColor: '#ffd5d5' }}
                                                    title="Xóa"
                                                    onClick={() => handleDelete(voucher.id)}
                                                >
                                                    <FontAwesomeIcon icon={icons.trash} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-card" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h2>{editingVoucher ? 'Cập nhật Voucher' : 'Thêm Voucher mới'}</h2>
                            <button className="btn-close-modal" onClick={() => setIsOpen(false)}>
                                <FontAwesomeIcon icon={icons.times} />
                            </button>
                        </div>

                        {error && (
                            <div className="admin-alert danger" style={{ margin: '1rem 2rem 0' }}>
                                <FontAwesomeIcon icon={icons.warning} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="modal-body-form">
                            <div className="form-sections-wrapper" style={{ gridTemplateColumns: '1fr' }}>
                                <div className="form-col-section">
                                    <div className="form-group-row col-2">
                                        <div className="form-group">
                                            <label>Mã Voucher *</label>
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                                placeholder="VD: GIAM20K, TET2026"
                                                required
                                                disabled={!!editingVoucher}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Loại giảm giá *</label>
                                            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                                                <option value="PERCENT">Phần trăm (%)</option>
                                                <option value="FIXED">Số tiền cố định (đ)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group-row col-2">
                                        <div className="form-group">
                                            <label>Giá trị giảm *</label>
                                            <input
                                                type="number"
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Đơn tối thiểu (đ)</label>
                                            <input
                                                type="number"
                                                value={minOrderValue}
                                                onChange={(e) => setMinOrderValue(Math.max(0, parseFloat(e.target.value) || 0))}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-row col-2">
                                        <div className="form-group">
                                            <label>Giảm tối đa (đ) - Cho giảm %</label>
                                            <input
                                                type="number"
                                                value={maxDiscountAmount}
                                                onChange={(e) => setMaxDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                                disabled={discountType !== 'PERCENT'}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giới hạn lượt dùng (0 = Vô hạn)</label>
                                            <input
                                                type="number"
                                                value={usageLimit}
                                                onChange={(e) => setUsageLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-row col-2">
                                        <div className="form-group">
                                            <label>Hạn sử dụng</label>
                                            <input
                                                type="datetime-local"
                                                value={expiredAt}
                                                onChange={(e) => setExpiredAt(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.8rem' }}>
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={isActive}
                                                    onChange={(e) => setIsActive(e.target.checked)}
                                                />
                                                Kích hoạt sử dụng
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Mô tả Voucher</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Mô tả điều kiện hoặc thông tin khuyến mại..."
                                            rows="2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsOpen(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingVoucher ? 'Lưu lại' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVouchers;
