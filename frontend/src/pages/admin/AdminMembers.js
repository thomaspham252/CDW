import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import api from '../../services/axiosInstance';
import './AdminMembers.css';

const ROLE_OPTIONS = ['ADMIN', 'STAFF', 'CUSTOMER'];

const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const normalizeRole = (role) => (role || 'CUSTOMER').toUpperCase();

const AdminMembers = ({ readOnly = false }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        fullname: '',
        email: '',
        phone: '',
        gender: '',
        role: 'CUSTOMER',
        locked: false
    });

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

    const stats = useMemo(() => {
        return users.reduce(
            (acc, user) => {
                const role = normalizeRole(user.role);
                acc.total += 1;
                if (role === 'ADMIN') acc.admin += 1;
                else if (role === 'STAFF') acc.staff += 1;
                else acc.customer += 1;
                return acc;
            },
            { total: 0, admin: 0, staff: 0, customer: 0 }
        );
    }, [users]);

    const filteredUsers = useMemo(() => {
        if (roleFilter === 'ALL') return users;
        return users.filter((user) => normalizeRole(user.role) === roleFilter);
    }, [users, roleFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (!value.trim()) fetchUsers('');
    };

    const openEditModal = (user) => {
        if (readOnly) return;
        const role = normalizeRole(user.role);
        setEditingUser(user);
        setForm({
            fullname: user.fullname || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || '',
            role: role === 'BANNED' ? 'CUSTOMER' : role,
            locked: role === 'BANNED'
        });
        setError('');
    };

    const closeEditModal = () => {
        if (saving) return;
        setEditingUser(null);
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (readOnly) return;
        if (!editingUser) return;

        try {
            setSaving(true);
            setError('');
            const payload = {
                fullname: form.fullname.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                gender: form.gender,
                role: form.locked ? 'BANNED' : form.role
            };

            await api.put(`/api/admin/users/${editingUser.id}`, payload);
            setSuccessMessage('Đã cập nhật tài khoản thành công.');
            setEditingUser(null);
            fetchUsers(search);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.response?.data?.message || 'Không thể cập nhật tài khoản.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleLock = async (user) => {
        if (readOnly) return;
        const role = normalizeRole(user.role);
        if (role === 'ADMIN') {
            alert('Không thể khóa tài khoản quản trị viên.');
            return;
        }

        const nextRole = role === 'BANNED' ? 'CUSTOMER' : 'BANNED';
        try {
            await api.patch(`/api/admin/users/${user.id}/role?value=${nextRole}`);
            setSuccessMessage(nextRole === 'BANNED' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
            fetchUsers(search);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Không thể cập nhật trạng thái tài khoản.');
        }
    };

    const getRoleLabel = (role) => {
        const normalized = normalizeRole(role);
        if (normalized === 'BANNED') return 'LOCKED';
        return normalized;
    };

    return (
        <div className="admin-members-page">
            <div className="member-stats-grid">
                <div className="member-stat-card">
                    <span>Tổng tài khoản</span>
                    <strong>{stats.total}</strong>
                </div>
                <div className="member-stat-card">
                    <span>Admin</span>
                    <strong>{stats.admin}</strong>
                </div>
                <div className="member-stat-card">
                    <span>Staff</span>
                    <strong>{stats.staff}</strong>
                </div>
                <div className="member-stat-card">
                    <span>Customer</span>
                    <strong>{stats.customer}</strong>
                </div>
            </div>

            <form className={`member-toolbar ${readOnly ? 'read-only' : ''}`} onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Tìm theo tên, email hoặc SĐT"
                    value={search}
                    onChange={handleSearchChange}
                />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="BANNED">Đã khóa</option>
                </select>
                {!readOnly && (
                    <button
                        type="button"
                        className="member-add-btn"
                        onClick={() => alert('Chức năng thêm tài khoản sẽ được bổ sung sau.')}
                    >
                        <FontAwesomeIcon icon={icons.plus} /> Thêm tài khoản
                    </button>
                )}
            </form>

            {readOnly && (
                <div className="admin-readonly-note">
                    <FontAwesomeIcon icon={icons.shield} /> STAFF chỉ có quyền xem danh sách thành viên.
                </div>
            )}

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
                <div className="member-list-card">
                    {filteredUsers.length === 0 ? (
                        <div className="member-empty">Không tìm thấy thành viên nào phù hợp.</div>
                    ) : (
                        filteredUsers.map((user) => {
                            const role = normalizeRole(user.role);

                            return (
                                <div className="member-row" key={user.id}>
                                    <div className="member-avatar">{getInitials(user.fullname)}</div>
                                    <div className="member-info">
                                        <strong>{user.fullname || 'Chưa cập nhật'}</strong>
                                        <span>
                                            {user.email || 'Chưa có email'} · {user.phone || 'Chưa có SĐT'}
                                        </span>
                                    </div>
                                    <span className={`member-role-badge ${role.toLowerCase()}`}>
                                        {getRoleLabel(role)}
                                    </span>
                                    {!readOnly && (
                                        <div className="member-actions">
                                            <button
                                                type="button"
                                                className="member-icon-btn"
                                                onClick={() => openEditModal(user)}
                                                title="Sửa tài khoản"
                                            >
                                                <FontAwesomeIcon icon={icons.edit} />
                                            </button>
                                            <button
                                                type="button"
                                                className="member-icon-btn"
                                                onClick={() => handleToggleLock(user)}
                                                title={role === 'BANNED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                            >
                                                <FontAwesomeIcon icon={icons.shield} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {editingUser && (
                <div className="member-modal-backdrop" onMouseDown={closeEditModal}>
                    <form className="member-edit-modal" onSubmit={handleSaveUser} onMouseDown={(e) => e.stopPropagation()}>
                        <div className="member-modal-top">
                            <h3>Sửa tài khoản</h3>
                            <button type="button" className="member-modal-close" onClick={closeEditModal}>
                                <FontAwesomeIcon icon={icons.close} />
                            </button>
                        </div>

                        <div className="member-modal-user">
                            <div className="member-avatar large">{getInitials(editingUser.fullname)}</div>
                            <div>
                                <strong>{editingUser.fullname || 'Chưa cập nhật'}</strong>
                                <span>
                                    Tham gia{' '}
                                    {editingUser.createdAt
                                        ? new Date(editingUser.createdAt).toLocaleDateString('vi-VN')
                                        : '--'}
                                </span>
                            </div>
                        </div>

                        <label className="member-field full">
                            <span>Họ và tên</span>
                            <input
                                value={form.fullname}
                                onChange={(e) => handleFormChange('fullname', e.target.value)}
                            />
                        </label>

                        <label className="member-field full">
                            <span>Email</span>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                required
                            />
                        </label>

                        <div className="member-form-grid">
                            <label className="member-field">
                                <span>Số điện thoại</span>
                                <input
                                    value={form.phone}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                />
                            </label>
                            <label className="member-field">
                                <span>Giới tính</span>
                                <select
                                    value={form.gender}
                                    onChange={(e) => handleFormChange('gender', e.target.value)}
                                >
                                    <option value="">Chưa cập nhật</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </label>
                        </div>

                        <label className="member-field full">
                            <span>Vai trò</span>
                            <select
                                value={form.role}
                                onChange={(e) => handleFormChange('role', e.target.value)}
                                disabled={form.locked}
                            >
                                {ROLE_OPTIONS.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </label>

                        <label className="member-lock-box">
                            <div>
                                <strong>Trạng thái tài khoản</strong>
                                <span>Khóa thì tài khoản không đăng nhập được</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.locked}
                                onChange={(e) => handleFormChange('locked', e.target.checked)}
                            />
                        </label>

                        <button
                            type="button"
                            className="member-reset-btn"
                            onClick={() => alert('Chức năng đặt lại mật khẩu sẽ được bổ sung sau.')}
                        >
                            <FontAwesomeIcon icon={icons.shield} /> Đặt lại mật khẩu
                        </button>

                        <div className="member-modal-actions">
                            <button type="button" className="member-cancel-btn" onClick={closeEditModal}>Hủy</button>
                            <button type="submit" className="member-save-btn" disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminMembers;
