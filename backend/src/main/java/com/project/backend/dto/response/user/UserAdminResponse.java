package com.project.backend.dto.response.user;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminResponse {
    private Long id;
    private String email;
    private String fullname;
    private String phone;
    private String gender;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long totalOrders;
}
