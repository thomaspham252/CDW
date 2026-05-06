package com.project.backend.entity.auth;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_identities")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserIdentity {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String provider;

    @Column(name = "provider_user_id",nullable = false)
    private String providerUserId;

    private String email;

    @Column(name = "access_token",columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token",columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}
