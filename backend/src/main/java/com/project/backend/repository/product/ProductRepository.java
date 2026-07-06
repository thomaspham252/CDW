package com.project.backend.repository.product;

import com.project.backend.entity.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    @EntityGraph(attributePaths = {"variants", "variants.images", "category"})
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    @EntityGraph(attributePaths = {"variants", "variants.images", "category"})
    Page<Product> findAllByIsActive(Boolean isActive, Pageable pageable);

    @EntityGraph(attributePaths = {"variants", "variants.images", "category"})
    Page<Product> findAllByIsActiveAndCategoryId(Boolean isActive, Integer categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"variants", "variants.images", "category"})
    @Query("""
            select p from Product p
            where p.isActive = true
              and (
                lower(p.name) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(p.description, '')) like lower(concat('%', :keyword, '%'))
            )
            """)
    Page<Product> searchActiveByKeyword(
            @Param("keyword") String keyword,
            Pageable pageable);

    @EntityGraph(attributePaths = {"variants", "variants.images", "category"})
    @Query("""
            select p from Product p
            where p.isActive = true
              and p.category.id = :categoryId
              and (
                lower(p.name) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(p.description, '')) like lower(concat('%', :keyword, '%'))
            )
            """)
    Page<Product> searchActiveByCategoryAndKeyword(
            @Param("categoryId") Integer categoryId,
            @Param("keyword") String keyword,
            Pageable pageable);

    @EntityGraph(attributePaths = {"variants", "variants.images", "category"})
    Page<Product> findAll(Pageable pageable);

        @Query("select distinct p from Product p " +
            "left join fetch p.category " +
            "left join fetch p.variants v " +
            "left join fetch v.images " +
            "where p.slug = :slug")
        Optional<Product> findBySlugWithVariants(@Param("slug") String slug);

        @Query("select distinct p from Product p " +
            "left join fetch p.category " +
            "left join fetch p.variants v " +
            "left join fetch v.images " +
            "where p.id = :id")
        Optional<Product> findByIdWithVariants(@Param("id") Integer id);

        @Query("select distinct p from Product p " +
            "left join fetch p.category " +
            "left join fetch p.variants v " +
            "left join fetch v.images " +
            "where p.id in :ids")
        List<Product> findAllByIdInWithVariants(@Param("ids") List<Integer> ids);
}
