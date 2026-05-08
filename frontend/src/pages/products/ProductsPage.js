import React from 'react';
import { useProductsPage } from '../../hooks/useProductsPage';
import { formatPrice } from '../../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import Pagination from '../../components/Pagination';
import '../../styles/products/ProductsPage.css';

const ProductsPage = () => {
    const {
        loading,
        error,
        searchKeyword,
        setSearchKeyword,
        selectedCategory,
        sortBy,
        categories,
        filteredProducts,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        isSidebarOpen,
        setIsSidebarOpen,
        currentPage,
        totalPages,
        paginatedProducts,
        handlePageChange,
        handleClearFilters,
        handleSearch,
        handleCategoryChange,
        handleSortChange,
        handleAddToCart,
        handleToggleFavorite,
        handleProductClick,
        itemsPerPage,
        products,
        isFavorite
    } = useProductsPage();

    if (loading) {
        return (
            <div className="products-page">
                <div className="loading">Đang tải sản phẩm...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="products-page">
                <div className="error">Lỗi: {error}</div>
            </div>
        );
    }

    // Tính giá min/max từ products
    const priceRange = products.length > 0 ? {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price))
    } : { min: 0, max: 1000000 };

    return (
        <div className="products-page">
            {/* Header với search và sort */}
            <div className="products-top-bar">
                <div className="products-header">
                    <h1>Danh Sách Sản Phẩm Handmade</h1>
                    <p className="products-count">
                        {/* --- THÊM MỚI: Hiển thị từ khóa đang tìm kiếm --- */}
                        {searchKeyword && <span>Kết quả cho: "<strong>{searchKeyword}</strong>" - </span>}
                        {/* --------------------------------------------- */}
                        Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
                        {totalPages > 1 && ` - Trang ${currentPage}/${totalPages}`}
                    </p>
                </div>

                <div className="top-controls">
                    {/* Toggle Sidebar Button - Always visible */}
                    <button
                        className="toggle-sidebar-btn-top"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                    >
                        <FontAwesomeIcon icon={isSidebarOpen ? icons.chevronLeft : icons.filter} />
                        {isSidebarOpen ? 'Ẩn' : 'Hiện'}
                    </button>


                    {/* Price Filter Top */}
                    <div className="price-filter-top">
                        <input
                            type="number"
                            placeholder="Thấp nhất"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="price-input-top"
                            min="0"
                        />
                        <span className="separator">-</span>
                        <input
                            type="number"
                            placeholder="Cao nhất"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="price-input-top"
                            min="0"
                        />
                    </div>

                    {/* Sort */}
                    <div className="sort-control">
                        <label>
                            <FontAwesomeIcon icon={icons.filter} /> Sắp xếp:
                        </label>
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="sort-select"
                        >
                            <option value="default">Mặc định</option>
                            <option value="price-asc">Giá: Thấp → Cao</option>
                            <option value="price-desc">Giá: Cao → Thấp</option>
                            <option value="rating">Đánh giá cao nhất</option>
                            <option value="name">Tên A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="products-layout">
                {/* Sidebar Filters */}
                <aside className={`products-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <h2>
                            <FontAwesomeIcon icon={icons.filter} /> Bộ lọc
                        </h2>
                    </div>

                    <div className="sidebar-content">
                        {/* Categories */}
                        <div className="filter-section">
                            <h3>
                                <FontAwesomeIcon icon={icons.tag} /> Danh mục
                            </h3>
                            <div className="category-list">
                                <button
                                    className={`category-item ${!selectedCategory ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange('')}
                                >
                                    Tất cả
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => handleCategoryChange(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Clear Filters */}
                        {(selectedCategory || minPrice || maxPrice || searchKeyword) && (
                            <button className="clear-filters-btn" onClick={handleClearFilters}>
                                <FontAwesomeIcon icon={icons.times} /> Xóa tất cả bộ lọc
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="products-main">
                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <FontAwesomeIcon icon={icons.products} size="3x" />
                            <p>Không tìm thấy sản phẩm nào.</p>
                            {(selectedCategory || minPrice || maxPrice || searchKeyword) && (
                                <button className="clear-filters-btn" onClick={handleClearFilters}>
                                    <FontAwesomeIcon icon={icons.times} /> Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {paginatedProducts.map(product => {
                                    const productIsFavorite = isFavorite(product.id);
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
                                                    className={`favorite-btn ${productIsFavorite ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleFavorite(product.id);
                                                    }}
                                                    title={productIsFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                                                >
                                                    <FontAwesomeIcon icon={productIsFavorite ? icons.heart : icons.heartRegular} />
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

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    itemsPerPage={itemsPerPage}
                                    showPageInfo={true}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductsPage;