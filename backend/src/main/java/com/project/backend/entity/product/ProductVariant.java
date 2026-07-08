package com.project.backend.entity.product;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"images", "product"})
@Table(name = "product_variants")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "base_price")
    private BigDecimal basePrice;

    private String size;

    @Column(name = "color")
    private String color;

    // Danh sách ảnh thuộc biến thể này (is_main = true là ảnh chính)
    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ProductImage> images;

    @Column(name = "stock")
    private Integer stock;

}
