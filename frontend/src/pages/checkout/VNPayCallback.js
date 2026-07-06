import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/axiosInstance';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';
import '../../styles/checkout/VNPayCallback.css';

const VNPayCallback = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('vnp_TxnRef') || '';
    const amountRaw = searchParams.get('vnp_Amount') || '0';
    const amount = formatPrice(parseInt(amountRaw, 10) / 100);
    const bankCode = searchParams.get('vnp_BankCode') || '';
    const payDateRaw = searchParams.get('vnp_PayDate') || '';
  
    let payDate = '';
    if (payDateRaw && payDateRaw.length === 14) {
        payDate = `${payDateRaw.substring(6, 8)}/${payDateRaw.substring(4, 6)}/${payDateRaw.substring(0, 4)} ${payDateRaw.substring(8, 10)}:${payDateRaw.substring(10, 12)}:${payDateRaw.substring(12, 14)}`;
    }

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const response = await api.get(`/api/payment/vnpay-callback${location.search}`);
                setResult(response.data);
            } catch (error) {
                console.error('Error verifying payment signature:', error);
                if (error.response && error.response.data) {
                    setResult(error.response.data);
                } else {
                    setResult({
                        status: 'ERROR',
                        message: 'Không thể kết nối đến máy chủ để xác thực giao dịch.'
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location.search]);

    return (
        <div className="vnpay-callback-page">
            <div className="vnpay-callback-card">
                {loading ? (
                    <>
                        <div className="status-icon-wrap loading">
                            <div className="status-spinner"></div>
                        </div>
                        <h2>Đang xác thực giao dịch...</h2>
                        <p className="status-desc">Vui lòng chờ trong giây lát, chúng tôi đang liên hệ với VNPay để xác nhận thanh toán.</p>
                    </>
                ) : (
                    <>
                        {result?.status === 'SUCCESS' ? (
                            <>
                                <div className="status-icon-wrap success">
                                    <FontAwesomeIcon icon={icons.checkCircle} style={{ fontSize: '3.5rem' }} />
                                </div>
                                <h2>Thanh Toán Thành Công!</h2>
                                <p className="status-desc">{result.message || 'Cảm ơn bạn đã hoàn tất thanh toán cho đơn hàng tại TTH Shop.'}</p>
                            </>
                        ) : (
                            <>
                                <div className="status-icon-wrap error">
                                    <FontAwesomeIcon icon={icons.close} style={{ fontSize: '3.5rem' }} />
                                </div>
                                <h2>Thanh Toán Thất Bại!</h2>
                                <p className="status-desc">{result?.message || 'Có lỗi xảy ra trong quá trình xử lý giao dịch hoặc thanh toán đã bị hủy.'}</p>
                            </>
                        )}

                        <div className="vnpay-detail-table">
                            <div className="vnpay-detail-row">
                                <span className="vnpay-detail-label">Mã đơn hàng</span>
                                <span className="vnpay-detail-value order-id">#CDW-{orderId}</span>
                            </div>
                            <div className="vnpay-detail-row">
                                <span className="vnpay-detail-label">Số tiền</span>
                                <span className="vnpay-detail-value amount">{amount}</span>
                            </div>
                            {bankCode && (
                                <div className="vnpay-detail-row">
                                    <span className="vnpay-detail-label">Ngân hàng</span>
                                    <span className="vnpay-detail-value">{bankCode}</span>
                                </div>
                            )}
                            {payDate && (
                                <div className="vnpay-detail-row">
                                    <span className="vnpay-detail-label">Thời gian giao dịch</span>
                                    <span className="vnpay-detail-value">{payDate}</span>
                                </div>
                            )}
                        </div>

                        <div className="callback-actions">
                            <Link to="/profile" className="btn btn--primary">
                                <FontAwesomeIcon icon={icons.shoppingBag} /> Đơn hàng của tôi
                            </Link>
                            <Link to="/" className="btn btn--outline">
                                <FontAwesomeIcon icon={icons.home} /> Về trang chủ
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VNPayCallback;
