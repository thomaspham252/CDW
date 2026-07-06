package com.project.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class GHNConfig {
    @Value("${ghn.base-url:https://dev-online-gateway.ghn.vn/shiip/public-api}")
    private String baseUrl;

    @Value("${ghn.token:}")
    private String token;

    @Value("${ghn.shop-id:0}")
    private Integer shopId;

    @Value("${ghn.from-district-id:0}")
    private Integer fromDistrictId;

    @Value("${ghn.from-ward-code:}")
    private String fromWardCode;

    @Value("${ghn.service-type-id:2}")
    private Integer serviceTypeId;

    @Value("${ghn.default-weight:500}")
    private Integer defaultWeight;

    @Value("${ghn.default-length:20}")
    private Integer defaultLength;

    @Value("${ghn.default-width:20}")
    private Integer defaultWidth;

    @Value("${ghn.default-height:10}")
    private Integer defaultHeight;

    @Value("${ghn.fallback-fee:35000}")
    private Long fallbackFee;

    @Value("${ghn.free-shipping-threshold:500000}")
    private Long freeShippingThreshold;

    public boolean isConfigured() {
        return token != null && !token.isBlank()
                && shopId != null && shopId > 0
                && fromDistrictId != null && fromDistrictId > 0;
    }
}
