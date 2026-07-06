package com.project.backend.controller;

import com.project.backend.dto.request.shipping.ShippingFeeRequest;
import com.project.backend.dto.response.shipping.AddressOptionResponse;
import com.project.backend.dto.response.shipping.ShippingFeeResponse;
import com.project.backend.service.shipping.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shipping")
@CrossOrigin(origins = "http://localhost:3000")
public class ShippingController {
    private final ShippingService shippingService;

    @GetMapping("/provinces")
    public ResponseEntity<List<AddressOptionResponse>> getProvinces() {
        return ResponseEntity.ok(shippingService.getProvinces());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<AddressOptionResponse>> getDistricts(@RequestParam Integer provinceId) {
        return ResponseEntity.ok(shippingService.getDistricts(provinceId));
    }

    @GetMapping("/wards")
    public ResponseEntity<List<AddressOptionResponse>> getWards(@RequestParam Integer districtId) {
        return ResponseEntity.ok(shippingService.getWards(districtId));
    }

    @PostMapping("/fee")
    public ResponseEntity<ShippingFeeResponse> calculateFee(@RequestBody ShippingFeeRequest request) {
        BigDecimal insuranceValue = request.getInsuranceValue() == null ? BigDecimal.ZERO : request.getInsuranceValue();
        return ResponseEntity.ok(shippingService.calculateFee(
                request.getToDistrictId(),
                request.getToWardCode(),
                insuranceValue
        ));
    }
}
