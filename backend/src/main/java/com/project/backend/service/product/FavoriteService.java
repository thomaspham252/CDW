package com.project.backend.service.product;

import java.util.List;

public interface FavoriteService {
    List<Integer> getFavoriteProductIds(Long userId);
    boolean toggleFavorite(Long userId, Integer productId);
}
