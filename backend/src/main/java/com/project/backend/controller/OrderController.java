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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        OrderResponse response = orderService.createOrder(request, currentUser);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal User currentUser) {
        List<OrderResponse> response = orderService.getMyOrders(currentUser);
        return ResponseEntity.ok(response);
    }
}
