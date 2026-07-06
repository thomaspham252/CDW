package com.project.backend.service.order;

import com.project.backend.dto.request.order.OrderCreateRequest;
import com.project.backend.dto.request.order.OrderItemRequest;
import com.project.backend.dto.response.order.OrderItemResponse;
import com.project.backend.dto.response.order.OrderResponse;
import com.project.backend.entity.auth.User;
import com.project.backend.entity.order.Order;
import com.project.backend.entity.order.OrderItem;
import com.project.backend.entity.product.ProductImage;
import com.project.backend.entity.product.ProductVariant;
import com.project.backend.repository.order.OrderItemRepository;
import com.project.backend.repository.order.OrderRepository;
import com.project.backend.repository.product.ProductVariantRepository;
import com.project.backend.repository.product.ProductRepository;
import com.project.backend.repository.auth.UserRepository;
import com.project.backend.dto.response.analytics.AnalyticsResponse;
import com.project.backend.config.VNPayConfig;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VNPayConfig vnpayConfig;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, User currentUser) {
        // 1. Khởi tạo thực thể Order
        Order order = Order.builder()
                .userId(currentUser != null ? currentUser.getId() : null)
                .fullname(request.getFullname())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .ward(request.getWard())
                .district(request.getDistrict())
                .province(request.getProvince())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .couponCode(request.getCouponCode())
                .status("pending")
                .build();

        // 2. Tính toán tiền hàng và phí ship từ DB để bảo mật
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Product variant not found: " + itemReq.getVariantId()));

            BigDecimal itemPrice = variant.getPrice();
            BigDecimal quantityDec = BigDecimal.valueOf(itemReq.getQuantity());
            subtotal = subtotal.add(itemPrice.multiply(quantityDec));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(itemReq.getQuantity())
                    .price(itemPrice)
                    .build();

            orderItems.add(orderItem);
        }

        // Phí vận chuyển: Free ship cho đơn từ 500.000đ, ngược lại 30.000đ
        BigDecimal shippingFee = subtotal.compareTo(BigDecimal.valueOf(500000)) >= 0 
                ? BigDecimal.ZERO 
                : BigDecimal.valueOf(30000);

        order.setShippingFee(shippingFee);
        order.setTotalAmount(subtotal.add(shippingFee));
        order.setItems(orderItems);

        // 3. Lưu đơn hàng (Cascade tự động lưu OrderItems)
        Order savedOrder = orderRepository.save(order);

        OrderResponse response = mapToOrderResponse(savedOrder);

        if ("VNPAY".equalsIgnoreCase(savedOrder.getPaymentMethod())) {
            try {
                HttpServletRequest servletRequest = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
                
                Map<String, String> vnp_Params = new HashMap<>();
                vnp_Params.put("vnp_Version", "2.1.0");
                vnp_Params.put("vnp_Command", "pay");
                vnp_Params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
                vnp_Params.put("vnp_Amount", String.valueOf(savedOrder.getTotalAmount().multiply(new BigDecimal(100)).longValue()));
                vnp_Params.put("vnp_CurrCode", "VND");
                vnp_Params.put("vnp_TxnRef", String.valueOf(savedOrder.getId()));
                vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + savedOrder.getId());
                vnp_Params.put("vnp_OrderType", "other");
                vnp_Params.put("vnp_Locale", "vn");
                vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
                vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(servletRequest));

                Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                String vnp_CreateDate = formatter.format(cld.getTime());
                vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

                List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
                Collections.sort(fieldNames);
                StringBuilder hashData = new StringBuilder();
                StringBuilder query = new StringBuilder();
                for (String fieldName : fieldNames) {
                    String fieldValue = vnp_Params.get(fieldName);
                    if ((fieldValue != null) && (fieldValue.length() > 0)) {
                        String encodedName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());
                        String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());

                        if (hashData.length() > 0) {
                            hashData.append('&');
                        }
                        hashData.append(fieldName).append('=').append(encodedValue);

                        if (query.length() > 0) {
                            query.append('&');
                        }
                        query.append(encodedName).append('=').append(encodedValue);
                    }
                }
                String queryUrl = query.toString();
                String vnp_SecureHash = VNPayConfig.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
                String paymentUrl = vnpayConfig.getVnpUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
                
                response.setPaymentUrl(paymentUrl);
            } catch (Exception e) {
                System.err.println("Error generating VNPAY URL: " + e.getMessage());
            }
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(User currentUser) {
        if (currentUser == null) {
            return new ArrayList<>();
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUserId());
        response.setFullname(order.getFullname());
        response.setPhone(order.getPhone());
        response.setEmail(order.getEmail());
        response.setAddress(order.getAddress());
        response.setWard(order.getWard());
        response.setDistrict(order.getDistrict());
        response.setProvince(order.getProvince());
        response.setNote(order.getNote());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setShippingFee(order.getShippingFee());
        response.setTotalAmount(order.getTotalAmount());
        response.setCouponCode(order.getCouponCode());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
                OrderItemResponse ir = new OrderItemResponse();
                ir.setId(item.getId());
                ir.setVariantId(item.getProductVariant().getId());
                ir.setQuantity(item.getQuantity());
                ir.setPrice(item.getPrice());
                
                ProductVariant variant = item.getProductVariant();
                if (variant.getProduct() != null) {
                    ir.setProductName(variant.getProduct().getName());
                    ir.setProductSlug(variant.getProduct().getSlug());
                }
                ir.setSize(variant.getSize());

                // Lấy ảnh đại diện của variant
                String imageUrl = null;
                if (variant.getImages() != null && !variant.getImages().isEmpty()) {
                    // Try to get main image first, otherwise fall back to any image safely (Set -> stream)
                    imageUrl = variant.getImages().stream()
                            .filter(img -> img.getIsMain() != null && img.getIsMain())
                            .map(ProductImage::getImgUrl)
                            .findFirst()
                            .orElseGet(() -> variant.getImages().stream().findFirst().map(ProductImage::getImgUrl).orElse(null));
                }
                ir.setImageUrl(imageUrl);

                return ir;
            }).collect(Collectors.toList());
            response.setItems(itemResponses);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Integer id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> !"cancelled".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.count();

        return AnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .build();
    }
}
