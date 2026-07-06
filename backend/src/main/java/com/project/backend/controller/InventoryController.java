package com.project.backend.controller;

import com.project.backend.dto.response.product.InventoryResponse;
import com.project.backend.entity.product.ProductImage;
import com.project.backend.entity.product.ProductVariant;
import com.project.backend.exception.NotFoundException;
import com.project.backend.repository.product.ProductVariantRepository;
import com.project.backend.repository.product.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class InventoryController {

    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;

    /** Lấy toàn bộ danh sách kho hàng */
    @GetMapping("/api/admin/inventory")
    public ResponseEntity<List<InventoryResponse>> getInventoryList() {
        List<ProductVariant> variants = variantRepository.findAll();
        List<InventoryResponse> response = variants.stream()
                .map(v -> {
                    // Lấy ảnh chính
                    List<ProductImage> imgs = imageRepository.findAllByProductVariantId(v.getId());
                    String mainImgUrl = imgs.stream()
                            .filter(img -> Boolean.TRUE.equals(img.getIsMain()))
                            .findFirst()
                            .map(ProductImage::getImgUrl)
                            .orElse(imgs.isEmpty() ? null : imgs.get(0).getImgUrl());

                    return InventoryResponse.builder()
                            .variantId(v.getId())
                            .productId(v.getProduct().getId())
                            .productName(v.getProduct().getName())
                            .productSlug(v.getProduct().getSlug())
                            .size(v.getSize())
                            .color(v.getColor())
                            .price(v.getPrice())
                            .stock(v.getStock() != null ? v.getStock() : 0)
                            .imageUrl(mainImgUrl)
                            .categoryName(v.getProduct().getCategory() != null ? v.getProduct().getCategory().getName() : "Khác")
                            .build();
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /** Nhập hàng (cộng thêm tồn kho) */
    @PostMapping("/api/admin/inventory/import")
    public ResponseEntity<InventoryResponse> importStock(
            @RequestParam Integer variantId,
            @RequestParam int amount) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy biến thể id=" + variantId));

        variant.setStock((variant.getStock() != null ? variant.getStock() : 0) + amount);
        ProductVariant saved = variantRepository.save(variant);

        return ResponseEntity.ok(toInventoryResponse(saved));
    }

    /** Điều chỉnh trực tiếp tồn kho */
    @PutMapping("/api/admin/inventory/set")
    public ResponseEntity<InventoryResponse> setStock(
            @RequestParam Integer variantId,
            @RequestParam int stock) {
        if (stock < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được âm.");
        }

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy biến thể id=" + variantId));

        variant.setStock(stock);
        ProductVariant saved = variantRepository.save(variant);

        return ResponseEntity.ok(toInventoryResponse(saved));
    }

    private InventoryResponse toInventoryResponse(ProductVariant v) {
        List<ProductImage> imgs = imageRepository.findAllByProductVariantId(v.getId());
        String mainImgUrl = imgs.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsMain()))
                .findFirst()
                .map(ProductImage::getImgUrl)
                .orElse(imgs.isEmpty() ? null : imgs.get(0).getImgUrl());

        return InventoryResponse.builder()
                .variantId(v.getId())
                .productId(v.getProduct().getId())
                .productName(v.getProduct().getName())
                .productSlug(v.getProduct().getSlug())
                .size(v.getSize())
                .color(v.getColor())
                .price(v.getPrice())
                .stock(v.getStock() != null ? v.getStock() : 0)
                .imageUrl(mainImgUrl)
                .categoryName(v.getProduct().getCategory() != null ? v.getProduct().getCategory().getName() : "Khác")
                .build();
    }
}
