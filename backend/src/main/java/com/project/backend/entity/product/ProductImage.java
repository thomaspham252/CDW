package com.project.backend.entity.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "product_images")
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    ProductVariant productVariant;

    @Column(name = "img_url",nullable = false)
    private String imgUrl;

    @Builder.Default
    @Column(name = "is_main")
    private Boolean isMain = false;

}
