package com.project.backend.repository.product;

import com.project.backend.entity.product.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    Optional <ProductVariant> findByProductId(Integer productId);

}
