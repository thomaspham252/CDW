package com.project.backend.dto.response.order;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemResponse {
    private Integer id;
    private Integer variantId;
    private String productName;
    private String productSlug;
    private String size;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal price;
}
