package com.project.backend.dto.request.product;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImageUpsertRequest {

    @NotBlank(message = "URL ảnh không được để trống")
    private String image;

    private Boolean isMain = false; // true = ảnh chính, false = ảnh phụ (mặc định false)
}
