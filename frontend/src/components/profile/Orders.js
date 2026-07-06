import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/axiosInstance';

const ORDER_STATUS = {
  WAITING_CONFIRMATION: { label: 'Chờ xác nhận', className: 'pending' },
  WAITING_PICKUP: { label: 'Chờ lấy hàng', className: 'processing' },
  SHIPPING: { label: 'Chờ vận chuyển', className: 'shipped' },
  DELIVERED: { label: 'Đã giao', className: 'delivered' },
  CANCELLED: { label: 'Đã hủy', className: 'cancelled' },
  pending: { label: 'Chờ xử lý', className: 'pending' },
  pending_payment: { label: 'Chờ thanh toán', className: 'pending' },
  cod_pending: { label: 'Chờ xử lý COD', className: 'pending' },
  processing: { label: 'Đang xử lý', className: 'processing' },
  shipped: { label: 'Đang giao', className: 'shipped' },
  delivered: { label: 'Đã giao', className: 'delivered' },
  cancelled: { label: 'Đã hủy', className: 'cancelled' },
};

const PAYMENT_STATUS = {
  UNPAID: { label: 'Chờ thanh toán', className: 'pending' },
  PAID: { label: 'Đã thanh toán', className: 'paid' },
  FAILED: { label: 'Thanh toán lỗi', className: 'failed' },
  COD: { label: 'COD', className: 'cod' },
};

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'waiting_confirmation', label: 'Chờ xác nhận' },
  { key: 'waiting_pickup', label: 'Chờ lấy hàng' },
  { key: 'shipping', label: 'Vận chuyển' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const Orders = ({
  orders,
  ordersLoading,
  ordersError,
  handleOrderDetails,
  handleBuyAgain,
}) => {
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  const getStatusConfig = (status) => {
    return ORDER_STATUS[status] || ORDER_STATUS[String(status || '').toUpperCase()] || {
      label: status || 'Chờ xử lý',
      className: 'pending',
    };
  };

  const getPaymentStatusConfig = (status, method) => {
    if (method === 'COD') return PAYMENT_STATUS.COD;
    return PAYMENT_STATUS[String(status || 'UNPAID').toUpperCase()] || PAYMENT_STATUS.UNPAID;
  };

  const getPaymentMethodLabel = (method) => {
    if (method === 'COD') return 'COD';
    if (method === 'VNPAY') return 'VNPay';
    return 'QR VietQR';
  };

  const normalizeStatus = (status) => String(status || '').toLowerCase();

  const counts = useMemo(() => {
    return FILTERS.reduce((acc, filter) => {
      acc[filter.key] = filter.key === 'all'
        ? orders.length
        : orders.filter((order) => normalizeStatus(order.status) === filter.key).length;
      return acc;
    }, {});
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const status = normalizeStatus(order.status);
    const matchesStatus = ordersFilter === 'all' || status === ordersFilter;

    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const orderId = `#CDW-${order.id}`.toLowerCase();
    const productNames = order.items?.map((item) => item.productName?.toLowerCase()).join(' ') || '';
    return orderId.includes(query) || productNames.includes(query);
  });

  const canPayOnline = (order) => {
    return order.paymentMethod !== 'COD' && String(order.paymentStatus || 'UNPAID').toUpperCase() !== 'PAID';
  };

  const handlePayOrder = async (order) => {
    setPaymentError('');
    setPaymentLoadingId(order.id);

    try {
      if (order.paymentMethod === 'VNPAY') {
        const response = await api.post(`/api/payment/orders/${order.id}/vnpay-url`);
        if (response.data?.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        }
        return;
      }

      if (order.paymentMethod === 'BANK_TRANSFER') {
        const response = await api.get(`/api/payment/orders/${order.id}/bank-transfer`);
        setPaymentModal(response.data);
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Không thể tạo thông tin thanh toán. Vui lòng thử lại.');
    } finally {
      setPaymentLoadingId(null);
    }
  };

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div>
      <h2 className="profile-tab-title">Đơn hàng của tôi</h2>

      <div className="orders-filter-tabs">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            className={`orders-filter-tab-btn ${ordersFilter === filter.key ? 'active' : ''}`}
            onClick={() => setOrdersFilter(filter.key)}
          >
            {filter.label} <span className="filter-count">({counts[filter.key] || 0})</span>
          </button>
        ))}
      </div>

      <div className="orders-search-bar">
        <FontAwesomeIcon icon={icons.search} className="search-icon" />
        <input
          type="text"
          className="orders-search-input"
          placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {paymentError && <div className="profile-alert error">{paymentError}</div>}

      {ordersLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải danh sách đơn hàng...</div>
      ) : ordersError ? (
        <div className="profile-alert error">{ordersError}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="order-history-empty">
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng trong phân mục này.</p>
          <Link to="/products" className="btn-order-buy-again" style={{ textDecoration: 'none' }}>
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="order-history-list-new">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus, order.paymentMethod);

            return (
              <div className="order-card-new" key={order.id}>
                <div className="order-card-header-new">
                  <div>
                    <strong>#CDW-{order.id}</strong>
                    <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="order-badge-row">
                    <span className={`order-status-pill ${statusConfig.className}`}>{statusConfig.label}</span>
                    <span className={`payment-status-pill ${paymentStatusConfig.className}`}>
                      {paymentStatusConfig.label}
                    </span>
                    <span className="payment-method-pill">{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                </div>

                <div className="order-items-section">
                  {order.items?.map((item, index) => (
                    <div className="order-item-new" key={item.id || index}>
                      <img
                        src={item.imageUrl || 'https://placehold.co/80x80?text=No+Image'}
                        alt={item.productName}
                        className="order-item-image"
                        onError={(e) => (e.target.src = 'https://placehold.co/80x80?text=No+Image')}
                      />
                      <div className="order-item-details">
                        <h4 className="order-item-name">{item.productName}</h4>
                        <div className="order-item-meta">
                          {item.size && <span className="order-item-variant">Phân loại: {item.size}</span>}
                          <span className="order-item-quantity">x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="order-item-pricing">
                        <span className="order-item-price">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer-new">
                  <div className="order-total-section">
                    <FontAwesomeIcon icon={icons.moneyBill} className="total-icon" />
                    <span className="total-label">Thành tiền:</span>
                    <span className="total-amount">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="order-actions-new">
                    {canPayOnline(order) && (
                      <button
                        className="btn-pay-order-new"
                        onClick={() => handlePayOrder(order)}
                        disabled={paymentLoadingId === order.id}
                      >
                        {paymentLoadingId === order.id
                          ? 'Đang tạo...'
                          : order.paymentMethod === 'VNPAY' ? 'Thanh toán lại' : 'Xem mã QR'}
                      </button>
                    )}
                    <button className="btn-contact-seller" onClick={() => handleOrderDetails(order)}>
                      Chi tiết
                    </button>
                    <button className="btn-buy-again-new" onClick={() => handleBuyAgain(order)}>
                      Mua lại
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {paymentModal && (
        <div className="order-payment-modal-overlay" onClick={() => setPaymentModal(null)}>
          <div className="order-payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-payment-modal-header">
              <h3>Thanh toán QR đơn #CDW-{paymentModal.orderId}</h3>
              <button type="button" onClick={() => setPaymentModal(null)}>×</button>
            </div>
            <img src={paymentModal.qrImageUrl} alt="VietQR" className="order-payment-qr" />
            <div className="order-payment-info">
              <div><span>Ngân hàng</span><strong>{paymentModal.bankName}</strong></div>
              <div><span>Số tài khoản</span><strong>{paymentModal.accountNo}</strong></div>
              <div><span>Chủ tài khoản</span><strong>{paymentModal.displayAccountName}</strong></div>
              <div><span>Số tiền</span><strong>{formatPrice(paymentModal.amount)}</strong></div>
              <div><span>Nội dung</span><strong>{paymentModal.transferContent}</strong></div>
            </div>
            <div className="order-payment-actions">
              <button type="button" onClick={() => copyText(paymentModal.accountNo)}>Copy STK</button>
              <button type="button" onClick={() => copyText(paymentModal.transferContent)}>Copy nội dung</button>
            </div>
            <p className="order-payment-note">
              Sau khi chuyển khoản, đơn sẽ ở trạng thái chờ xác nhận để shop kiểm tra thanh toán.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
