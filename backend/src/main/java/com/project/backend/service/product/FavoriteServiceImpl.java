package com.project.backend.service.product;

import com.project.backend.entity.auth.User;
import com.project.backend.entity.product.Favorite;
import com.project.backend.entity.product.Product;
import com.project.backend.repository.auth.UserRepository;
import com.project.backend.repository.product.ProductRepository;
import com.project.backend.repository.product.FavoriteRepository;
import com.project.backend.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Integer> getFavoriteProductIds(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(f -> f.getProduct().getId())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean toggleFavorite(Long userId, Integer productId) {
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // đã xóa
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với id: " + userId));
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm với id: " + productId));

            Favorite favorite = Favorite.builder()
                    .user(user)
                    .product(product)
                    .build();
            favoriteRepository.save(favorite);
            return true; // đã thêm
        }
    }
}
