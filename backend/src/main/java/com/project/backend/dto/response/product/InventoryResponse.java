package com.project.backend.dto.response.product;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private Integer variantId;
    private Integer productId;
    private String productName;
    private String productSlug;
    private String size;
    private String color;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String categoryName;
}
