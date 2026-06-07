import React from "react";
import { Link } from "react-router-dom";
import { useHomePage } from "../../hooks/useHomePage";
import { formatPrice } from "../../utils/formatPrice";
import { FontAwesomeIcon, icons } from "../../utils/icons";
import "../../styles/home/HomePage.css";

const CRAFT_CATEGORIES = [
  {
    name: "Phụ kiện",
    sub: "Phụ kiện handmade",
    slug: "phu-kien",
    img: "https://file.hstatic.net/200000151225/file/bo_2_coc_gom_su_handmade_cao_cap_praca__4__grande.jpg",
  },
  {
    name: "Trang trí",
    sub: "Đồ trang trí thủ công",
    slug: "trang-tri",
    img: "https://dantra.vn/uploads/san-pham/vai-nem-goi/vai-tho-cam-bana/tho-cam-5.jpg",
  },
  {
    name: "Sản phẩm từ len",
    sub: "Sợi len thủ công",
    slug: "san-pham-tu-len",
    img: "https://35smhome.com/wp-content/uploads/2024/06/gia-cong-san-pham-go--1080x428.jpg",
  },
  {
    name: "Sản phẩm từ thổ cẩm",
    sub: "Vải thổ cẩm",
    slug: "san-pham-tu-tho-cam",
    img: "https://nvhphunu.vn/wp-content/uploads/2023/12/etsy-jewelry-featured-image-1.webp",
  },
];

const HomePage = () => {
  const {
    loading,
    isFavorite,
    bestSellingProducts,
    handleAddToCart,
    handleToggleFavorite,
    handleProductClick,
    handleViewProducts,
  } = useHomePage();

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero">
        <div
          className="hero-media"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1800&q=80')`,
          }}
        />
        <div className="hero-content">
          <div className="hero-panel">
            <span className="hero-kicker">Di Sản Thủ Công</span>
            <h1>
              Tạo tác từ đôi tay,
              <br />
              Lấy cảm hứng từ thiên nhiên
            </h1>
            <p>
              Khám phá những sản phẩm bền vững cho tổ ấm, mỗi món đều mang hồn
              của người thợ và câu chuyện của đất trời.
            </p>
            <button className="hero-cta" onClick={handleViewProducts}>
              Xem bộ sưu tập
            </button>
          </div>
        </div>
      </section>

      {/* ── EXPLORE OUR CRAFT ── */}
      <section className="explore-section">
        <div className="explore-title">
          <h2>Khám phá nghề thủ công</h2>
          <p>Những chất liệu và kỹ nghệ làm nên di sản</p>
        </div>
        <div className="explore-grid">
          {CRAFT_CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="explore-card"
            >
              <img src={cat.img} alt={cat.name} />
              <div className="explore-card-info">
                <h3>{cat.name}</h3>
                <span>{cat.sub}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="arrivals-section">
        <div className="arrivals-header">
          <div>
            <h2>Sản phẩm mới</h2>
            <p>Những tác phẩm vừa ra lò từ xưởng thủ công</p>
          </div>
          <button className="arrivals-view-all" onClick={handleViewProducts}>
            Xem tất cả →
          </button>
        </div>

        {loading ? (
          <div className="arrivals-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="arrival-skeleton">
                <div className="sk-img" />
                <div className="sk-line w80" />
                <div className="sk-line w50" />
                <div className="sk-line w40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="arrivals-grid">
            {bestSellingProducts.slice(0, 4).map((product) => {
              const isFav = isFavorite(product.id);
              return (
                <div key={product.id} className="arrival-card">
                  <div
                    className="arrival-img"
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/400x400?text=No+Image")
                      }
                    />
                    <button
                      className={`arrival-fav ${isFav ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(product.id);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={isFav ? icons.heart : icons.heartRegular}
                      />
                    </button>
                  </div>
                  <div className="arrival-info">
                    <span className="arrival-cat">{product.category}</span>
                    <h3
                      className="arrival-name"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.name}
                    </h3>
                    <div className="arrival-footer">
                      <span className="arrival-price">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        className="arrival-cart"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <FontAwesomeIcon icon={icons.cart} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── ABOUT / STORY ── */}
      <section className="story-section">
        <div
          className="story-img"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80')`,
          }}
        />
        <div className="story-content">
          <span className="story-eyebrow">Di Sản</span>
          <h2>Giữ gìn hồn của thủ công.</h2>
          <p>
            Chúng tôi tin rằng những vật dụng quanh mình nên có câu chuyện. Mỗi
            sản phẩm đều là sự cộng hưởng giữa thiên nhiên và đôi bàn tay người
            thợ.
          </p>
          <p>
            Sứ mệnh của chúng tôi là gìn giữ cộng đồng nghệ nhân truyền thống và
            bảo vệ môi trường đã tạo nên những chất liệu ấy.
          </p>
          <button className="story-btn" onClick={handleViewProducts}>
            Đọc câu chuyện của chúng tôi
          </button>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <h2>Gia nhập cộng đồng</h2>
        <p>Đón xem bộ sưu tập mới và gặp gỡ nghệ nhân sớm nhất.</p>
        <form
          className="newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Cảm ơn bạn đã đăng ký!");
          }}
        >
          <input
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            required
          />
          <button type="submit">Đăng ký</button>
        </form>
      </section>
    </div>
  );
};

export default HomePage;
