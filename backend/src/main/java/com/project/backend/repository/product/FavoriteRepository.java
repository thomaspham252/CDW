package com.project.backend.repository.product;

import com.project.backend.entity.product.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndProductId(Long userId, Integer productId);
    boolean existsByUserIdAndProductId(Long userId, Integer productId);
    void deleteByUserIdAndProductId(Long userId, Integer productId);
}
