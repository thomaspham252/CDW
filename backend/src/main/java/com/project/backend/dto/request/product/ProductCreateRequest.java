package com.project.backend.dto.request.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCreateRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Pattern(
        regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        message = "Slug chỉ chứa chữ thường, số và dấu gạch ngang (-), không bắt đầu/kết thúc bằng dấu gạch ngang"
    )
    private String slug;

    private String description; // tuỳ chọn

    @NotNull(message = "categoryId không được để trống")
    private Integer categoryId;

    private Boolean isActive = true; // mặc định true (hiển thị) nếu không gửi

    @Valid // cascade validate sang VariantUpsertRequest
    private VariantUpsertRequest variant;
}
