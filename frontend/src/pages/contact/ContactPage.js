import React, { useState } from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import '../../styles/contact/Contact.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error when typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ và tên không được để trống';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email không đúng định dạng';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại gồm 10 chữ số (VD: 0912345678)';
        }
        if (!formData.subject.trim()) {
            newErrors.subject = 'Chủ đề không được để trống';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Nội dung tin nhắn không được để trống';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Nội dung tin nhắn phải từ 10 ký tự trở lên';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Simulating API call
        setIsSubmitting(true);
        setIsSuccess(false);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            // Clear success message after 5 seconds
            setTimeout(() => {
                setIsSuccess(false);
            }, 5000);
        }, 1500);
    };

    return (
        <div className="contact-page">
            {/* Header section */}
            <div className="contact-header">
                <h1>Liên Hệ Với Chúng Tôi</h1>
                <p>Bạn có bất kỳ câu hỏi, đóng góp ý kiến hoặc yêu cầu đặt hàng thiết kế riêng? Đừng ngần ngại gửi lời nhắn cho TTH Shop!</p>
            </div>

            <div className="contact-container">
                {/* Left panel: Info & Map */}
                <div className="contact-info-panel">
                    {/* Contact details */}
                    <div className="contact-info-card">
                        <h2>Thông Tin Liên Hệ</h2>

                        <div className="info-item">
                            <div className="info-icon-wrapper">
                                <FontAwesomeIcon icon={icons.location} />
                            </div>
                            <div className="info-text-wrapper">
                                <h3>Địa Chỉ Cửa Hàng</h3>
                                <p>Khu phố 6, Phường Linh Trung, Thành phố Thủ Đức, TP. Hồ Chí Minh (Gần ĐH Nông Lâm)</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon-wrapper">
                                <FontAwesomeIcon icon={icons.phone} />
                            </div>
                            <div className="info-text-wrapper">
                                <h3>Hotline & Zalo</h3>
                                <p>0912 345 678 (Hỗ trợ 24/7)</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon-wrapper">
                                <FontAwesomeIcon icon={icons.email} />
                            </div>
                            <div className="info-text-wrapper">
                                <h3>Email Hỗ Trợ</h3>
                                <p>support@tthhandmade.vn<br />contact@tthhandmade.vn</p>
                            </div>
                        </div>

                        {/* Social Widget */}
                        <div className="contact-socials-widget">
                            <h3>Kết Nối Với Chúng Tôi</h3>
                            <div className="social-links-row">
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-circle-link">
                                    <FontAwesomeIcon icon={icons.facebook} />
                                </a>
                                <a href="https://google.com" target="_blank" rel="noreferrer" className="social-circle-link">
                                    <FontAwesomeIcon icon={icons.google} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Google Map nhúng */}
                    <div className="contact-map-wrapper">
                        <iframe 
                            title="TTH Shop Location Map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4749293674697!2d106.78440317570417!3d10.851432457805105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918.4749!2zTGluaCBUcnVuZywgVGjhu6cgxJDhu6ljLCBIbyBDaGkgTWluaCBDaXR5LCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1717750000000!5m2!1sen!2s" 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>

                {/* Right panel: Contact Form */}
                <div className="contact-form-panel">
                    <h2>Gửi Lời Nhắn Cho Cửa Hàng</h2>
                    <p>Hãy để lại thông tin, chúng tôi sẽ phản hồi lại bạn sớm nhất trong vòng 24 giờ làm việc.</p>

                    {/* Success notify */}
                    {isSuccess && (
                        <div className="contact-success-notification">
                            <div className="success-icon-wrapper">
                                <FontAwesomeIcon icon={icons.checkCircle} />
                            </div>
                            <div className="success-text-wrapper">
                                <h3>Gửi tin nhắn thành công!</h3>
                                <p>Cảm ơn bạn đã liên hệ. TTH Shop sẽ phản hồi bạn qua Email hoặc Số điện thoại trong thời gian sớm nhất.</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group-item">
                                <label htmlFor="fullName">Họ và Tên *</label>
                                <input 
                                    type="text" 
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                                {errors.fullName && <span className="form-error-msg">{errors.fullName}</span>}
                            </div>

                            <div className="form-group-item">
                                <label htmlFor="phone">Số Điện Thoại *</label>
                                <input 
                                    type="tel" 
                                    id="phone"
                                    name="phone"
                                    placeholder="0912345678"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
                            </div>

                            <div className="form-group-item span-full">
                                <label htmlFor="email">Email Liên Hệ *</label>
                                <input 
                                    type="text" 
                                    id="email"
                                    name="email"
                                    placeholder="example@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <span className="form-error-msg">{errors.email}</span>}
                            </div>

                            <div className="form-group-item span-full">
                                <label htmlFor="subject">Chủ Đề Liên Hệ *</label>
                                <input 
                                    type="text" 
                                    id="subject"
                                    name="subject"
                                    placeholder="Hỏi về sản phẩm, đặt làm quà tặng..."
                                    value={formData.subject}
                                    onChange={handleChange}
                                />
                                {errors.subject && <span className="form-error-msg">{errors.subject}</span>}
                            </div>

                            <div className="form-group-item span-full">
                                <label htmlFor="message">Nội Dung Lời Nhắn *</label>
                                <textarea 
                                    id="message"
                                    name="message"
                                    rows="5"
                                    placeholder="Nhập nội dung lời nhắn tại đây..."
                                    value={formData.message}
                                    onChange={handleChange}
                                />
                                {errors.message && <span className="form-error-msg">{errors.message}</span>}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-contact-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>Đang gửi lời nhắn...</>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={icons.paperPlane} /> Gửi Lời Nhắn
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
