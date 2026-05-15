package com.project.backend.service.product;

import com.project.backend.entity.product.ProductVariant;
import com.project.backend.exception.BadRequestException;
import com.project.backend.repository.product.ProductRepository;
import org.springframework.stereotype.Component;

/**
 * Tập trung toàn bộ rule validation nghiệp vụ cho Product.
 * Mỗi method ném {@link BadRequestException} ngay khi vi phạm rule –
 * không auto-correct, không bỏ qua (validation cứng).
 */
@Component
public class ProductValidator {

    // =========================================================================
    // Rule 1 – Slug phải duy nhất
    // =========================================================================

    /**
     * Dùng khi TẠO MỚI sản phẩm: slug tuyệt đối chưa tồn tại trong DB.
     */
    public void requireSlugUnique(String slug, ProductRepository productRepo) {
        if (productRepo.existsBySlug(slug)) {
            throw new BadRequestException("Slug '" + slug + "' đã tồn tại");
        }
    }

    /**
     * Dùng khi CẬP NHẬT sản phẩm: cho phép giữ nguyên slug hiện tại,
     * nhưng nếu đổi sang slug khác thì slug mới phải chưa được dùng.
     *
     * @param newSlug     slug mới client gửi lên
     * @param currentSlug slug hiện tại của sản phẩm trong DB
     */
    public void requireSlugUniqueForUpdate(String newSlug, String currentSlug,
                                           ProductRepository productRepo) {
        if (!newSlug.equals(currentSlug) && productRepo.existsBySlug(newSlug)) {
            throw new BadRequestException("Slug '" + newSlug + "' đã được dùng bởi sản phẩm khác");
        }
    }

    // =========================================================================
    // Rule 2 – price >= 0
    // =========================================================================

    /**
     * Giá bán không được âm.
     *
     * @param price giá bán (đơn vị: đồng)
     */
    public void requirePriceNonNegative(double price) {
        if (price < 0) {
            throw new BadRequestException("Giá bán (price) không được âm, nhận được: " + price);
        }
    }

    // =========================================================================
    // Rule 3 – basePrice >= price (nếu basePrice được cung cấp)
    // =========================================================================

    /**
     * Giá gốc (trước khuyến mãi) phải >= giá bán.
     * Rule chỉ áp dụng khi basePrice > 0 (0 nghĩa là không cung cấp).
     *
     * @param price     giá bán hiện tại
     * @param basePrice giá gốc (0 = bỏ qua)
     */
    public void requireBasePriceValid(double price, double basePrice) {
        if (basePrice > 0 && basePrice < price) {
            throw new BadRequestException(
                    String.format("Giá gốc (basePrice=%.2f) phải >= giá bán (price=%.2f)", basePrice, price));
        }
    }

    /**
     * Shortcut: kiểm tra cả price và basePrice cùng lúc.
     */
    public void validatePrices(double price, double basePrice) {
        requirePriceNonNegative(price);
        requireBasePriceValid(price, basePrice);
    }

    // =========================================================================
    // Rule 4 – Mỗi variant chỉ có tối đa 1 ảnh isMain = 1
    // =========================================================================

    /**
     * Đảm bảo variant chưa có ảnh chính trước khi thêm ảnh mới với isMain = true.
     * <p>
     * Gọi method này khi client muốn ADD ảnh mới với isMain = true.
     * Nếu đã tồn tại ảnh chính → throw exception (hard block).
     * Để THAY ảnh chính, dùng {@code setMainImage()} thay vì {@code addImage()}.
     *
     * @param variant variant cần kiểm tra (cần đã load images)
     */
    public void requireNoMainImageExists(ProductVariant variant) {
        if (variant.getImages() == null || variant.getImages().isEmpty()) {
            return; // chưa có ảnh nào → ok
        }
        boolean alreadyHasMain = variant.getImages().stream()
                .anyMatch(img -> Boolean.TRUE.equals(img.getIsMain()));
        if (alreadyHasMain) {
            throw new BadRequestException(
                    "Variant id=" + variant.getId() + " đã có ảnh chính (isMain=true). "
                    + "Để đổi ảnh chính, hãy dùng API setMainImage.");
        }
    }
}
