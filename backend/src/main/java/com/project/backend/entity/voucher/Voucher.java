package com.project.backend.entity.voucher;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Mã voucher (unique, uppercase) */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    /** Mô tả ngắn */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Loại giảm giá: PERCENT hoặc FIXED */
    @Column(name = "discount_type", nullable = false, length = 10)
    @Builder.Default
    private String discountType = "PERCENT"; // PERCENT | FIXED

    /** Giá trị giảm: % hoặc số tiền cố định */
    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    /** Đơn hàng tối thiểu để áp dụng (0 = không giới hạn) */
    @Column(name = "min_order_value")
    @Builder.Default
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    /** Giảm tối đa (chỉ áp dụng cho PERCENT, 0 = không giới hạn) */
    @Column(name = "max_discount_amount")
    @Builder.Default
    private BigDecimal maxDiscountAmount = BigDecimal.ZERO;

    /** Số lượt dùng tối đa (0 = không giới hạn) */
    @Column(name = "usage_limit")
    @Builder.Default
    private Integer usageLimit = 0;

    /** Số lượt đã dùng */
    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    /** Trạng thái hoạt động */
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    /** Ngày hết hạn (null = không giới hạn) */
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
