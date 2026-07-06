package com.project.backend.service.voucher;

import com.project.backend.dto.request.voucher.VoucherRequest;
import com.project.backend.dto.response.voucher.VoucherResponse;
import com.project.backend.entity.voucher.Voucher;
import com.project.backend.exception.BadRequestException;
import com.project.backend.exception.NotFoundException;
import com.project.backend.repository.voucher.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Integer id) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher không tồn tại: " + id));
        return toResponse(v);
    }

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCode(code)) {
            throw new BadRequestException("Mã voucher '" + code + "' đã tồn tại.");
        }
        Voucher v = Voucher.builder()
                .code(code)
                .description(request.getDescription())
                .discountType(request.getDiscountType() != null ? request.getDiscountType() : "PERCENT")
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount() != null ? request.getMaxDiscountAmount() : BigDecimal.ZERO)
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 0)
                .usedCount(0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .expiredAt(request.getExpiredAt())
                .build();
        return toResponse(voucherRepository.save(v));
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Integer id, VoucherRequest request) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher không tồn tại: " + id));

        String code = request.getCode().trim().toUpperCase();
        // Check code uniqueness only if changed
        if (!code.equals(v.getCode()) && voucherRepository.existsByCode(code)) {
            throw new BadRequestException("Mã voucher '" + code + "' đã tồn tại.");
        }
        v.setCode(code);
        v.setDescription(request.getDescription());
        if (request.getDiscountType() != null) v.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) v.setDiscountValue(request.getDiscountValue());
        if (request.getMinOrderValue() != null) v.setMinOrderValue(request.getMinOrderValue());
        if (request.getMaxDiscountAmount() != null) v.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null) v.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) v.setIsActive(request.getIsActive());
        v.setExpiredAt(request.getExpiredAt());

        return toResponse(voucherRepository.save(v));
    }

    @Override
    @Transactional
    public void deleteVoucher(Integer id) {
        if (!voucherRepository.existsById(id)) {
            throw new NotFoundException("Voucher không tồn tại: " + id);
        }
        voucherRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse applyVoucher(String code, BigDecimal orderTotal) {
        Voucher v = voucherRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new BadRequestException("Mã voucher không hợp lệ."));

        if (!Boolean.TRUE.equals(v.getIsActive())) {
            throw new BadRequestException("Voucher đã bị vô hiệu hoá.");
        }
        if (v.getExpiredAt() != null && v.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Voucher đã hết hạn.");
        }
        if (v.getUsageLimit() > 0 && v.getUsedCount() >= v.getUsageLimit()) {
            throw new BadRequestException("Voucher đã hết lượt sử dụng.");
        }
        if (orderTotal.compareTo(v.getMinOrderValue()) < 0) {
            throw new BadRequestException(
                    "Đơn hàng tối thiểu " + v.getMinOrderValue() + "đ để áp dụng voucher này.");
        }
        return toResponse(v);
    }

    /** Chuyển entity → response, tính status tổng hợp */
    private VoucherResponse toResponse(Voucher v) {
        String status = computeStatus(v);
        return VoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .description(v.getDescription())
                .discountType(v.getDiscountType())
                .discountValue(v.getDiscountValue())
                .minOrderValue(v.getMinOrderValue())
                .maxDiscountAmount(v.getMaxDiscountAmount())
                .usageLimit(v.getUsageLimit())
                .usedCount(v.getUsedCount())
                .isActive(v.getIsActive())
                .expiredAt(v.getExpiredAt())
                .createdAt(v.getCreatedAt())
                .status(status)
                .build();
    }

    private String computeStatus(Voucher v) {
        if (!Boolean.TRUE.equals(v.getIsActive())) return "INACTIVE";
        if (v.getExpiredAt() != null && v.getExpiredAt().isBefore(LocalDateTime.now())) return "EXPIRED";
        if (v.getUsageLimit() > 0 && v.getUsedCount() >= v.getUsageLimit()) return "USED_UP";
        return "ACTIVE";
    }
}
