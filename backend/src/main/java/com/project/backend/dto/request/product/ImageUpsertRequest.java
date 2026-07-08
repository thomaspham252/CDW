package com.project.backend.dto.request.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImageUpsertRequest {

    @NotBlank(message = "URL ảnh không được để trống")
    @Pattern(
        regexp = "^https?://.*\\.(jpg|jpeg|png|gif|webp|svg)(\\?.*)?$",
        flags = Pattern.Flag.CASE_INSENSITIVE,
        message = "URL ảnh phải là định dạng hợp lệ (jpg, jpeg, png, gif, webp, svg)"
    )
    private String image;

    private Boolean isMain = false; // true = ảnh chính, false = ảnh phụ (mặc định false)
}
