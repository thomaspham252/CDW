import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductDetailPage } from "../../hooks/useProductDetailPage";
import { formatPrice } from "../../utils/formatPrice";
import { getPriceByType } from "../../utils/productPrice";
import { FontAwesomeIcon, icons } from "../../utils/icons";
import "../../styles/products/ProductDetailPage.css";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    product,
    loading,
    error,
    isFavorite,
    activeImage,
    setActiveImage,
    adding,
    selectedColor,
    setSelectedColor,
    selectedType,
    setSelectedType,
    quantity,
    relatedProducts,
    relatedLoading,
    handleQuantityChange,
    handleQuantityInput,
    isTypeDropdownOpen,
    setIsTypeDropdownOpen,
    activeTab,
    setActiveTab,
    isDescExpanded,
    setIsDescExpanded,
    reviews,
    reviewsLoading,
    hasPurchased,
    canReview,
    hasReviewed,
    getUserReview,
    showReviewForm,
    setShowReviewForm,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewMedia,
    setReviewMedia,
    submittingReview,
    reviewError,
    setReviewError,
    editingReviewId,
    setEditingReviewId,
    handleAddToCart,
    handleToggleFavorite,
    handleFileChange,
    removeMedia,
    handleSubmitReview,
    handleEditReview,
    handleDeleteReview,
    stockBadge,
    getColorHex,
    user,
  } = useProductDetailPage(slug, navigate);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error">{error || "Không tìm thấy sản phẩm"}</div>
        <button className="btn-back" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  const basePrice = product.basePrice || product.originalPrice || null;
  const hasDiscount = basePrice && basePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - product.price) / basePrice) * 100)
    : 0;

  const handleBuyNow = async () => {
    if (product.stock === 0 || adding) return;
    await handleAddToCart();
    navigate("/cart");
  };

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <FontAwesomeIcon icon={icons.chevronLeft} />
        <span>Quay lại</span>
      </button>

      <div className="detail-card">
        <div className="detail-left">
          <div className="gallery">
            <div className="main-image">
              {product.stock === 0 && <div className="badge out">Hết hàng</div>}
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x400?text=No+Image";
                  }}
                />
              ) : (
                <div className="no-image-placeholder">Không có hình ảnh</div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="thumbs">
                {[product.image, ...(product.images || [])]
                  .filter(Boolean)
                  .filter((url, idx, arr) => arr.indexOf(url) === idx)
                  .map((url) => (
                    <button
                      key={url}
                      className={`thumb ${url === activeImage ? "active" : ""}`}
                      onClick={() => setActiveImage(url)}
                    >
                      <img
                        src={url}
                        alt="thumb"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="detail-right">
          <div className="breadcrumbs">
            <span className="crumb">{product.category}</span>
            <span className="crumb-sep">/</span>
            <span className="crumb current">{product.name}</span>
          </div>

          <div className="title-row">
            <h1>{product.name}</h1>
            <button
              className={`favorite-toggle ${isFavorite ? "active" : ""}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
            >
              <FontAwesomeIcon
                icon={isFavorite ? icons.heart : icons.heartRegular}
              />
            </button>
          </div>

          <div className="rating-row">
            <span className="stars">
              {"★".repeat(Math.floor(product.rating || 0))}
              {"☆".repeat(5 - Math.floor(product.rating || 0))}
            </span>
            <span className="rating-value">{product.rating || 0}</span>
            <span className="reviews-count">({reviews.length} đánh giá)</span>
          </div>

          <div className="price-row">
            <span className="price-current">
              {formatPrice(
                getPriceByType(product.price, selectedType, product.types),
              )}
            </span>
            {hasDiscount && (
              <span className="price-old">{formatPrice(basePrice)}</span>
            )}
            {hasDiscount && (
              <span className="price-discount">-{discountPercent}%</span>
            )}
          </div>

          <div className="section-divider" />

          <div className="options-box">
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="selection-group">
                <label className="selection-label">
                  <span>Màu sắc:</span>
                  {selectedColor && (
                    <span className="selected-value">{selectedColor}</span>
                  )}
                </label>
                <div className="color-options">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? "active" : ""} ${getColorHex(color) === "#ffffff" ? "white-color" : ""}`}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        backgroundColor: getColorHex(color),
                        borderColor:
                          selectedColor === color
                            ? "#667eea"
                            : getColorHex(color) === "#ffffff"
                              ? "#ccc"
                              : "#ddd",
                      }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <FontAwesomeIcon
                          icon={icons.check}
                          style={{
                            color:
                              getColorHex(color) === "#ffffff"
                                ? "#333"
                                : "#fff",
                            fontSize: "0.85rem",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type Selection - Dropdown */}
            {product.types && product.types.length > 0 && (
              <div className="selection-group">
                <label className="selection-label">
                  <span>Loại sản phẩm:</span>
                </label>
                <div className="custom-dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    type="button"
                  >
                    <span>{selectedType || "Chọn loại sản phẩm"}</span>
                    <FontAwesomeIcon
                      icon={icons.chevronDown}
                      className={`dropdown-arrow ${isTypeDropdownOpen ? "open" : ""}`}
                    />
                  </button>
                  {isTypeDropdownOpen && (
                    <div className="dropdown-menu">
                      {product.types.map((type) => (
                        <div
                          key={type}
                          className={`dropdown-item ${selectedType === type ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedType(type);
                            setIsTypeDropdownOpen(false);
                          }}
                        >
                          {type}
                          {selectedType === type && (
                            <FontAwesomeIcon
                              icon={icons.check}
                              className="check-icon"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="selection-group">
              <label className="selection-label">
                <span>Số lượng:</span>
              </label>
              <div className="quantity-row">
                <div className="quantity-selector">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    type="button"
                  >
                    <FontAwesomeIcon icon={icons.minus} />
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={quantity}
                    onChange={handleQuantityInput}
                    min="1"
                    max={product.stock}
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    type="button"
                  >
                    <FontAwesomeIcon icon={icons.plus} />
                  </button>
                </div>
                <span
                  className={`stock-chip ${product.stock === 0 ? "out" : ""}`}
                >
                  {stockBadge}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="actions">
              <button
                className="btn-primary"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
              >
                <FontAwesomeIcon icon={icons.cart} />
                {product.stock === 0
                  ? "Hết hàng"
                  : adding
                    ? "Đang thêm..."
                    : "Thêm vào giỏ hàng"}
              </button>
              <button
                className="btn-secondary"
                onClick={handleBuyNow}
                disabled={product.stock === 0 || adding}
              >
                Mua ngay
              </button>
            </div>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <FontAwesomeIcon className="feature-icon" icon={icons.check} />
              Handmade thủ công
            </div>
            <div className="feature-item">
              <FontAwesomeIcon className="feature-icon" icon={icons.check} />
              Chất liệu canvas chống thấm
            </div>
            <div className="feature-item">
              <FontAwesomeIcon className="feature-icon" icon={icons.truck} />
              Miễn phí ship từ 500k
            </div>
            <div className="feature-item">
              <FontAwesomeIcon className="feature-icon" icon={icons.undo} />
              Đổi trả trong 7 ngày
            </div>
            <div className="feature-item">
              <FontAwesomeIcon className="feature-icon" icon={icons.shield} />
              Bảo hành khóa kéo 6 tháng
            </div>
          </div>
        </div>
      </div>

      <section className="related-section">
        <div className="related-header">
          <h2>Sản phẩm liên quan</h2>
          <button
            className="related-view-all"
            type="button"
            onClick={() => navigate("/products")}
          >
            Xem tất cả
          </button>
        </div>
        {relatedLoading ? (
          <div className="loading">Đang tải sản phẩm liên quan...</div>
        ) : relatedProducts.length === 0 ? (
          <div className="empty-related">Chưa có sản phẩm liên quan.</div>
        ) : (
          <div className="related-grid">
            {relatedProducts.map((item) => (
              <button
                key={item.id}
                className="related-card"
                type="button"
                onClick={() => navigate(`/products/${item.slug || item.id}`)}
              >
                <div className="related-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="related-info">
                  <div className="related-name">{item.name}</div>
                  <div className="related-price">{formatPrice(item.price)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Tab Navigation */}
      <div className="product-tabs">
        <button
          className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
          onClick={() => setActiveTab("description")}
        >
          Mô tả sản phẩm
        </button>
        <button
          className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Đánh giá ({reviews.length})
        </button>
      </div>

      <div className="tab-content-container">
        {activeTab === "description" && (
          <section className="description-section">
            <div className="description-header">
              <h3>Mô tả chi tiết</h3> {/* Changed title for better context */}
              {product.description && product.description.length > 220 && (
                <button
                  className="toggle-desc-btn"
                  onClick={() => setIsDescExpanded((prev) => !prev)}
                >
                  {isDescExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
            <div
              className={`description ${isDescExpanded ? "expanded" : "clamped"}`}
            >
              {product.description}
            </div>
            {!isDescExpanded &&
              product.description &&
              product.description.length > 220 && (
                <div className="fade-overlay" aria-hidden="true" />
              )}
          </section>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            {/* Content moved to conditional render */}
            <h2>Đánh giá sản phẩm</h2>

            {/* Form đánh giá - chỉ hiển thị khi user đã mua */}
            {hasPurchased && user && !showReviewForm && !hasReviewed && (
              <div className="review-prompt">
                <p>Bạn đã mua sản phẩm này. Hãy chia sẻ đánh giá của bạn!</p>
                <button
                  className="btn-review"
                  onClick={() => {
                    setEditingReviewId(null);
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewMedia([]);
                    setShowReviewForm(true);
                  }}
                >
                  Viết đánh giá
                </button>
              </div>
            )}

            {/* Hiển thị nút chỉnh sửa nếu đã có review */}
            {hasPurchased &&
              user &&
              hasReviewed &&
              getUserReview &&
              !showReviewForm && (
                <div className="review-prompt">
                  <p>
                    Bạn đã đánh giá sản phẩm này. Bạn có thể chỉnh sửa hoặc xóa
                    đánh giá của mình.
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn-review"
                      onClick={() => handleEditReview(getUserReview)}
                    >
                      Chỉnh sửa đánh giá
                    </button>
                    <button
                      className="btn-review"
                      style={{ background: "#dc3545" }}
                      onClick={() => handleDeleteReview(getUserReview.id)}
                    >
                      Xóa đánh giá
                    </button>
                  </div>
                </div>
              )}

            {(canReview || (hasReviewed && editingReviewId)) &&
              showReviewForm && (
                <form className="review-form" onSubmit={handleSubmitReview}>
                  <div className="review-form-header">
                    <h3>
                      {editingReviewId
                        ? "Chỉnh sửa đánh giá"
                        : "Viết đánh giá của bạn"}
                    </h3>
                    <button
                      type="button"
                      className="review-form-close"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewError("");
                        setEditingReviewId(null);
                        setReviewRating(5);
                        setReviewMedia([]);
                        setReviewComment("");
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Đánh giá của bạn:</label>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-option ${star <= reviewRating ? "active" : ""}`}
                          onClick={() => setReviewRating(star)}
                        >
                          ★
                        </button>
                      ))}
                      <span className="rating-text-hint">
                        {reviewRating === 1
                          ? "Tệ"
                          : reviewRating === 2
                            ? "Không hài lòng"
                            : reviewRating === 3
                              ? "Bình thường"
                              : reviewRating === 4
                                ? "Hài lòng"
                                : "Tuyệt vời"}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-comment">Bình luận:</label>
                    <textarea
                      id="review-comment"
                      className="review-textarea"
                      value={reviewComment}
                      onChange={(e) => {
                        setReviewComment(e.target.value);
                        setReviewError("");
                      }}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      rows="4"
                      required
                      minLength="5"
                    />
                    <div className="char-count">
                      {reviewComment.length}/5 ký tự (tối thiểu)
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Thêm ảnh/video (Tối đa 5):</label>
                    <div className="media-upload-area">
                      <label className="upload-btn">
                        <FontAwesomeIcon icon={icons.camera} /> Thêm ảnh/video
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileChange}
                          hidden
                          disabled={reviewMedia.length >= 5}
                        />
                      </label>
                      <div className="media-previews">
                        {reviewMedia.map((media, idx) => (
                          <div key={idx} className="media-preview-item">
                            {media.type === "video" ? (
                              <video src={media.url} />
                            ) : (
                              <img src={media.url} alt="preview" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="remove-media-btn"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {reviewError && (
                    <div className="review-error">{reviewError}</div>
                  )}

                  <div className="review-form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewComment("");
                        setReviewMedia([]);
                        setReviewError("");
                        setEditingReviewId(null);
                        setReviewRating(5);
                      }}
                      disabled={submittingReview}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-submit-review"
                      disabled={submittingReview}
                    >
                      {submittingReview
                        ? "Đang gửi..."
                        : editingReviewId
                          ? "Cập nhật đánh giá"
                          : "Gửi đánh giá"}
                    </button>
                  </div>
                </form>
              )}

            {!user && (
              <div className="review-prompt">
                <p>Đăng nhập và mua sản phẩm để có thể đánh giá.</p>
              </div>
            )}

            {user && !canReview && !hasReviewed && (
              <div className="review-prompt">
                <p>Bạn cần mua sản phẩm trước khi có thể đánh giá.</p>
              </div>
            )}

            {/* Danh sách reviews */}
            {reviewsLoading ? (
              <p className="muted">Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p className="muted">Chưa có đánh giá nào.</p>
            ) : (
              <div className="reviews">
                {reviews.map((r) => {
                  const isOwnReview =
                    user && String(r.userId) === String(user.id);
                  return (
                    <div
                      key={r.id}
                      className={`review-card ${isOwnReview ? "own-review" : ""}`}
                    >
                      <div className="review-header">
                        <div className="reviewer">
                          {r.userName || "Khách hàng"}
                          {isOwnReview && (
                            <span className="review-badge">(Bạn)</span>
                          )}
                        </div>
                        <div className="review-rating">
                          {"★".repeat(r.rating)}
                          {"☆".repeat(5 - r.rating)}
                        </div>
                      </div>
                      <p className="review-comment">{r.comment}</p>

                      {r.media && r.media.length > 0 && (
                        <div className="review-media-gallery">
                          {r.media.map((m, i) => (
                            <div key={i} className="review-media-item">
                              {m.type === "video" ? (
                                <video src={m.url} controls />
                              ) : (
                                <img
                                  src={m.url}
                                  alt="review media"
                                  onClick={() => window.open(m.url, "_blank")}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="review-footer">
                        <div className="review-date">
                          {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
