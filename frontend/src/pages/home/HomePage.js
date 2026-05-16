import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHomePage } from '../../hooks/useHomePage';
import { formatPrice } from '../../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import '../../styles/home/HomePage.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CATEGORIES = [
    { name: 'Phụ kiện',          slug: 'phu-kien',           emoji: '💍' },
    { name: 'Thời trang',         slug: 'thoi-trang',          emoji: '👗' },
    { name: 'Trang trí',          slug: 'trang-tri',           emoji: '🕯️' },
    { name: 'Túi xách',           slug: 'tui-xach',            emoji: '👜' },
    { name: 'Búp bê',             slug: 'bup-be',              emoji: '🪆' },
    { name: 'Hoa handmade',       slug: 'hoa-handmade',        emoji: '🌸' },
    { name: 'Móc chìa khóa',      slug: 'moc-chia-khoa',       emoji: '🔑' },
    { name: 'Sản phẩm từ len',    slug: 'san-pham-tu-len',     emoji: '🧶' },
];

const BANNERS = [
    {
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
        tag: 'Thủ công tinh tế',
        title: 'Quy trình\nchế tác',
        desc: 'Tỉ mỉ trong từng đường kim mũi chỉ',
    },
    {
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&q=80',
        tag: 'Phong cách trẻ trung',
        title: 'Túi vải\nCanvas',
        desc: 'Bền đẹp, thân thiện môi trường',
    },
    {
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1600&q=80',
        tag: 'Sang trọng & bền bỉ',
        title: 'Phụ kiện\nđồ da',
        desc: 'Theo thời gian, giá trị càng tăng',
    },
];

const HomePage = () => {
    const navigate = useNavigate();
    const {
        loading,
        favorites,
        bestSellingProducts,
        handleAddToCart,
        handleToggleFavorite,
        handleProductClick,
        handleViewProducts,
    } = useHomePage();

    return (
        <div className="home">

            {/* ── HERO BANNER ── */}
            <section className="hero-slider">
                <Swiper
                    spaceBetween={0}
                    centeredSlides
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation
                    modules={[Autoplay, Pagination, Navigation]}
                    className="hero-swiper"
                >
                    {BANNERS.map((b, i) => (
                        <SwiperSlide key={i}>
                            <div
                                className="hero-slide"
                                style={{ backgroundImage: `url(${b.image})` }}
                            >
                                <div className="hero-overlay" />
                                <div className="hero-content">
                                    <span className="hero-tag">{b.tag}</span>
                                    <h1>{b.title.split('\n').map((t, j) => (
                                        <span key={j}>{t}<br /></span>
                                    ))}</h1>
                                    <p>{b.desc}</p>
                                    <button className="hero-btn" onClick={handleViewProducts}>
                                        <FontAwesomeIcon icon={icons.products} />
                                        Khám phá ngay
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* ── STATS ── */}
            <section className="stats-bar">
                {[
                    { icon: icons.shoppingBag, num: '100+',  label: 'Sản phẩm' },
                    { icon: icons.tag,         num: '13',    label: 'Danh mục' },
                    { icon: icons.gift,        num: '100%',  label: 'Handmade' },
                    { icon: icons.user,        num: '500+',  label: 'Khách hàng' },
                ].map((s, i) => (
                    <div key={i} className="stat-item">
                        <FontAwesomeIcon icon={s.icon} className="stat-icon" />
                        <strong>{s.num}</strong>
                        <span>{s.label}</span>
                    </div>
                ))}
            </section>

            {/* ── DANH MỤC ── */}
            <section className="categories-section">
                <div className="section-title">
                    <h2>Khám phá danh mục</h2>
                    <p>Tìm kiếm sản phẩm handmade theo sở thích của bạn</p>
                </div>
                <div className="categories-grid">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.slug}
                            to={`/products?category=${encodeURIComponent(cat.name)}`}
                            className="category-card"
                        >
                            <span className="cat-emoji">{cat.emoji}</span>
                            <span className="cat-name">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── VỀ CHÚNG TÔI ── */}
            <section className="about-section">
                <div className="about-images">
                    <img
                        src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80"
                        alt="Chế tác"
                        className="about-img-main"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80"
                        alt="Sản phẩm"
                        className="about-img-sub"
                    />
                </div>
                <div className="about-content">
                    <span className="about-tag">✦ Câu chuyện của chúng tôi</span>
                    <h2>Mỗi sản phẩm là<br />một tác phẩm nghệ thuật</h2>
                    <p>
                        TTH Shop ra đời từ tình yêu với nghề thủ công truyền thống.
                        Chúng tôi tin rằng mỗi sản phẩm handmade đều mang trong mình
                        câu chuyện riêng — từ đôi bàn tay người thợ đến trái tim người nhận.
                    </p>
                    <ul className="about-features">
                        <li><span>✓</span> 100% làm thủ công, không sản xuất hàng loạt</li>
                        <li><span>✓</span> Chất liệu tự nhiên, thân thiện môi trường</li>
                        <li><span>✓</span> Có thể đặt theo yêu cầu riêng</li>
                        <li><span>✓</span> Đóng gói cẩn thận, giao hàng toàn quốc</li>
                    </ul>
                    <button className="about-btn" onClick={handleViewProducts}>
                        Xem tất cả sản phẩm
                    </button>
                </div>
            </section>

            {/* ── SẢN PHẨM NỔI BẬT ── */}
            <section className="featured-section">
                <div className="section-title">
                    <h2>Sản phẩm nổi bật</h2>
                    <p>Những sản phẩm được yêu thích nhất tại TTH Shop</p>
                </div>

                {loading ? (
                    <div className="products-skeleton">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-img" />
                                <div className="skeleton-line w80" />
                                <div className="skeleton-line w50" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="featured-swiper-wrap">
                        <Swiper
                            spaceBetween={20}
                            slidesPerView={4}
                            navigation
                            modules={[Navigation]}
                            breakpoints={{
                                0:    { slidesPerView: 1 },
                                480:  { slidesPerView: 2 },
                                768:  { slidesPerView: 3 },
                                1100: { slidesPerView: 4 },
                            }}
                        >
                            {bestSellingProducts.map((product) => {
                                const isFav = favorites.some(id => String(id) === String(product.id));
                                return (
                                    <SwiperSlide key={product.id}>
                                        <div className="product-card">
                                            <div
                                                className="product-img-wrap"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    onError={e => e.target.src = 'https://placehold.co/300x300?text=No+Image'}
                                                />
                                                <button
                                                    className={`fav-btn ${isFav ? 'active' : ''}`}
                                                    onClick={e => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                                                >
                                                    <FontAwesomeIcon icon={isFav ? icons.heart : icons.heartRegular} />
                                                </button>
                                                <div className="product-overlay">
                                                    <button className="quick-view-btn" onClick={() => handleProductClick(product)}>
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="product-body">
                                                <span className="product-cat">{product.category}</span>
                                                <h3 className="product-name" onClick={() => handleProductClick(product)}>
                                                    {product.name}
                                                </h3>
                                                <div className="product-footer">
                                                    <span className="product-price">{formatPrice(product.price)}</span>
                                                    <button className="add-cart-btn" onClick={() => handleAddToCart(product.id)}>
                                                        <FontAwesomeIcon icon={icons.cart} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>
                )}

                <div className="view-all-wrap">
                    <button className="view-all-btn" onClick={() => navigate('/products')}>
                        Xem tất cả sản phẩm
                        <FontAwesomeIcon icon={icons.chevronRight || icons.chevronLeft} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                </div>
            </section>

            {/* ── BANNER GIỮA ── */}
            <section
                className="mid-banner"
                style={{
                    backgroundImage: `linear-gradient(rgba(61,43,31,0.82), rgba(61,43,31,0.82)), url('https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1600&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="mid-banner-content">
                    <span>🎁 Quà tặng ý nghĩa</span>
                    <h2>Tặng quà handmade —<br />Gửi trọn yêu thương</h2>
                    <p>Mỗi sản phẩm đều có thể đặt theo yêu cầu riêng của bạn</p>
                    <button onClick={handleViewProducts}>Đặt hàng ngay</button>
                </div>
            </section>

            {/* ── CAM KẾT ── */}
            <section className="promise-section">
                <div className="section-title">
                    <h2>Cam kết của TTH Shop</h2>
                </div>
                <div className="promise-grid">
                    {[
                        { emoji: '🤲', title: '100% Thủ công',    desc: 'Mỗi sản phẩm đều được làm tay tỉ mỉ, không sản xuất hàng loạt' },
                        { emoji: '🌿', title: 'Nguyên liệu sạch', desc: 'Chất liệu tự nhiên, an toàn cho người dùng và môi trường' },
                        { emoji: '📦', title: 'Đóng gói cẩn thận', desc: 'Hộp quà xinh xắn, bảo vệ sản phẩm trong suốt hành trình' },
                        { emoji: '🚚', title: 'Giao hàng toàn quốc', desc: 'Hợp tác với đơn vị vận chuyển uy tín, giao nhanh 2-3 ngày' },
                        { emoji: '💬', title: 'Hỗ trợ tận tâm',   desc: 'Đội ngũ tư vấn nhiệt tình, giải đáp mọi thắc mắc 24/7' },
                        { emoji: '🔄', title: 'Đổi trả dễ dàng',  desc: 'Chính sách đổi trả trong 7 ngày nếu sản phẩm có lỗi' },
                    ].map((p, i) => (
                        <div key={i} className="promise-card">
                            <span className="promise-emoji">{p.emoji}</span>
                            <h3>{p.title}</h3>
                            <p>{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ĐÁNH GIÁ KHÁCH HÀNG ── */}
            <section className="reviews-section">
                <div className="section-title light">
                    <h2>Khách hàng nói gì?</h2>
                    <p>Hơn 500 khách hàng đã tin tưởng lựa chọn TTH Shop</p>
                </div>
                <div className="reviews-grid">
                    {[
                        { name: 'Trà Giang',   init: 'TG', product: 'Tranh cuộn',  stars: 5, text: 'Lần đầu mua tranh giấy cuộn nhưng rất bất ngờ vì độ độc đáo. Sản phẩm nhẹ, dễ bảo quản và rất nổi bật. Đóng gói rất cẩn thận.' },
                        { name: 'Minh Anh',    init: 'MA', product: 'Nến thơm',    stars: 5, text: 'Mùi nến thơm rất dễ chịu, không bị gắt như các loại nến công nghiệp. Hũ nến xinh xắn, dùng làm quà tặng rất hợp lý.' },
                        { name: 'Hoàng Long',  init: 'HL', product: 'Túi Canvas',  stars: 5, text: 'Túi vải rất dày dặn, đường may chắc chắn. Mình dùng đi học hàng ngày đựng rất nhiều sách vở mà vẫn bền. Sẽ ủng hộ shop dài dài.' },
                    ].map((r, i) => (
                        <div key={i} className="review-card">
                            <div className="review-stars">
                                {'★'.repeat(r.stars)}
                            </div>
                            <p className="review-text">"{r.text}"</p>
                            <div className="review-author">
                                <div className="review-avatar">{r.init}</div>
                                <div>
                                    <strong>{r.name}</strong>
                                    <span>Đã mua {r.product}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default HomePage;
