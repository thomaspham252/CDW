package com.project.backend.service.product;

import com.project.backend.dto.request.product.ImageUpsertRequest;
import com.project.backend.dto.request.product.ProductCreateRequest;
import com.project.backend.dto.request.product.ProductUpdateRequest;
import com.project.backend.dto.request.product.VariantUpsertRequest;
import com.project.backend.dto.response.product.ImageResponse;
import com.project.backend.dto.response.product.ProductDetailResponse;
import com.project.backend.dto.response.product.ProductSummaryResponse;
import com.project.backend.dto.response.product.VariantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    // ── Product CRUD ─────────────────────────────────────────────────────────

    /** Tạo sản phẩm mới (kèm ít nhất 1 variant trong req). */
    ProductDetailResponse createProduct(ProductCreateRequest req);

    /** Cập nhật thông tin cơ bản của sản phẩm (name, slug, description, category, isActive). */
    ProductDetailResponse updateProduct(Integer id, ProductUpdateRequest req);

    /** Bật/tắt trạng thái hiển thị của sản phẩm (isActive = true | false). */
    void setActive(Integer id, Boolean isActive);

    /** Lấy chi tiết sản phẩm theo id (dùng cho admin). */
    ProductDetailResponse getById(Integer id);

    /** Lấy chi tiết sản phẩm theo slug (dùng cho khách hàng). */
    ProductDetailResponse getBySlug(String slug);

    /** Danh sách sản phẩm đang active, phân trang (dùng cho storefront). */
    Page<ProductSummaryResponse> listActive(Pageable pageable);

    /** Danh sách toàn bộ sản phẩm, phân trang (dùng cho admin). */
    Page<ProductSummaryResponse> listAdmin(Pageable pageable);

    // ── Variant operations ───────────────────────────────────────────────────

    /** Thêm biến thể mới vào sản phẩm. */
    VariantResponse addVariant(Integer productId, VariantUpsertRequest req);

    /** Cập nhật thông tin biến thể (price, basePrice, size). */
    VariantResponse updateVariant(Integer variantId, VariantUpsertRequest req);

    /** Xóa biến thể theo id. */
    void deleteVariant(Integer variantId);

    // ── Image operations ─────────────────────────────────────────────────────

    /** Thêm ảnh vào biến thể. */
    ImageResponse addImage(Integer variantId, ImageUpsertRequest req);

    /** Đặt ảnh này làm ảnh chính của variant (is_main = true), reset ảnh khác về false. */
    ImageResponse setMainImage(Integer imageId);

    /** Xóa ảnh theo id. */
    void deleteImage(Integer imageId);
}
