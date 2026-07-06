import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/axiosInstance';
import AdminProductForm from './AdminProductForm';
import AdminAnalytics from './AdminAnalytics';
import AdminVouchers from './AdminVouchers';
import AdminMembers from './AdminMembers';
import AdminInventory from './AdminInventory';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders, vouchers, members, inventory
    
    // States for analytics
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // States for products
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // States for orders
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Check auth
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=admin');
            return;
        }
        if (user) {
            const roleUpper = user.role?.toUpperCase();
            if (roleUpper !== 'ADMIN' && roleUpper !== 'STAFF') {
                navigate('/');
            } else if (roleUpper === 'STAFF') {
                // Nếu là STAFF, mặc định sang tab sản phẩm vì không có quyền xem analytics
                setActiveTab('products');
            }
        }
    }, [user, isAuthenticated, navigate]);

    // Load analytics
    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await api.get('/api/admin/analytics');
            setAnalytics(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Không thể tải dữ liệu thống kê.');
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Load products
    const fetchProducts = async (pageNumber = 0) => {
        setProductsLoading(true);
        try {
            const res = await api.get(`/api/admin/products?page=${pageNumber}&size=10`);
            setProducts(res.data.content);
            setTotalPages(res.data.totalPages);
            setPage(pageNumber);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Không thể tải danh sách sản phẩm.');
        } finally {
            setProductsLoading(false);
        }
    };

    // Load categories
    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/products/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Load orders
    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await api.get('/api/admin/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Không thể tải danh sách đơn hàng.');
        } finally {
            setOrdersLoading(false);
        }
    };

    // Trigger data loading depending on active tab
    useEffect(() => {
        setError('');
        setSuccessMessage('');

        const roleUpper = user?.role?.toUpperCase();
        if (roleUpper === 'STAFF' && (activeTab === 'analytics' || activeTab === 'members')) {
            setActiveTab('products');
            return;
        }

        if (activeTab === 'analytics') {
            fetchAnalytics();
        } else if (activeTab === 'products') {
            fetchProducts(0);
            fetchCategories();
        } else if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, user]);

    // Toggle product active status
    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/api/admin/products/${id}/active?value=${!currentStatus}`);
            setSuccessMessage('Cập nhật trạng thái sản phẩm thành công!');
            // refresh product list
            fetchProducts(page);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating product status:', err);
            setError('Lỗi khi cập nhật trạng thái sản phẩm.');
        }
    };

    // Handle Order status change
    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            await api.patch(`/api/admin/orders/${orderId}/status?value=${newStatus}`);
            setSuccessMessage(`Đã cập nhật trạng thái đơn hàng #${orderId} thành công.`);
            fetchOrders();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Không thể cập nhật trạng thái đơn hàng.');
        }
    };

    // Open form for create
    const handleCreateProduct = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    // Open form for edit
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleFormSubmitSuccess = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
        setSuccessMessage('Lưu thông tin sản phẩm thành công!');
        fetchProducts(page);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div className="admin-dashboard-page">
            <div className="admin-sidebar">
                <div className="admin-brand">
                    <h2>CDW ADMIN</h2>
                    <span>Hệ thống quản trị</span>
                </div>
                <div className="admin-menu">
                    {user?.role?.toUpperCase() === 'ADMIN' && (
                        <button 
                            className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <FontAwesomeIcon icon={icons.home} className="menu-icon" /> Thống kê doanh số
                        </button>
                    )}
                    <button 
                        className={`menu-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <FontAwesomeIcon icon={icons.products} className="menu-icon" /> Quản lý sản phẩm
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FontAwesomeIcon icon={icons.shoppingBag} className="menu-icon" /> Quản lý đơn hàng
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'vouchers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vouchers')}
                    >
                        <FontAwesomeIcon icon={icons.ticket} className="menu-icon" /> Quản lý Voucher
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <FontAwesomeIcon icon={icons.truck} className="menu-icon" /> Quản lý kho hàng
                    </button>
                    {user?.role?.toUpperCase() === 'ADMIN' && (
                        <button 
                            className={`menu-item ${activeTab === 'members' ? 'active' : ''}`}
                            onClick={() => setActiveTab('members')}
                        >
                            <FontAwesomeIcon icon={icons.user} className="menu-icon" /> Quản lý thành viên
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-content">
                <div className="admin-header-bar">
                    <div className="admin-title-section">
                        <h1>
                            {activeTab === 'analytics' && 'Báo cáo thống kê'}
                            {activeTab === 'products' && 'Danh sách sản phẩm'}
                            {activeTab === 'orders' && 'Danh sách đơn hàng'}
                            {activeTab === 'vouchers' && 'Quản lý mã Voucher'}
                            {activeTab === 'members' && 'Danh sách thành viên'}
                            {activeTab === 'inventory' && 'Quản lý kho hàng'}
                        </h1>
                    </div>
                    <div className="admin-user-info">
                        <FontAwesomeIcon icon={icons.user} /> <span>Chào, {user?.fullName || 'Quản trị viên'}</span>
                    </div>
                </div>

                {successMessage && <div className="admin-alert success"><FontAwesomeIcon icon={icons.checkCircle} /> {successMessage}</div>}
                {error && <div className="admin-alert danger"><FontAwesomeIcon icon={icons.warning} /> {error}</div>}

                {/* TAB 1: ANALYTICS */}
                {activeTab === 'analytics' && (
                    <div className="analytics-tab-content">
                        {analyticsLoading ? (
                            <div className="admin-loading-spinner">Đang tải dữ liệu báo cáo...</div>
                        ) : (
                            <AdminAnalytics summary={analytics} />
                        )}
                    </div>
                )}

                {/* TAB 2: PRODUCTS */}
                {activeTab === 'products' && (
                    <div className="products-tab-content">
                        <div className="action-header-row">
                            <button className="btn-add-product" onClick={handleCreateProduct}>
                                <FontAwesomeIcon icon={icons.plus} /> Thêm sản phẩm mới
                            </button>
                        </div>

                        {productsLoading ? (
                            <div className="admin-loading-spinner">Đang tải danh sách sản phẩm...</div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Danh mục</th>
                                            <th>Giá bán</th>
                                            <th>Trạng thái</th>
                                            <th className="text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(prod => {
                                            // Get first variant price if available
                                            const displayPrice = prod.price || 0;
                                            return (
                                                <tr key={prod.id}>
                                                    <td>{prod.id}</td>
                                                    <td>
                                                        <div className="prod-table-cell">
                                                            <img 
                                                                src={prod.mainUrl || 'https://placehold.co/40x40?text=No+Image'} 
                                                                alt={prod.name} 
                                                                className="prod-table-thumb"
                                                            />
                                                            <div className="prod-table-name">
                                                                <strong>{prod.name}</strong>
                                                                <span className="prod-slug">{prod.slug}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="category-badge">{prod.categoryName}</span></td>
                                                    <td className="text-primary font-bold">{formatPrice(displayPrice)}</td>
                                                    <td>
                                                        <button 
                                                            className={`status-toggle-btn ${prod.isActive ? 'active' : 'inactive'}`}
                                                            onClick={() => handleToggleActive(prod.id, prod.isActive)}
                                                            title={prod.isActive ? 'Bấm để ẩn sản phẩm' : 'Bấm để hiện sản phẩm'}
                                                        >
                                                            {prod.isActive ? 'Hiển thị' : 'Đang ẩn'}
                                                        </button>
                                                    </td>
                                                    <td className="text-center actions-cell">
                                                        <button className="btn-edit-action" onClick={() => handleEditProduct(prod)} title="Sửa sản phẩm">
                                                            <FontAwesomeIcon icon={icons.edit} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="admin-pagination">
                                        <button 
                                            disabled={page === 0} 
                                            onClick={() => fetchProducts(page - 1)}
                                            className="pagination-arrow"
                                        >
                                            <FontAwesomeIcon icon={icons.chevronLeft} />
                                        </button>
                                        <span className="pagination-text">Trang {page + 1} / {totalPages}</span>
                                        <button 
                                            disabled={page === totalPages - 1} 
                                            onClick={() => fetchProducts(page + 1)}
                                            className="pagination-arrow"
                                        >
                                            <FontAwesomeIcon icon={icons.chevronRight} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: ORDERS */}
                {activeTab === 'orders' && (
                    <div className="orders-tab-content">
                        {ordersLoading ? (
                            <div className="admin-loading-spinner">Đang tải danh sách đơn hàng...</div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Người nhận</th>
                                            <th>Ngày đặt</th>
                                            <th>Hình thức</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái đơn hàng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td><strong>#CDW-{order.id}</strong></td>
                                                <td>
                                                    <div className="customer-info-cell">
                                                        <strong>{order.fullname}</strong>
                                                        <span>{order.phone}</span>
                                                    </div>
                                                </td>
                                                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                                <td>
                                                    <span className={`payment-badge ${order.paymentMethod}`}>
                                                        {order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}
                                                    </span>
                                                </td>
                                                <td className="text-primary font-bold">{formatPrice(order.totalAmount)}</td>
                                                <td>
                                                    <select 
                                                        className={`status-select ${order.status}`}
                                                        value={order.status}
                                                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                                    >
                                                        <option value="pending_payment">Chờ thanh toán QR</option>
                                                        <option value="cod_pending">Chờ xử lý COD</option>
                                                        <option value="pending">Chờ xử lý (Pending)</option>
                                                        <option value="paid">Đã thanh toán</option>
                                                        <option value="processing">Đang chuẩn bị (Processing)</option>
                                                        <option value="shipped">Đang vận chuyển (Shipped)</option>
                                                        <option value="delivered">Đã giao hàng (Delivered)</option>
                                                        <option value="cancelled">Đã hủy đơn (Cancelled)</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: VOUCHERS */}
                {activeTab === 'vouchers' && (
                    <AdminVouchers />
                )}

                {/* TAB 5: MEMBERS */}
                {activeTab === 'members' && (
                    <AdminMembers />
                )}

                {/* TAB 6: INVENTORY */}
                {activeTab === 'inventory' && (
                    <AdminInventory />
                )}
            </div>

            {/* Modal Create/Edit Product Form */}
            {isFormOpen && (
                <AdminProductForm 
                    product={editingProduct} 
                    categories={categories}
                    onClose={() => setIsFormOpen(false)} 
                    onSuccess={handleFormSubmitSuccess}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
