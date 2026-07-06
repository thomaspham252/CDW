package com.project.backend.dto.response.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Builder
@Setter
@Getter
public class ProductSummaryResponse {
    private Integer id;
    private String name;
    private String slug;
    private Integer variantId;
    private String mainUrl;
    private BigDecimal price;
    private BigDecimal basePrice;
    private Boolean isActive;
    private Integer categoryId;
    private String categoryName;
}
