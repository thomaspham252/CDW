package com.project.backend.repository.product;

import com.project.backend.entity.product.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    /** Lấy tất cả ảnh của một variant. */
    List<ProductImage> findAllByProductVariantId(int variantId);

    /** Tìm ảnh chính (isMain = 1) của một variant – dùng để kiểm tra nhanh. */
    Optional<ProductImage> findByProductVariantIdAndIsMain(int variantId, int isMain);
}

