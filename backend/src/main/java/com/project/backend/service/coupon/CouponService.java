package com.project.backend.service.coupon;

import com.project.backend.dto.response.coupon.CouponResponse;
import com.project.backend.entity.coupon.Coupon;
import com.project.backend.repository.coupon.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;

    public List<CouponResponse> getAvailableCoupons(BigDecimal subtotal) {
        BigDecimal safeSubtotal = subtotal == null ? BigDecimal.ZERO : subtotal;
        return couponRepository.findAll().stream()
                .filter(coupon -> isUsable(coupon, safeSubtotal))
                .map(this::toResponse)
                .toList();
    }

    public BigDecimal calculateDiscount(String code, BigDecimal subtotal) {
        if (code == null || code.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal safeSubtotal = subtotal == null ? BigDecimal.ZERO : subtotal;
        return couponRepository.findByCodeIgnoreCase(code.trim())
                .filter(coupon -> isUsable(coupon, safeSubtotal))
                .map(Coupon::getDiscountValue)
                .map(discount -> discount.min(safeSubtotal))
                .orElse(BigDecimal.ZERO);
    }

    private boolean isUsable(Coupon coupon, BigDecimal subtotal) {
        LocalDateTime now = LocalDateTime.now();
        BigDecimal minOrderValue = coupon.getMinOrderValue() == null ? BigDecimal.ZERO : coupon.getMinOrderValue();
        Integer usedCount = coupon.getUsedCount() == null ? 0 : coupon.getUsedCount();

        return Boolean.TRUE.equals(coupon.getIsActive())
                && subtotal.compareTo(minOrderValue) >= 0
                && (coupon.getValidFrom() == null || !now.isBefore(coupon.getValidFrom()))
                && (coupon.getValidUntil() == null || !now.isAfter(coupon.getValidUntil()))
                && (coupon.getUsageLimit() == null || usedCount < coupon.getUsageLimit());
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .build();
    }
}
