package com.project.backend.controller;

import com.project.backend.dto.request.product.ImageUpsertRequest;
import com.project.backend.dto.request.product.ProductCreateRequest;
import com.project.backend.dto.request.product.ProductUpdateRequest;
import com.project.backend.dto.request.product.VariantUpsertRequest;
import com.project.backend.dto.response.product.ImageResponse;
import com.project.backend.dto.response.product.ProductDetailResponse;
import com.project.backend.dto.response.product.ProductSummaryResponse;
import com.project.backend.dto.response.product.VariantResponse;
import com.project.backend.service.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService productService;

    // =========================================================================
    // Storefront – public endpoints
    // =========================================================================

    /**
     * GET /api/products
     * Danh sách sản phẩm đang active, phân trang.g
     * Mặc định: page=0, size=12, sort=id,desc
     */
    @GetMapping("/api/products")
    public ResponseEntity<Page<ProductSummaryResponse>> listActive(
            @PageableDefault(size = 12, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(productService.listActive(pageable));
    }

    /**
     * GET /api/products/{slug}
     * Chi tiết sản phẩm theo slug (SEO-friendly URL).
     */
    @GetMapping("/api/products/{slug}")
    public ResponseEntity<ProductDetailResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    // =========================================================================
    // Admin – quản lý sản phẩm
    // =========================================================================

    /**
     * GET /api/admin/products
     * Danh sách toàn bộ sản phẩm (kể cả inactive), phân trang.
     */
    @GetMapping("/api/admin/products")
    public ResponseEntity<Page<ProductSummaryResponse>> listAdmin(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(productService.listAdmin(pageable));
    }

    /**
     * GET /api/admin/products/{id}
     * Chi tiết sản phẩm theo id (dùng cho form chỉnh sửa).
     */
    @GetMapping("/api/admin/products/{id}")
    public ResponseEntity<ProductDetailResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    /**
     * POST /api/admin/products
     * Tạo sản phẩm mới (kèm variant đầu tiên).
     * Trả 201 Created.
     */
    @PostMapping("/api/admin/products")
    public ResponseEntity<ProductDetailResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest req) {
        return ResponseEntity.status(201).body(productService.createProduct(req));
    }

    /**
     * PUT /api/admin/products/{id}
     * Cập nhật thông tin cơ bản sản phẩm.
     */
    @PutMapping("/api/admin/products/{id}")
    public ResponseEntity<ProductDetailResponse> updateProduct(
            @PathVariable Integer id,
            @Valid @RequestBody ProductUpdateRequest req) {
        return ResponseEntity.ok(productService.updateProduct(id, req));
    }

    /**
     * PATCH /api/admin/products/{id}/active?value=true|false
     * Bật / tắt trạng thái hiển thị sản phẩm.
     */
    @PatchMapping("/api/admin/products/{id}/active")
    public ResponseEntity<Void> setActive(
            @PathVariable Integer id,
            @RequestParam Boolean value) {
        productService.setActive(id, value);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Admin – quản lý Variant
    // =========================================================================

    /**
     * POST /api/admin/products/{productId}/variants
     * Thêm biến thể mới vào sản phẩm.
     */
    @PostMapping("/api/admin/products/{productId}/variants")
    public ResponseEntity<VariantResponse> addVariant(
            @PathVariable Integer productId,
            @Valid @RequestBody VariantUpsertRequest req) {
        return ResponseEntity.status(201).body(productService.addVariant(productId, req));
    }

    /**
     * PUT /api/admin/variants/{variantId}
     * Cập nhật price, basePrice, size của biến thể.
     */
    @PutMapping("/api/admin/variants/{variantId}")
    public ResponseEntity<VariantResponse> updateVariant(
            @PathVariable Integer variantId,
            @Valid @RequestBody VariantUpsertRequest req) {
        return ResponseEntity.ok(productService.updateVariant(variantId, req));
    }

    /**
     * DELETE /api/admin/variants/{variantId}
     * Xóa biến thể (cascade tự xóa images).
     */
    @DeleteMapping("/api/admin/variants/{variantId}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Integer variantId) {
        productService.deleteVariant(variantId);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Admin – quản lý Image
    // =========================================================================

    /**
     * POST /api/admin/variants/{variantId}/images
     * Thêm ảnh vào biến thể.
     * Nếu isMain=true mà variant đã có ảnh chính → 400 Bad Request.
     */
    @PostMapping("/api/admin/variants/{variantId}/images")
    public ResponseEntity<ImageResponse> addImage(
            @PathVariable Integer variantId,
            @Valid @RequestBody ImageUpsertRequest req) {
        return ResponseEntity.status(201).body(productService.addImage(variantId, req));
    }

    /**
     * PATCH /api/admin/images/{imageId}/main
     * Đặt ảnh này làm ảnh chính của variant, reset ảnh cũ về isMain=false.
     */
    @PatchMapping("/api/admin/images/{imageId}/main")
    public ResponseEntity<ImageResponse> setMainImage(@PathVariable Integer imageId) {
        return ResponseEntity.ok(productService.setMainImage(imageId));
    }

    /**
     * DELETE /api/admin/images/{imageId}
     * Xóa ảnh theo id.
     */
    @DeleteMapping("/api/admin/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer imageId) {
        productService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
