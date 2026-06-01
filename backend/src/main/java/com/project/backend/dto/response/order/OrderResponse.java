package com.project.backend.dto.response.order;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderResponse {
    private Integer id;
    private Long userId;
    private String fullname;
    private String phone;
    private String email;
    private String address;
    private String ward;
    private String district;
    private String province;
    private String note;
    private String paymentMethod;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String couponCode;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
