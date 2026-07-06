package com.project.backend.controller;

import com.project.backend.dto.request.order.OrderCreateRequest;
import com.project.backend.dto.response.order.OrderResponse;
import com.project.backend.entity.auth.User;
import com.project.backend.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/orders")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        OrderResponse response = orderService.createOrder(request, currentUser);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/api/orders/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal User currentUser) {
        List<OrderResponse> response = orderService.getMyOrders(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam String value) {
        OrderResponse response = orderService.updateOrderStatus(id, value);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/admin/orders/{id}/payment-status")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @PathVariable Integer id,
            @RequestParam String value) {
        OrderResponse response = orderService.updatePaymentStatus(id, value);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/analytics")
    public ResponseEntity<com.project.backend.dto.response.analytics.AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(orderService.getAnalytics());
    }

    @GetMapping("/api/admin/analytics/monthly")
    public ResponseEntity<java.util.List<com.project.backend.dto.response.analytics.MonthlyStatsResponse>> getMonthlyStats(
            @RequestParam int year) {
        return ResponseEntity.ok(orderService.getMonthlyStats(year));
    }

    @GetMapping("/api/admin/analytics/years")
    public ResponseEntity<java.util.List<Integer>> getAvailableYears() {
        return ResponseEntity.ok(orderService.getAvailableYears());
    }

    @GetMapping("/api/admin/analytics/status")
    public ResponseEntity<java.util.List<com.project.backend.dto.response.analytics.StatusStatsResponse>> getStatusStats(
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(orderService.getStatusStats(year));
    }
}
