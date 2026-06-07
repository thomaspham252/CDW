package com.project.backend.repository.wishlist;

import com.project.backend.entity.wishlist.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Wishlist> findByUserIdAndProductId(Long userId, Integer productId);

    boolean existsByUserIdAndProductId(Long userId, Integer productId);

    long countByUserId(Long userId);
}
