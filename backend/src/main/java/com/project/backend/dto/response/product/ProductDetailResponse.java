package com.project.backend.dto.response.product;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class ProductDetailResponse {
    private Integer id;
    private String name;
    private String slug;
    private String description;
    private Integer categoryId;
    private String categoryName;
    private Boolean isActive;
    private List<VariantResponse> variants;
}
