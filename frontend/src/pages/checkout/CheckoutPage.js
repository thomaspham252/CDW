import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/axiosInstance';
import '../../styles/checkout/CheckoutPage.css';

const CheckoutPage = () => {
    const { cart, clearCart, getTotalPrice } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Form inputs state
    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        email: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        note: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or BANK_TRANSFER
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(null); // stores created order response

    // Pre-fill form if user is authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=checkout');
            return;
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                fullname: user.fullName || '',
                email: user.email || ''
            }));
        }
    }, [user, isAuthenticated, navigate]);

    // Redirection if cart is empty (only if order is not success yet)
    useEffect(() => {
        if (cart.length === 0 && !orderSuccess) {
            navigate('/cart');
        }
    }, [cart, orderSuccess, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const shippingFee = getTotalPrice() >= 500000 ? 0 : 30000;
    const finalTotal = getTotalPrice() + shippingFee;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.fullname || !formData.phone || !formData.email || !formData.address) {
            setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
            setLoading(false);
            return;
        }

        // Map cart items to backend format
        const items = cart.map(item => ({
            variantId: item.id, // item.id contains variantId in cart
            quantity: item.quantity
        }));

        const orderPayload = {
            ...formData,
            paymentMethod,
            items
        };

        try {
            const response = await api.post('/api/orders', orderPayload);
            setOrderSuccess(response.data);
            clearCart(); // Clear the cart after order created successfully
        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // If order was successfully created, show confirmation page
    if (orderSuccess) {
        return (
            <div className="checkout-success-page">
                <div className="success-card">
                    <div className="success-icon-wrapper">
                        <FontAwesomeIcon icon={icons.checkCircle} className="success-icon" />
                    </div>
                    <h1>Đặt Hàng Thành Công!</h1>
                    <p className="success-subtitle">Cảm ơn bạn đã mua sắm tại CDW Handmade.</p>
                    <p className="order-code">Mã đơn hàng của bạn: <strong>#CDW-{orderSuccess.id}</strong></p>

                    <div className="order-details-summary">
                        <h3>Thông tin nhận hàng</h3>
                        <div className="details-grid">
                            <div className="details-label">Người nhận:</div>
                            <div className="details-val">{orderSuccess.fullname}</div>
                            
                            <div className="details-label">Số điện thoại:</div>
                            <div className="details-val">{orderSuccess.phone}</div>

                            <div className="details-label">Email:</div>
                            <div className="details-val">{orderSuccess.email}</div>

                            <div className="details-label">Địa chỉ giao hàng:</div>
                            <div className="details-val">
                                {orderSuccess.address}
                                {orderSuccess.ward ? `, ${orderSuccess.ward}` : ''}
                                {orderSuccess.district ? `, ${orderSuccess.district}` : ''}
                                {orderSuccess.province ? `, ${orderSuccess.province}` : ''}
                            </div>

                            <div className="details-label">Hình thức thanh toán:</div>
                            <div className="details-val">
                                {orderSuccess.paymentMethod === 'COD' 
                                    ? 'Thanh toán tiền mặt khi nhận hàng (COD)' 
                                    : 'Chuyển khoản ngân hàng'}
                            </div>

                            <div className="details-label font-bold">Tổng thanh toán:</div>
                            <div className="details-val text-primary font-bold">{formatPrice(orderSuccess.totalAmount)}</div>
                        </div>
                    </div>

                    {orderSuccess.paymentMethod === 'BANK_TRANSFER' && (
                        <div className="bank-transfer-instructions">
                            <h3>Hướng dẫn chuyển khoản nhanh bằng QR Code</h3>
                            <p className="inst-desc">Bạn hãy quét mã QR dưới đây hoặc chuyển khoản theo thông tin ngân hàng để thanh toán cho đơn hàng.</p>
                            
                            <div className="bank-info-box">
                                <div className="bank-logo-title">Ngân hàng VietinBank</div>
                                <div className="bank-info-row">
                                    <span>Số tài khoản:</span>
                                    <strong className="copyable">102874981726</strong>
                                </div>
                                <div className="bank-info-row">
                                    <span>Chủ tài khoản:</span>
                                    <strong>CỬA HÀNG HANDMADE CDW</strong>
                                </div>
                                <div className="bank-info-row">
                                    <span>Số tiền:</span>
                                    <strong className="text-primary">{formatPrice(orderSuccess.totalAmount)}</strong>
                                </div>
                                <div className="bank-info-row">
                                    <span>Nội dung CK:</span>
                                    <strong className="copyable">CDW {orderSuccess.id}</strong>
                                </div>
                            </div>

                            <div className="qr-code-wrapper">
                                <img 
                                    src={`https://img.vietqr.io/image/vietinbank-102874981726-compact2.png?amount=${orderSuccess.totalAmount}&addInfo=CDW%20${orderSuccess.id}&accountName=CUA%20HANG%20HANDMADE%20CDW`} 
                                    alt="VietQR Bank Transfer" 
                                    className="qr-image"
                                />
                                <span className="qr-hint"><FontAwesomeIcon icon={icons.shield} /> Giao dịch được bảo mật tự động</span>
                            </div>
                        </div>
                    )}

                    <div className="success-actions">
                        <Link to="/products" className="btn-success-primary">
                            <FontAwesomeIcon icon={icons.chevronLeft} /> Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-header">
                    <h1>
                        <FontAwesomeIcon icon={icons.creditCard} />
                        Thanh toán đơn hàng
                    </h1>
                    <Link to="/cart" className="back-to-cart">
                        <FontAwesomeIcon icon={icons.chevronLeft} /> Quay lại giỏ hàng
                    </Link>
                </div>

                {error && <div className="checkout-error-banner"><FontAwesomeIcon icon={icons.warning} /> {error}</div>}

                <form onSubmit={handleSubmit} className="checkout-form-layout">
                    {/* Left Column: Billing Information */}
                    <div className="billing-section">
                        <h2><FontAwesomeIcon icon={icons.location} className="section-icon" /> Thông tin giao hàng</h2>
                        
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Họ và tên *</label>
                                <input 
                                    type="text" 
                                    name="fullname" 
                                    value={formData.fullname} 
                                    onChange={handleInputChange} 
                                    placeholder="Nguyễn Văn A" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group-row col-2">
                            <div className="form-group">
                                <label>Số điện thoại *</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleInputChange} 
                                    placeholder="0912345678" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    placeholder="username@example.com" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ nhà (Số nhà, tên đường...) *</label>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                placeholder="Ví dụ: 123 Đường Nguyễn Trãi" 
                                required 
                            />
                        </div>

                        <div className="form-group-row col-3">
                            <div className="form-group">
                                <label>Tỉnh / Thành phố</label>
                                <input 
                                    type="text" 
                                    name="province" 
                                    value={formData.province} 
                                    onChange={handleInputChange} 
                                    placeholder="Hà Nội / TP.HCM" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Quận / Huyện</label>
                                <input 
                                    type="text" 
                                    name="district" 
                                    value={formData.district} 
                                    onChange={handleInputChange} 
                                    placeholder="Quận 1 / Cầu Giấy" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Phường / Xã</label>
                                <input 
                                    type="text" 
                                    name="ward" 
                                    value={formData.ward} 
                                    onChange={handleInputChange} 
                                    placeholder="Phường Bến Nghé" 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Ghi chú đơn hàng (Không bắt buộc)</label>
                            <textarea 
                                name="note" 
                                value={formData.note} 
                                onChange={handleInputChange} 
                                placeholder="Ghi chú về thời gian giao hàng, hướng dẫn chỉ đường..." 
                                rows="3"
                            />
                        </div>

                        <div className="payment-method-section">
                            <h2><FontAwesomeIcon icon={icons.creditCard} className="section-icon" /> Phương thức thanh toán</h2>
                            
                            <div className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`} onClick={() => setPaymentMethod('COD')}>
                                <input 
                                    type="radio" 
                                    id="method-cod" 
                                    name="paymentMethod" 
                                    value="COD" 
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                />
                                <label htmlFor="method-cod">
                                    <span className="payment-option-title">Thanh toán khi nhận hàng (COD)</span>
                                    <span className="payment-option-desc">Thanh toán bằng tiền mặt khi shipper giao hàng tới nhà bạn.</span>
                                </label>
                            </div>

                            <div className={`payment-option ${paymentMethod === 'BANK_TRANSFER' ? 'active' : ''}`} onClick={() => setPaymentMethod('BANK_TRANSFER')}>
                                <input 
                                    type="radio" 
                                    id="method-bank" 
                                    name="paymentMethod" 
                                    value="BANK_TRANSFER" 
                                    checked={paymentMethod === 'BANK_TRANSFER'}
                                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                                />
                                <label htmlFor="method-bank">
                                    <span className="payment-option-title">Chuyển khoản ngân hàng (Quét mã QR VietQR)</span>
                                    <span className="payment-option-desc">Chuyển khoản qua ứng dụng Mobile Banking của bạn bằng cách quét mã QR tự động.</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="order-summary-section">
                        <h2>Đơn hàng của bạn</h2>
                        
                        <div className="order-items-list">
                            {cart.map(item => (
                                <div key={item.key} className="order-item-row">
                                    <div className="order-item-img">
                                        <img src={item.image || 'https://placehold.co/50x50?text=No+Image'} alt={item.name} />
                                        <span className="order-item-qty">{item.quantity}</span>
                                    </div>
                                    <div className="order-item-info">
                                        <span className="order-item-name">{item.name}</span>
                                        {item.size && <span className="order-item-variant">{item.size}</span>}
                                    </div>
                                    <div className="order-item-price">
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-calculations">
                            <div className="calc-row">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(getTotalPrice())}</span>
                            </div>
                            <div className="calc-row">
                                <span>Phí giao hàng:</span>
                                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                            </div>
                            <div className="calc-divider" />
                            <div className="calc-row total-amount-row">
                                <span>Tổng thanh toán:</span>
                                <span className="final-price">{formatPrice(finalTotal)}</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-place-order" 
                            disabled={loading}
                        >
                            {loading ? (
                                <span>Đang xử lý...</span>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={icons.shoppingBag} /> Đặt Hàng Ngay ({formatPrice(finalTotal)})
                                </>
                            )}
                        </button>
                        
                        <p className="checkout-footer-hint">
                            <FontAwesomeIcon icon={icons.shield} /> Thông tin cá nhân của bạn được bảo mật tuyệt đối.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
