import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomePage } from '../../hooks/useHomePage';
import { formatPrice } from '../../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import '../../styles/home/HomePage.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HomePage = () => {
    const navigate = useNavigate();
    const {
        loading,
        favorites,
        bestSellingProducts,
        discountedProducts,
        handleAddToCart,
        handleToggleFavorite,
        handleProductClick,
        handleViewProducts
    } = useHomePage();

    const bannerData = [
        {
            image: "/image/banner1.jpg",
            title: "Quy trình chế tác",
            description: "Tỉ mỉ trong từng đường kim mũi chỉ"
        },
        {
            image: "/image/banner2.jpg",
            title: "Túi vải Canvas",
            description: "Phong cách trẻ trung, hiện đại"
        },
        {
            image: "/image/banner3.jpg",
            title: "Phụ kiện đồ da",
            description: "Sang trọng và bền bỉ theo thời gian"
        }
    ];

    return (
        <div className="home">
            {/* BANNER CHẠY NGANG (Thay thế Hero Section cũ) */}
            <section className="hero-slider">
                <Swiper
                    spaceBetween={0}
                    centeredSlides={true}
                    autoplay={{
                        delay: 3000, // 3 giây chuyển 1 lần
                        disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper"
                >
                    {bannerData.map((banner, index) => (
                        <SwiperSlide key={index}>
                            <div className="hero-slide-item" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${banner.image})` }}>
                                <div className="hero-content">
                                    <h1>{banner.title}</h1>
                                    <p>{banner.description}</p>
                                    <button onClick={handleViewProducts}>
                                        <FontAwesomeIcon icon={icons.products} /> Xem sản phẩm
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* THỐNG KÊ */}
            <section className="stats">
                <div className="stat-item">
                    <FontAwesomeIcon icon={icons.shoppingBag} className="stat-icon" />
                    <h2>100+</h2>
                    <p>Sản phẩm</p>
                </div>
                <div className="stat-item">
                    <FontAwesomeIcon icon={icons.tag} className="stat-icon" />
                    <h2>10+</h2>
                    <p>Danh mục</p>
                </div>
                <div className="stat-item">
                    <FontAwesomeIcon icon={icons.gift} className="stat-icon" />
                    <h2>100%</h2>
                    <p>Handmade</p>
                </div>
                <div className="stat-item">
                    <FontAwesomeIcon icon={icons.user} className="stat-icon" />
                    <h2>500+</h2>
                    <p>Khách hàng</p>
                </div>
            </section>

            {/* CHẤT LIỆU */}
            <section className="materials">
                <h2>Chất liệu nổi bật</h2>

                <div className="material-list">
                    <div className="material-card">
                        {/* Ảnh 1: Nghệ nhân */}
                        <img src="/image/banner1.jpg" alt="Thủ công" />
                        <h3>Quy trình chế tác</h3>
                        <p>Tỉ mỉ trong từng đường kim mũi chỉ</p>
                    </div>
                    <div className="material-card">
                        {/* Ảnh 2: Túi vải */}
                        <img src="/image/banner2.jpg" alt="Túi vải" />
                        <h3>Túi vải Canvas</h3>
                        <p>Phong cách trẻ trung, hiện đại</p>
                    </div>
                    <div className="material-card">
                        {/* Ảnh 3: Đồ da */}
                        <img src="/image/banner3.jpg" alt="Đồ da" />
                        <h3>Phụ kiện đồ da</h3>
                        <p>Sang trọng và bền bỉ theo thời gian</p>
                    </div>
                </div>
            </section>

            {/* SẢN PHẨM BÁN CHẠY */}
            <section className="products best-selling-section">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Sản phẩm bán chạy</h2>
                    <button className="view-more-btn" onClick={() => navigate('/best-selling')}>
                        Xem thêm
                    </button>
                </div>
                {loading ? (
                    <div className="loading">Đang tải sản phẩm...</div>
                ) : (
                    <div className="products-grid">
                        {bestSellingProducts.map(product => {
                            const isFavorite = favorites.some(favId => String(favId) === String(product.id));
                            return (
                                <div key={product.id} className="product-card">
                                    <div
                                        className="product-image-container"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                        {product.stock === 0 && (
                                            <div className="out-of-stock">Hết hàng</div>
                                        )}
                                        <button
                                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(product.id);
                                            }}
                                            title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                                        >
                                            <FontAwesomeIcon icon={isFavorite ? icons.heart : icons.heartRegular} />
                                        </button>
                                    </div>

                                    <div className="product-info">
                                        <h3
                                            className="product-name"
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            {product.name}
                                        </h3>

                                        <div className="product-rating">
                                            <span className="stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <FontAwesomeIcon
                                                        key={i}
                                                        icon={icons.star}
                                                        className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
                                                    />
                                                ))}
                                            </span>
                                            <span className="rating-value">({product.rating})</span>
                                            <span className="reviews-count">({product.reviews} đánh giá)</span>
                                        </div>

                                        <div className="product-category">{product.category}</div>

                                        <div className="product-price">{formatPrice(product.price)}</div>

                                        <div className="product-stock">
                                            {product.stock > 0 ? (
                                                <span className="in-stock">Còn {product.stock} sản phẩm</span>
                                            ) : (
                                                <span className="out-of-stock-text">Hết hàng</span>
                                            )}
                                        </div>

                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(product.id)}
                                            disabled={product.stock === 0}
                                        >
                                            <FontAwesomeIcon icon={icons.cart} /> {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* SẢN PHẨM KHUYẾN MÃI */}
            {discountedProducts.length > 0 && (
                <section className="products sale-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Săn Sale Giá Sốc</h2>
                        <button className="view-more-btn" onClick={() => navigate('/flash-sale')}>
                            Xem thêm
                        </button>
                    </div>
                    <div className="products-grid">
                        {discountedProducts.map(product => {
                            const isFavorite = favorites.some(favId => String(favId) === String(product.id));
                            const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

                            return (
                                <div key={product.id} className="product-card">
                                    <div
                                        className="product-image-container"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                        <div className="discount-badge">-{discountPercent}%</div>
                                        {product.stock === 0 && (
                                            <div className="out-of-stock">Hết hàng</div>
                                        )}
                                        <button
                                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(product.id);
                                            }}
                                            title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                                        >
                                            <FontAwesomeIcon icon={isFavorite ? icons.heart : icons.heartRegular} />
                                        </button>
                                    </div>

                                    <div className="product-info">
                                        <h3
                                            className="product-name"
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            {product.name}
                                        </h3>

                                        <div className="product-rating">
                                            <span className="stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <FontAwesomeIcon
                                                        key={i}
                                                        icon={icons.star}
                                                        className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
                                                    />
                                                ))}
                                            </span>
                                            <span className="reviews-count">({product.reviews} đánh giá)</span>
                                        </div>

                                        <div className="product-category">{product.category}</div>

                                        <div className="product-price-container">
                                            <span className="product-price new">{formatPrice(product.price)}</span>
                                            <span className="product-price old">{formatPrice(product.originalPrice)}</span>
                                        </div>

                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(product.id)}
                                            disabled={product.stock === 0}
                                        >
                                            <FontAwesomeIcon icon={icons.cart} /> {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* FEEDBACK */}
            <section className="feedback">
                <div className="feedback-container">
                    <h2>Khách hàng nói gì về TTH Shop?</h2>
                    <div className="feedback-list">
                        <div className="feedback-card">
                            <div className="feedback-content">
                                "Lần đầu mua tranh giấy cuộn nhưng rất bất ngờ vì độ độc đáo. Sản phẩm nhẹ, dễ bảo quản và rất nổi bật. Đóng gói rất cẩn thận."
                            </div>
                            <div className="feedback-author">
                                <div className="author-avatar">TG</div>
                                <div className="author-info">
                                    <h4>Trà Giang</h4>
                                    <p>Đã mua Tranh cuộn</p>
                                </div>
                            </div>
                        </div>
                        <div className="feedback-card">
                            <div className="feedback-content">
                                "Mùi nến thơm rất dễ chịu, không bị gắt như các loại nến công nghiệp. Hũ nến xinh xắn, dùng làm quà tặng rất hợp lý."
                            </div>
                            <div className="feedback-author">
                                <div className="author-avatar">MA</div>
                                <div className="author-info">
                                    <h4>Minh Anh</h4>
                                    <p>Đã mua Nến thơm</p>
                                </div>
                            </div>
                        </div>
                        <div className="feedback-card">
                            <div className="feedback-content">
                                "Túi vải rất dày dặn, đường may chắc chắn. Mình dùng đi học hàng ngày đựng rất nhiều sách vở mà vẫn bền. Sẽ ủng hộ shop dài dài."
                            </div>
                            <div className="feedback-author">
                                <div className="author-avatar">HL</div>
                                <div className="author-info">
                                    <h4>Hoàng Long</h4>
                                    <p>Đã mua Túi Canvas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
