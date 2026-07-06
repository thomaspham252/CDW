package com.project.backend.dto.request.voucher;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class VoucherRequest {
    private String code;
    private String description;
    private String discountType; // PERCENT | FIXED
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Boolean isActive;
    private LocalDateTime expiredAt;
}
