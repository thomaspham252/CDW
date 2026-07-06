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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.backend.exception.BadRequestException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final String PAYMENT_METHOD_BANK_TRANSFER = "BANK_TRANSFER";
    private static final String PAYMENT_METHOD_COD = "COD";
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = BigDecimal.valueOf(500000);
    private static final BigDecimal STANDARD_SHIPPING_FEE = BigDecimal.valueOf(35000);
    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "pending_payment",
            "cod_pending",
            "pending",
            "paid",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
    );

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, User currentUser) {
        String paymentMethod = request.getPaymentMethod();
        if (!PAYMENT_METHOD_BANK_TRANSFER.equals(paymentMethod) && !PAYMENT_METHOD_COD.equals(paymentMethod)) {
            throw new BadRequestException("Phương thức thanh toán không hợp lệ");
        }

        String initialStatus = PAYMENT_METHOD_BANK_TRANSFER.equals(paymentMethod)
                ? "pending_payment"
                : "cod_pending";

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
                .paymentMethod(paymentMethod)
                .couponCode(request.getCouponCode())
                .status(initialStatus)
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

        // Phí vận chuyển: Free ship cho đơn từ 500.000đ, ngược lại 35.000đ
        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO 
                : STANDARD_SHIPPING_FEE;

        order.setShippingFee(shippingFee);
        order.setTotalAmount(subtotal.add(shippingFee));
        order.setItems(orderItems);

        // 3. Lưu đơn hàng (Cascade tự động lưu OrderItems)
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder);
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
        if (status == null || !ALLOWED_STATUSES.contains(status.trim().toLowerCase())) {
            throw new BadRequestException("Trạng thái đơn hàng không hợp lệ: " + status);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        order.setStatus(status.trim().toLowerCase());
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
