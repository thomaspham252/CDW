package com.project.backend.service.voucher;

import com.project.backend.dto.request.voucher.VoucherRequest;
import com.project.backend.dto.response.voucher.VoucherResponse;

import java.util.List;

public interface VoucherService {
    List<VoucherResponse> getAllVouchers();
    VoucherResponse getVoucherById(Integer id);
    VoucherResponse createVoucher(VoucherRequest request);
    VoucherResponse updateVoucher(Integer id, VoucherRequest request);
    void deleteVoucher(Integer id);
    VoucherResponse applyVoucher(String code, java.math.BigDecimal orderTotal);
}
