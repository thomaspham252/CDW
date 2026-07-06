package com.project.backend.dto.response.coupon;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CouponResponse {
    private String code;
    private String description;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
}
