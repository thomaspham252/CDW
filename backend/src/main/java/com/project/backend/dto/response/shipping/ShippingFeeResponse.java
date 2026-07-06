package com.project.backend.dto.response.shipping;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ShippingFeeResponse {
    private BigDecimal fee;
    private String provider;
    private boolean fallback;
}
