package com.project.backend.dto.request.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariantUpsertRequest {

    @PositiveOrZero(message = "Giá bán (price) không được âm")
    private double price;

    @PositiveOrZero(message = "Giá gốc (basePrice) không được âm")
    private double basePrice; // 0 = không cung cấp; nếu > 0 thì phải >= price (check trong ProductValidator)

    private String size; // tuỳ chọn (ví dụ: "250ml", "500g")

    private String color; // tuỳ chọn (ví dụ: "Đỏ", "Nâu")

    private Integer stock = 50; // mặc định 50 nếu không điền khi tạo mới

    @Valid // cascade validate sang ImageUpsertRequest
    private ImageUpsertRequest image;
}
