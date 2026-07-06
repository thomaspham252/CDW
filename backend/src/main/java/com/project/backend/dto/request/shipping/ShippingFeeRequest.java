package com.project.backend.dto.request.shipping;

import com.project.backend.dto.request.order.OrderItemRequest;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ShippingFeeRequest {
    private Integer toDistrictId;
    private String toWardCode;
    private BigDecimal insuranceValue;
    private List<OrderItemRequest> items;
}
