package com.project.backend.dto.response.voucher;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {
    private Integer id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isActive;
    private LocalDateTime expiredAt;
    private LocalDateTime createdAt;
    /** Trạng thái tổng hợp: ACTIVE, EXPIRED, USED_UP, INACTIVE */
    private String status;
}
