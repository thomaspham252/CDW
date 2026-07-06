package com.project.backend.service.shipping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.backend.config.GHNConfig;
import com.project.backend.dto.response.shipping.AddressOptionResponse;
import com.project.backend.dto.response.shipping.ShippingFeeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShippingService {
    private final GHNConfig ghnConfig;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<AddressOptionResponse> getProvinces() {
        JsonNode data = getGhnData("/master-data/province");
        List<AddressOptionResponse> result = new ArrayList<>();
        for (JsonNode item : data) {
            result.add(new AddressOptionResponse(
                    item.path("ProvinceID").asText(),
                    item.path("ProvinceName").asText()
            ));
        }
        return result;
    }

    public List<AddressOptionResponse> getDistricts(Integer provinceId) {
        JsonNode data = getGhnData("/master-data/district?province_id=" + provinceId);
        List<AddressOptionResponse> result = new ArrayList<>();
        for (JsonNode item : data) {
            result.add(new AddressOptionResponse(
                    item.path("DistrictID").asText(),
                    item.path("DistrictName").asText()
            ));
        }
        return result;
    }

    public List<AddressOptionResponse> getWards(Integer districtId) {
        JsonNode data = getGhnData("/master-data/ward?district_id=" + districtId);
        List<AddressOptionResponse> result = new ArrayList<>();
        for (JsonNode item : data) {
            result.add(new AddressOptionResponse(
                    item.path("WardCode").asText(),
                    item.path("WardName").asText()
            ));
        }
        return result;
    }

    public ShippingFeeResponse calculateFee(Integer toDistrictId, String toWardCode, BigDecimal subtotal) {
        BigDecimal safeSubtotal = subtotal == null ? BigDecimal.ZERO : subtotal;
        if (safeSubtotal.compareTo(BigDecimal.valueOf(ghnConfig.getFreeShippingThreshold())) >= 0) {
            return new ShippingFeeResponse(BigDecimal.ZERO, "GHN", false);
        }

        if (!ghnConfig.isConfigured() || toDistrictId == null || toWardCode == null || toWardCode.isBlank()) {
            return fallbackFee();
        }

        try {
            Map<String, Object> body = Map.of(
                    "service_type_id", ghnConfig.getServiceTypeId(),
                    "from_district_id", ghnConfig.getFromDistrictId(),
                    "from_ward_code", ghnConfig.getFromWardCode(),
                    "to_district_id", toDistrictId,
                    "to_ward_code", toWardCode,
                    "height", ghnConfig.getDefaultHeight(),
                    "length", ghnConfig.getDefaultLength(),
                    "weight", ghnConfig.getDefaultWeight(),
                    "width", ghnConfig.getDefaultWidth(),
                    "insurance_value", safeSubtotal.longValue()
            );

            HttpRequest request = baseRequest("/v2/shipping-order/fee")
                    .header("Content-Type", "application/json")
                    .header("ShopId", String.valueOf(ghnConfig.getShopId()))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            long total = root.path("data").path("total").asLong(-1);
            if (response.statusCode() >= 200 && response.statusCode() < 300 && total >= 0) {
                return new ShippingFeeResponse(BigDecimal.valueOf(total), "GHN", false);
            }
        } catch (Exception ignored) {
        }

        return fallbackFee();
    }

    private JsonNode getGhnData(String path) {
        if (!ghnConfig.isConfigured()) {
            return objectMapper.createArrayNode();
        }

        try {
            HttpRequest request = baseRequest(path).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readTree(response.body()).path("data");
            }
        } catch (Exception ignored) {
        }

        return objectMapper.createArrayNode();
    }

    private HttpRequest.Builder baseRequest(String path) {
        return HttpRequest.newBuilder()
                .uri(URI.create(ghnConfig.getBaseUrl() + encodeSpaces(path)))
                .header("Token", ghnConfig.getToken());
    }

    private String encodeSpaces(String value) {
        return value.replace(" ", URLEncoder.encode(" ", StandardCharsets.UTF_8));
    }

    private ShippingFeeResponse fallbackFee() {
        return new ShippingFeeResponse(BigDecimal.valueOf(ghnConfig.getFallbackFee()), "GHN", true);
    }
}
