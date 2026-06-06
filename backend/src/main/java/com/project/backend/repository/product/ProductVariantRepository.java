package com.project.backend.repository.product;

import com.project.backend.entity.product.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    Optional <ProductVariant> findByProductId(Integer productId);

    @Query("select distinct v from ProductVariant v left join fetch v.images where v.product.id = :productId")
    List<ProductVariant> findAllByProductIdWithImages(@Param("productId") Integer productId);

}
