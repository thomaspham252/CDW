package com.project.backend.service.order;

import com.project.backend.dto.request.order.OrderCreateRequest;
import com.project.backend.dto.response.order.OrderResponse;
import com.project.backend.dto.response.analytics.AnalyticsResponse;
import com.project.backend.entity.auth.User;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderCreateRequest request, User currentUser);
    List<OrderResponse> getMyOrders(User currentUser);
    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(Integer id, String status);
    AnalyticsResponse getAnalytics();
}
