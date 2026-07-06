import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/axiosInstance';
import addressService from '../../services/addressService';
import {
    BANK_TRANSFER_CONFIG,
    getShippingFee,
    getTransferContent,
    getVietQrImageUrl
} from '../../config/paymentConfig';
import '../../styles/checkout/CheckoutPage.css';

const CheckoutPage = () => {
    const { cart, clearCart, getTotalPrice } = useCart();
    const { user, isAuthenticated, authLoaded } = useAuth();
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

    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER'); // BANK_TRANSFER or COD
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(null); // stores created order response
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
    const [addressLoading, setAddressLoading] = useState(false);
    const [addressError, setAddressError] = useState('');

    // Pre-fill form if user is authenticated
    useEffect(() => {
        if (!authLoaded) return;

        if (!isAuthenticated) {
            navigate('/login?redirect=checkout', { replace: true });
            return;
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                fullname: user.fullName || '',
                email: user.email || ''
            }));
        }
    }, [user, isAuthenticated, authLoaded, navigate]);

    // Redirection if cart is empty (only if order is not success yet)
    useEffect(() => {
        if (cart.length === 0 && !orderSuccess) {
            navigate('/cart');
        }
    }, [cart, orderSuccess, navigate]);

    useEffect(() => {
        const loadProvinces = async () => {
            try {
                setAddressLoading(true);
                setAddressError('');
                const data = await addressService.getProvinces();
                setProvinces(data);
            } catch (err) {
                console.error('Error loading provinces:', err);
                setAddressError('Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
            } finally {
                setAddressLoading(false);
            }
        };

        loadProvinces();
    }, []);

    useEffect(() => {
        const loadDistricts = async () => {
            if (!selectedProvinceCode) {
                setDistricts([]);
                return;
            }

            try {
                setAddressLoading(true);
                setAddressError('');
                const data = await addressService.getDistricts(selectedProvinceCode);
                setDistricts(data);
            } catch (err) {
                console.error('Error loading districts:', err);
                setDistricts([]);
                setAddressError('Không thể tải danh sách quận/huyện.');
            } finally {
                setAddressLoading(false);
            }
        };

        loadDistricts();
    }, [selectedProvinceCode]);

    useEffect(() => {
        const loadWards = async () => {
            if (!selectedDistrictCode) {
                setWards([]);
                return;
            }

            try {
                setAddressLoading(true);
                setAddressError('');
                const data = await addressService.getWards(selectedDistrictCode);
                setWards(data);
            } catch (err) {
                console.error('Error loading wards:', err);
                setWards([]);
                setAddressError('Không thể tải danh sách phường/xã.');
            } finally {
                setAddressLoading(false);
            }
        };

        loadWards();
    }, [selectedDistrictCode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProvinceChange = (e) => {
        const selectedCode = e.target.value;
        const selectedProvince = provinces.find((item) => String(item.code) === selectedCode);

        setSelectedProvinceCode(selectedCode);
        setSelectedDistrictCode('');
        setWards([]);
        setFormData(prev => ({
            ...prev,
            province: selectedProvince?.name || '',
            district: '',
            ward: ''
        }));
    };

    const handleDistrictChange = (e) => {
        const selectedCode = e.target.value;
        const selectedDistrict = districts.find((item) => String(item.code) === selectedCode);

        setSelectedDistrictCode(selectedCode);
        setFormData(prev => ({
            ...prev,
            district: selectedDistrict?.name || '',
            ward: ''
        }));
    };

    const handleWardChange = (e) => {
        const selectedCode = e.target.value;
        const selectedWard = wards.find((item) => String(item.code) === selectedCode);

        setFormData(prev => ({
            ...prev,
            ward: selectedWard?.name || ''
        }));
    };

    const shippingFee = getShippingFee(getTotalPrice());
    const finalTotal = getTotalPrice() + shippingFee;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.fullname || !formData.phone || !formData.email || !formData.address || !formData.province || !formData.district || !formData.ward) {
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
            clearCart(); // Clear the cart after order created successfully
            if (paymentMethod === 'VNPAY' && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                setOrderSuccess(response.data);
            }
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
                            <h3>Quét QR để thanh toán</h3>
                            <p className="inst-desc">Mở ứng dụng ngân hàng, quét mã VietQR bên dưới và kiểm tra đúng số tiền trước khi chuyển khoản.</p>
                            
                            <div className="bank-info-box">
                                <div className="bank-logo-title">{BANK_TRANSFER_CONFIG.bankName}</div>
                                <div className="bank-info-row">
                                    <span>Số tài khoản:</span>
                                    <strong className="copyable">{BANK_TRANSFER_CONFIG.accountNo}</strong>
                                </div>
                                <div className="bank-info-row">
                                    <span>Chủ tài khoản:</span>
                                    <strong>{BANK_TRANSFER_CONFIG.displayAccountName}</strong>
                                </div>
                                <div className="bank-info-row">
                                    <span>Số tiền:</span>
                                    <strong className="text-primary">{formatPrice(orderSuccess.totalAmount)}</strong>
                                </div>
                                <div className="bank-info-row">
                                    <span>Nội dung CK:</span>
                                    <strong className="copyable">{getTransferContent(orderSuccess.id)}</strong>
                                </div>
                            </div>

                            <div className="qr-code-wrapper">
                                <img 
                                    src={getVietQrImageUrl(orderSuccess)}
                                    alt="VietQR Bank Transfer" 
                                    className="qr-image"
                                />
                                <span className="qr-hint"><FontAwesomeIcon icon={icons.shield} /> Đơn hàng sẽ được xử lý sau khi shop xác nhận thanh toán</span>
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

    if (!authLoaded) {
        return (
            <div className="checkout-page">
                <div className="loading">Đang kiểm tra đăng nhập...</div>
            </div>
        );
    }

    return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="checkout-kicker">
                        <Link to="/cart" className="back-to-cart">
                            <FontAwesomeIcon icon={icons.chevronLeft} /> Quay lại giỏ hàng
                        </Link>
                    </div>

                {error && <div className="checkout-error-banner"><FontAwesomeIcon icon={icons.warning} /> {error}</div>}
                {addressError && <div className="checkout-error-banner"><FontAwesomeIcon icon={icons.warning} /> {addressError}</div>}

                <form onSubmit={handleSubmit} className="checkout-form-layout">
                    {/* Left Column: Billing Information */}
                    <div className="billing-section">
                        <h2>Thông tin giao hàng</h2>
                        
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Họ và tên *</label>
                                <input 
                                    type="text" 
                                    name="fullname" 
                                    value={formData.fullname} 
                                    onChange={handleInputChange} 
                                    placeholder="Nguyễn Văn An" 
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
                                    placeholder="090 123 4567" 
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
                                    placeholder="an.nguyen@example.com" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ chi tiết (Số nhà, tên đường) *</label>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                placeholder="123 Đường Lê Lợi" 
                                required 
                            />
                        </div>

                        <div className="form-group-row col-3">
                            <div className="form-group">
                                <label>Thành phố/Tỉnh *</label>
                                <select
                                    value={selectedProvinceCode}
                                    onChange={handleProvinceChange}
                                    disabled={addressLoading && provinces.length === 0}
                                    required
                                >
                                    <option value="">Chọn Thành phố</option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quận/Huyện *</label>
                                <select
                                    value={selectedDistrictCode}
                                    onChange={handleDistrictChange}
                                    disabled={!selectedProvinceCode || addressLoading}
                                    required
                                >
                                    <option value="">Chọn Quận/Huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.code} value={district.code}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phường/Xã *</label>
                                <select
                                    value={wards.find((ward) => ward.name === formData.ward)?.code || ''}
                                    onChange={handleWardChange}
                                    disabled={!selectedDistrictCode || addressLoading}
                                    required
                                >
                                    <option value="">Chọn Phường/Xã</option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="payment-method-section">
                            <h2>Phương thức thanh toán</h2>

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
                                    <span className="payment-option-title">Chuyển khoản ngân hàng</span>
                                    <span className="payment-option-desc">Chuyển khoản qua mã QR VietQR hoặc ứng dụng ngân hàng của bạn.</span>
                                </label>
                            </div>

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
                                    <span className="payment-option-desc">Thanh toán bằng tiền mặt khi shipper giao hàng đến nơi.</span>
                                </label>
                            </div>

                            <div className={`payment-option ${paymentMethod === 'VNPAY' ? 'active' : ''}`} onClick={() => setPaymentMethod('VNPAY')}>
                                <input 
                                    type="radio" 
                                    id="method-vnpay" 
                                    name="paymentMethod" 
                                    value="VNPAY" 
                                    checked={paymentMethod === 'VNPAY'}
                                    onChange={() => setPaymentMethod('VNPAY')}
                                />
                                <label htmlFor="method-vnpay">
                                    <span className="payment-option-title">Thanh toán qua VNPAY</span>
                                    <span className="payment-option-desc">Thanh toán trực tuyến an toàn qua cổng thanh toán VNPAY (ATM, Thẻ quốc tế, QR).</span>
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
                                        <span className="order-item-variant">SL: {item.quantity}</span>
                                        {item.size && <span className="order-item-size">{item.size}</span>}
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
                                <span>Đặt hàng</span>
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
