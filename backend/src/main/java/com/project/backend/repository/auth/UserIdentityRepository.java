package com.project.backend.repository.auth;

import com.project.backend.entity.auth.UserIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public  interface UserIdentityRepository  extends JpaRepository<UserIdentity, Long> {
    Optional<UserIdentity> findByProviderAndProviderUserId(String provider, String providerUserId);

    Optional<UserIdentity> findByUserIdAndProvider(Long userId, String provider);
}
