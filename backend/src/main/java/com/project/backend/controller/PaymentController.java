package com.project.backend.controller;

import com.project.backend.config.VNPayConfig;
import com.project.backend.dto.response.payment.BankTransferPaymentResponse;
import com.project.backend.dto.response.payment.PaymentUrlResponse;
import com.project.backend.entity.auth.User;
import com.project.backend.service.order.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final VNPayConfig vnpayConfig;
    private final OrderService orderService;

    @GetMapping("/orders/{orderId}/bank-transfer")
    public ResponseEntity<BankTransferPaymentResponse> getBankTransferPayment(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(orderService.getBankTransferPayment(orderId, currentUser));
    }

    @PostMapping("/orders/{orderId}/vnpay-url")
    public ResponseEntity<PaymentUrlResponse> createVnPayPaymentUrl(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(new PaymentUrlResponse(orderService.createVnPayPaymentUrl(orderId, currentUser)));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> vnpayCallback(HttpServletRequest request) {
        try {
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType")) {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash")) {
                fields.remove("vnp_SecureHash");
            }

            // Sắp xếp các tham số để tạo chuỗi băm kiểm tra
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            for (String fieldName : fieldNames) {
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    if (hashData.length() > 0) {
                        hashData.append('&');
                    }
                    hashData.append(fieldName)
                            .append('=')
                            .append(VNPayConfig.urlEncode(fieldValue));
                }
            }

            String signValue = VNPayConfig.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
            if (signValue.equalsIgnoreCase(vnp_SecureHash)) {
                String orderIdStr = request.getParameter("vnp_TxnRef");
                String responseCode = request.getParameter("vnp_ResponseCode");

                Integer orderId = Integer.parseInt(orderIdStr);

                if ("00".equals(responseCode)) {
                    orderService.markVnPaySuccess(orderId);
                    return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS", 
                        "message", "Thanh toán đơn hàng #" + orderId + " thành công!"
                    ));
                } else {
                    orderService.markVnPayFailed(orderId);
                    return ResponseEntity.ok(Map.of(
                        "status", "FAILED", 
                        "message", "Thanh toán thất bại hoặc đã bị hủy. Mã lỗi: " + responseCode
                    ));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "INVALID_SIGNATURE", 
                    "message", "Chữ ký kiểm tra từ VNPay không hợp lệ"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "ERROR", 
                "message", e.getMessage()
            ));
        }
    }
}
