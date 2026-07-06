import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import api from '../../services/axiosInstance';

const AdminMembers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchUsers = useCallback(async (query = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/users?search=${encodeURIComponent(query)}`);
            setUsers(res.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Không thể tải danh sách thành viên.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (!val.trim()) {
            fetchUsers('');
        }
    };

    const handleToggleLock = async (userId, currentRole) => {
        let newRole = 'CUSTOMER';
        let actionWord = 'mở khóa';

        if (currentRole.toUpperCase() === 'ADMIN') {
            alert('Không thể khóa tài khoản của quản trị viên.');
            return;
        }

        if (currentRole.toUpperCase() === 'CUSTOMER') {
            newRole = 'BANNED';
            actionWord = 'khóa';
        }

        if (!window.confirm(`Bạn có chắc chắn muốn ${actionWord} tài khoản này không?`)) {
            return;
        }

        try {
            await api.patch(`/api/admin/users/${userId}/role?value=${newRole}`);
            setSuccessMessage(`Đã ${actionWord} tài khoản thành công.`);
            fetchUsers(search);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Không thể cập nhật trạng thái tài khoản.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN': return 'status-select paid'; // Green
            case 'BANNED': return 'status-select cancelled'; // Red
            default: return 'status-select cod_pending'; // Grey/normal
        }
    };

    const getRoleText = (role) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN': return 'Quản trị viên';
            case 'BANNED': return 'Bị khóa';
            default: return 'Khách hàng';
        }
    };

    return (
        <div className="admin-members-tab">
            {/* Search row */}
            <div className="action-header-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <form onSubmit={handleSearchSubmit} className="admin-search-box" style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên hoặc email..." 
                            value={search}
                            onChange={handleSearchChange}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                border: '1.5px solid #e4d6ca',
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#fdfaf7',
                                fontSize: '0.92rem'
                            }}
                        />
                        <FontAwesomeIcon 
                            icon={icons.search} 
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}
                        />
                    </div>
                    <button type="submit" className="btn-submit" style={{ padding: '0.6rem 1.5rem', marginTop: 0 }}>
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {successMessage && (
                <div className="admin-alert success">
                    <FontAwesomeIcon icon={icons.checkCircle} /> {successMessage}
                </div>
            )}
            {error && (
                <div className="admin-alert danger">
                    <FontAwesomeIcon icon={icons.warning} /> {error}
                </div>
            )}

            {loading ? (
                <div className="admin-loading-spinner">Đang tải danh sách thành viên...</div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã TV</th>
                                <th>Họ và tên</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Vai trò</th>
                                <th>Số đơn hàng</th>
                                <th>Ngày đăng ký</th>
                                <th style={{ textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>
                                        Không tìm thấy thành viên nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id}>
                                        <td><strong>#{u.id}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    background: '#e4d6ca',
                                                    color: '#C07A4D',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '700',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {u.fullname ? u.fullname.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                    {u.fullname || 'Chưa cập nhật'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.phone || '—'}</td>
                                        <td>
                                            <span className={getRoleBadgeClass(u.role)}>
                                                {getRoleText(u.role)}
                                            </span>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#3b82f6' }}>{u.totalOrders} đơn</strong>
                                        </td>
                                        <td>
                                            {u.createdAt 
                                                ? new Date(u.createdAt).toLocaleDateString('vi-VN') 
                                                : '—'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {u.role?.toUpperCase() !== 'ADMIN' ? (
                                                <button 
                                                    onClick={() => handleToggleLock(u.id, u.role)}
                                                    style={{
                                                        border: 'none',
                                                        background: u.role?.toUpperCase() === 'BANNED' ? '#ebfcf2' : '#fff5f5',
                                                        color: u.role?.toUpperCase() === 'BANNED' ? '#27ae60' : '#e74c3c',
                                                        padding: '0.45rem 1rem',
                                                        borderRadius: '6px',
                                                        fontWeight: '700',
                                                        fontSize: '0.82rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        minWidth: '95px'
                                                    }}
                                                >
                                                    {u.role?.toUpperCase() === 'BANNED' ? '🔓 Mở khóa' : '🔒 Khóa tài'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Quản trị hệ thống</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminMembers;
