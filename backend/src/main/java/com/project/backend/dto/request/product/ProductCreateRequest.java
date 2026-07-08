package com.project.backend.dto.request.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductCreateRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 3, max = 255, message = "Tên sản phẩm phải từ 3-255 ký tự")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Pattern(
        regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        message = "Slug chỉ chứa chữ thường, số và dấu gạch ngang (-), không bắt đầu/kết thúc bằng dấu gạch ngang"
    )
    @Size(min = 3, max = 255, message = "Slug phải từ 3-255 ký tự")
    private String slug;

    @Size(max = 5000, message = "Mô tả không được quá 5000 ký tự")
    private String description; // tuỳ chọn

    @NotNull(message = "categoryId không được để trống")
    private Integer categoryId;

    private Boolean isActive = true; // mặc định true (hiển thị) nếu không gửi

    @Valid // cascade validate sang VariantUpsertRequest
    @NotNull(message = "Phải có ít nhất 1 biến thể sản phẩm")
    @Size(min = 1, message = "Phải có ít nhất 1 biến thể sản phẩm")
    private List<VariantUpsertRequest> variants;
}
