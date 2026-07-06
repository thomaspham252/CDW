package com.project.backend.controller;

import com.project.backend.dto.request.voucher.VoucherRequest;
import com.project.backend.dto.response.voucher.VoucherResponse;
import com.project.backend.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    /** Admin: lấy tất cả voucher */
    @GetMapping("/api/admin/vouchers")
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    /** Admin: tạo voucher mới */
    @PostMapping("/api/admin/vouchers")
    public ResponseEntity<VoucherResponse> createVoucher(@RequestBody VoucherRequest request) {
        return ResponseEntity.status(201).body(voucherService.createVoucher(request));
    }

    /** Admin: cập nhật voucher */
    @PutMapping("/api/admin/vouchers/{id}")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable Integer id,
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }

    /** Admin: xoá voucher */
    @DeleteMapping("/api/admin/vouchers/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Integer id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

    /** Public: kiểm tra & áp dụng mã voucher tại checkout */
    @PostMapping("/api/vouchers/apply")
    public ResponseEntity<VoucherResponse> applyVoucher(
            @RequestParam String code,
            @RequestParam BigDecimal orderTotal) {
        return ResponseEntity.ok(voucherService.applyVoucher(code, orderTotal));
    }
}
