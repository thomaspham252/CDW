package com.project.backend.service.order;

import com.project.backend.config.VNPayConfig;
import com.project.backend.config.VietQrConfig;
import com.project.backend.dto.request.order.OrderCreateRequest;
import com.project.backend.dto.request.order.OrderItemRequest;
import com.project.backend.dto.response.analytics.AnalyticsResponse;
import com.project.backend.dto.response.order.OrderItemResponse;
import com.project.backend.dto.response.order.OrderResponse;
import com.project.backend.dto.response.payment.BankTransferPaymentResponse;
import com.project.backend.entity.auth.User;
import com.project.backend.entity.order.Order;
import com.project.backend.entity.order.OrderItem;
import com.project.backend.entity.product.ProductImage;
import com.project.backend.entity.product.ProductVariant;
import com.project.backend.exception.AuthException;
import com.project.backend.exception.BadRequestException;
import com.project.backend.repository.auth.UserRepository;
import com.project.backend.repository.order.OrderRepository;
import com.project.backend.repository.product.ProductRepository;
import com.project.backend.repository.product.ProductVariantRepository;
import com.project.backend.service.coupon.CouponService;
import com.project.backend.service.shipping.ShippingService;
import com.project.backend.repository.auth.UserRepository;
import com.project.backend.dto.response.analytics.AnalyticsResponse;
import com.project.backend.dto.response.analytics.MonthlyStatsResponse;
import com.project.backend.dto.response.analytics.StatusStatsResponse;
import com.project.backend.config.VNPayConfig;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final String PAYMENT_METHOD_BANK_TRANSFER = "BANK_TRANSFER";
    private static final String PAYMENT_METHOD_COD = "COD";
    private static final String PAYMENT_METHOD_VNPAY = "VNPAY";

    private static final String STATUS_WAITING_CONFIRMATION = "WAITING_CONFIRMATION";
    private static final String STATUS_WAITING_PICKUP = "WAITING_PICKUP";
    private static final String STATUS_SHIPPING = "SHIPPING";
    private static final String STATUS_DELIVERED = "DELIVERED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private static final String PAYMENT_STATUS_UNPAID = "UNPAID";
    private static final String PAYMENT_STATUS_PAID = "PAID";
    private static final String PAYMENT_STATUS_FAILED = "FAILED";
    private static final String PAYMENT_STATUS_COD = "COD";

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            STATUS_WAITING_CONFIRMATION,
            STATUS_WAITING_PICKUP,
            STATUS_SHIPPING,
            STATUS_DELIVERED,
            STATUS_CANCELLED
    );

    private static final Set<String> ALLOWED_PAYMENT_STATUSES = Set.of(
            PAYMENT_STATUS_UNPAID,
            PAYMENT_STATUS_PAID,
            PAYMENT_STATUS_FAILED,
            PAYMENT_STATUS_COD
    );

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VNPayConfig vnpayConfig;
    private final VietQrConfig vietQrConfig;
    private final CouponService couponService;
    private final ShippingService shippingService;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, User currentUser) {
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
                .paymentMethod(normalize(request.getPaymentMethod()))
                .status(STATUS_WAITING_CONFIRMATION)
                .paymentStatus(resolveInitialPaymentStatus(request.getPaymentMethod()))
                .shippingProvider("GHN")
                .ghnDistrictId(request.getDistrictId())
                .ghnWardCode(request.getWardCode())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Product variant not found: " + itemReq.getVariantId()));

            // Kiểm tra tồn kho
            if (variant.getStock() < itemReq.getQuantity()) {
                throw new com.project.backend.exception.BadRequestException(
                    "Sản phẩm '" + variant.getProduct().getName() + 
                    " (" + (variant.getColor() != null ? variant.getColor() + ", " : "") + variant.getSize() + ")' chỉ còn " + 
                    variant.getStock() + " sản phẩm trong kho."
                );
            }

            // Trừ tồn kho
            variant.setStock(variant.getStock() - itemReq.getQuantity());
            productVariantRepository.save(variant);

            BigDecimal itemPrice = variant.getPrice();
            BigDecimal quantity = BigDecimal.valueOf(itemReq.getQuantity());
            subtotal = subtotal.add(itemPrice.multiply(quantity));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(itemReq.getQuantity())
                    .price(itemPrice)
                    .build();

            orderItems.add(orderItem);
        }

        BigDecimal discountAmount = couponService.calculateDiscount(request.getCouponCode(), subtotal);
        BigDecimal shippingFee = shippingService.calculateFee(
                request.getDistrictId(),
                request.getWardCode(),
                subtotal
        ).getFee();

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setCouponCode(discountAmount.compareTo(BigDecimal.ZERO) > 0 ? request.getCouponCode() : null);
        order.setTotalAmount(subtotal.add(shippingFee).subtract(discountAmount));
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        OrderResponse response = mapToOrderResponse(savedOrder);

        if (PAYMENT_METHOD_VNPAY.equalsIgnoreCase(savedOrder.getPaymentMethod())) {
            response.setPaymentUrl(buildVnPayUrl(savedOrder));
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
        String normalizedStatus = normalize(status);
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Trang thai don hang khong hop le: " + status);
        }

        Order order = getOrder(id);
        order.setStatus(normalizedStatus);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updatePaymentStatus(Integer id, String paymentStatus) {
        String normalizedPaymentStatus = normalize(paymentStatus);
        if (!ALLOWED_PAYMENT_STATUSES.contains(normalizedPaymentStatus)) {
            throw new BadRequestException("Trang thai thanh toan khong hop le: " + paymentStatus);
        }

        Order order = getOrder(id);
        order.setPaymentStatus(normalizedPaymentStatus);
        if (PAYMENT_STATUS_PAID.equals(normalizedPaymentStatus)) {
            order.setStatus(STATUS_WAITING_PICKUP);
        } else if (PAYMENT_STATUS_UNPAID.equals(normalizedPaymentStatus)
                || PAYMENT_STATUS_FAILED.equals(normalizedPaymentStatus)) {
            order.setStatus(STATUS_WAITING_CONFIRMATION);
        }
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse markVnPaySuccess(Integer id) {
        Order order = getOrder(id);
        order.setPaymentStatus(PAYMENT_STATUS_PAID);
        order.setStatus(STATUS_WAITING_PICKUP);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse markVnPayFailed(Integer id) {
        Order order = getOrder(id);
        order.setPaymentStatus(PAYMENT_STATUS_FAILED);
        order.setStatus(STATUS_WAITING_CONFIRMATION);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public BankTransferPaymentResponse getBankTransferPayment(Integer id, User currentUser) {
        Order order = getOwnedOrder(id, currentUser);
        if (!PAYMENT_METHOD_BANK_TRANSFER.equalsIgnoreCase(order.getPaymentMethod())) {
            throw new BadRequestException("Don hang nay khong su dung thanh toan QR");
        }

        String transferContent = getTransferContent(order.getId());
        String qrImageUrl = "https://img.vietqr.io/image/"
                + vietQrConfig.getBankId()
                + "-"
                + vietQrConfig.getAccountNo()
                + "-"
                + vietQrConfig.getTemplate()
                + ".png?amount="
                + order.getTotalAmount().longValue()
                + "&addInfo="
                + urlEncode(transferContent)
                + "&accountName="
                + urlEncode(vietQrConfig.getAccountName());

        return BankTransferPaymentResponse.builder()
                .orderId(order.getId())
                .amount(order.getTotalAmount())
                .bankId(vietQrConfig.getBankId())
                .bankName(vietQrConfig.getBankName())
                .accountNo(vietQrConfig.getAccountNo())
                .accountName(vietQrConfig.getAccountName())
                .displayAccountName(vietQrConfig.getDisplayAccountName())
                .transferContent(transferContent)
                .qrImageUrl(qrImageUrl)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String createVnPayPaymentUrl(Integer id, User currentUser) {
        Order order = getOwnedOrder(id, currentUser);
        if (!PAYMENT_METHOD_VNPAY.equalsIgnoreCase(order.getPaymentMethod())) {
            throw new BadRequestException("Don hang nay khong su dung thanh toan VNPAY");
        }
        if (PAYMENT_STATUS_PAID.equalsIgnoreCase(order.getPaymentStatus())) {
            throw new BadRequestException("Don hang da thanh toan");
        }
        return buildVnPayUrl(order);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> !STATUS_CANCELLED.equalsIgnoreCase(o.getStatus()))
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
        response.setSubtotal(order.getSubtotal());
        response.setShippingFee(order.getShippingFee());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setTotalAmount(order.getTotalAmount());
        response.setCouponCode(order.getCouponCode());
        response.setStatus(order.getStatus());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setShippingProvider(order.getShippingProvider());
        response.setGhnDistrictId(order.getGhnDistrictId());
        response.setGhnWardCode(order.getGhnWardCode());
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

                String imageUrl = null;
                if (variant.getImages() != null && !variant.getImages().isEmpty()) {
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

    private String buildVnPayUrl(Order savedOrder) {
        try {
            HttpServletRequest servletRequest = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", vnpayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(savedOrder.getTotalAmount().multiply(new BigDecimal(100)).longValue()));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", String.valueOf(savedOrder.getId()));
            vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + savedOrder.getId());
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vi");
            vnpParams.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", VNPayConfig.getIpAddress(servletRequest));

            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            vnpParams.put("vnp_CreateDate", formatter.format(calendar.getTime()));

            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (String fieldName : fieldNames) {
                String fieldValue = vnpParams.get(fieldName);
                if (fieldValue != null && !fieldValue.isBlank()) {
                    if (hashData.length() > 0) {
                        hashData.append('&');
                    }
                    hashData.append(fieldName).append('=').append(VNPayConfig.urlEncode(fieldValue));

                    if (query.length() > 0) {
                        query.append('&');
                    }
                    query.append(VNPayConfig.urlEncode(fieldName))
                            .append('=')
                            .append(VNPayConfig.urlEncode(fieldValue));
                }
            }

            System.out.println(">>> VNPAY Secret Key: [" + vnpayConfig.getHashSecret() + "] <<<");
            System.out.println(">>> VNPAY HashData: [" + hashData.toString() + "] <<<");
            String secureHash = VNPayConfig.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
            System.out.println(">>> VNPAY SecureHash: [" + secureHash + "] <<<");
            String finalUrl = vnpayConfig.getVnpUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
            System.out.println(">>> VNPAY Final URL: [" + finalUrl + "] <<<");
            return finalUrl;
        } catch (Exception e) {
            System.err.println("Error generating VNPAY URL: " + e.getMessage());
            return null;
        }
    }

    private Order getOrder(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
    }

    private Order getOwnedOrder(Integer id, User currentUser) {
        if (currentUser == null) {
            throw new AuthException("Vui long dang nhap");
        }

        Order order = getOrder(id);
        if (order.getUserId() == null || !order.getUserId().equals(currentUser.getId())) {
            throw new AuthException("Ban khong co quyen truy cap don hang nay", org.springframework.http.HttpStatus.FORBIDDEN);
        }
        return order;
    }

    private String getTransferContent(Integer orderId) {
        return "CDW " + orderId;
    }

    private String resolveInitialPaymentStatus(String paymentMethod) {
        if (PAYMENT_METHOD_COD.equalsIgnoreCase(paymentMethod)) {
            return PAYMENT_STATUS_COD;
        }
        if (PAYMENT_METHOD_BANK_TRANSFER.equalsIgnoreCase(paymentMethod)
                || PAYMENT_METHOD_VNPAY.equalsIgnoreCase(paymentMethod)) {
            return PAYMENT_STATUS_UNPAID;
        }
        throw new BadRequestException("Phuong thuc thanh toan khong hop le: " + paymentMethod);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyStatsResponse> getMonthlyStats(int year) {
        List<Object[]> rows = orderRepository.findMonthlyStatsByYear(year);
        List<MonthlyStatsResponse> result = new ArrayList<>();
        // Build a map from DB rows
        java.util.Map<Integer, MonthlyStatsResponse> map = new java.util.LinkedHashMap<>();
        for (Object[] row : rows) {
            int month = ((Number) row[0]).intValue();
            BigDecimal revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            long totalOrders = ((Number) row[2]).longValue();
            long cancelledOrders = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            map.put(month, new MonthlyStatsResponse(year, month, revenue, totalOrders, cancelledOrders));
        }
        // Fill all 12 months (missing = 0)
        for (int m = 1; m <= 12; m++) {
            result.add(map.getOrDefault(m, new MonthlyStatsResponse(year, m, BigDecimal.ZERO, 0L, 0L)));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Integer> getAvailableYears() {
        List<Integer> years = orderRepository.findDistinctYears();
        if (years == null || years.isEmpty()) {
            years = new ArrayList<>();
            years.add(java.time.LocalDateTime.now().getYear());
        }
        return years;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusStatsResponse> getStatusStats(Integer year) {
        List<Object[]> rows = orderRepository.findOrderStatusStats(year);
        List<StatusStatsResponse> result = new ArrayList<>();
        for (Object[] row : rows) {
            String status = (String) row[0];
            long count = ((Number) row[1]).longValue();
            BigDecimal revenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            result.add(new StatusStatsResponse(status, count, revenue));
        }
        return result;
    }
}
