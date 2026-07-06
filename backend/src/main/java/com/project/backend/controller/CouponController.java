package com.project.backend.controller;

import com.project.backend.dto.response.coupon.CouponResponse;
import com.project.backend.service.coupon.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "http://localhost:3000")
public class CouponController {
    private final CouponService couponService;

    @GetMapping("/available")
    public ResponseEntity<List<CouponResponse>> getAvailableCoupons(
            @RequestParam(defaultValue = "0") BigDecimal subtotal) {
        return ResponseEntity.ok(couponService.getAvailableCoupons(subtotal));
    }
}
