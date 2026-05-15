import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";

/**
 * ProductCard Component
 * Hiển thị thông tin tóm tắt sản phẩm trong danh sách
 *
 * Props:
 * - product: ProductSummaryResponse {
 *     id, name, slug, mainUrl, price, basePrice, isActive, categoryName
 *   }
 */
const ProductCard = ({ product }) => {
  const imageUrl = product.mainUrl || product.image || "";
  const category = product.categoryName || product.category || "";
  const basePrice = product.basePrice || product.originalPrice || null;
  const hasDiscount = basePrice && basePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - product.price) / basePrice) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product.slug || product.id}`}
      className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-20 h-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            -{discountPercent}%
          </div>
        )}

        {/* Inactive Badge (for admin) */}
        {product.isActive === false && (
          <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs">
            Ẩn
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {category && <p className="text-xs text-gray-500 mb-1">{category}</p>}

        {/* Product Name */}
        <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-red-600">
            {product.price ? formatPrice(product.price) : "Liên hệ"}
          </span>

          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(basePrice)}
            </span>
          )}
        </div>

        {/* "From" label if product has multiple variants */}
        {product.price && (
          <p className="text-xs text-gray-500 mt-1">
            Từ {formatPrice(product.price)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
