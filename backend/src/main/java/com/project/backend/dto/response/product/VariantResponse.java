package com.project.backend.dto.response.product;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Setter
@Getter
public class VariantResponse {
    private Integer id;
    private BigDecimal price;
    private BigDecimal basePrice;
    private String size;
    private List<ImageResponse> images;
}
