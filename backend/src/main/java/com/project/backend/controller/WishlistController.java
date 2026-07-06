package com.project.backend.controller;

import com.project.backend.dto.response.product.ProductSummaryResponse;
import com.project.backend.entity.auth.User;
import com.project.backend.entity.product.Product;
import com.project.backend.entity.wishlist.Wishlist;
import com.project.backend.exception.NotFoundException;
import com.project.backend.mapper.product.ProductMapper;
import com.project.backend.repository.product.ProductRepository;
import com.project.backend.repository.wishlist.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductSummaryResponse>> listWishlist(
            @AuthenticationPrincipal User currentUser) {
        List<Integer> productIds = wishlistRepository
                .findAllByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(Wishlist::getProductId)
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        Map<Integer, Product> productsById = productRepository.findAllByIdInWithVariants(productIds).stream()
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        List<ProductSummaryResponse> products = productIds.stream()
                .map(productsById::get)
                .filter(product -> product != null)
                .map(productMapper::toSummary)
                .collect(Collectors.toList());

        products.forEach(p -> System.out.println("[Wishlist DEBUG] id=" + p.getId() + " name=" + p.getName() + " mainUrl=" + p.getMainUrl()));
        return ResponseEntity.ok(products);
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Integer>> listWishlistIds(
            @AuthenticationPrincipal User currentUser) {
        List<Integer> ids = wishlistRepository
                .findAllByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(Wishlist::getProductId)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ids);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countWishlist(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(Map.of("count", wishlistRepository.countByUserId(currentUser.getId())));
    }

    @GetMapping("/{productId}/exists")
    public ResponseEntity<Map<String, Boolean>> existsInWishlist(
            @PathVariable Integer productId,
            @AuthenticationPrincipal User currentUser) {
        boolean exists = wishlistRepository.existsByUserIdAndProductId(currentUser.getId(), productId);
        return ResponseEntity.ok(Map.of("favorite", exists));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Map<String, Boolean>> addToWishlist(
            @PathVariable Integer productId,
            @AuthenticationPrincipal User currentUser) {
        productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm id=" + productId));

        if (!wishlistRepository.existsByUserIdAndProductId(currentUser.getId(), productId)) {
            wishlistRepository.save(Wishlist.builder()
                    .userId(currentUser.getId())
                    .productId(productId)
                    .build());
        }

        return ResponseEntity.ok(Map.of("favorite", true));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, Boolean>> removeFromWishlist(
            @PathVariable Integer productId,
            @AuthenticationPrincipal User currentUser) {
        wishlistRepository.findByUserIdAndProductId(currentUser.getId(), productId)
                .ifPresent(wishlistRepository::delete);

        return ResponseEntity.ok(Map.of("favorite", false));
    }

    private ProductSummaryResponse findActiveProductSummary(Integer productId) {
        Product product = productRepository.findByIdWithVariants(productId).orElse(null);
        if (product == null || !Boolean.TRUE.equals(product.getIsActive())) {
            return null;
        }
        return productMapper.toSummary(product);
    }
}
