package com.project.backend.dto.request.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariantUpsertRequest {

    @NotNull(message = "Giá bán không được để trống")
    @PositiveOrZero(message = "Giá bán (price) không được âm")
    private Double price;

    @PositiveOrZero(message = "Giá gốc (basePrice) không được âm")
    private Double basePrice; // 0 = không cung cấp; nếu > 0 thì phải >= price (check trong ProductValidator)

    private String size; // tuỳ chọn (ví dụ: "M/30x20cm")

    private String color; // tuỳ chọn (ví dụ: "Đỏ", "Nâu")

    @Min(value = 0, message = "Tồn kho không được âm")
    private Integer stock;

    @Valid // cascade validate sang ImageUpsertRequest
    private ImageUpsertRequest image;
}
