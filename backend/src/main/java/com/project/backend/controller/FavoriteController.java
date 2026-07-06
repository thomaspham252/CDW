package com.project.backend.controller;

import com.project.backend.entity.auth.User;
import com.project.backend.service.product.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping("/ids")
    public ResponseEntity<List<Integer>> getFavoriteProductIds(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(favoriteService.getFavoriteProductIds(currentUser.getId()));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @PathVariable Integer productId,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập"));
        }
        boolean isAdded = favoriteService.toggleFavorite(currentUser.getId(), productId);
        String message = isAdded ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích";
        return ResponseEntity.ok(Map.of(
                "success", true,
                "isFavorite", isAdded,
                "message", message
        ));
    }
}
