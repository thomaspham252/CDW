package com.project.backend.controller;

import com.project.backend.dto.request.user.UserAdminUpdateRequest;
import com.project.backend.dto.response.user.UserAdminResponse;
import com.project.backend.entity.auth.User;
import com.project.backend.exception.BadRequestException;
import com.project.backend.repository.auth.UserRepository;
import com.project.backend.repository.order.OrderRepository;
import com.project.backend.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserAdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    /** Lấy tất cả thành viên (có thể tìm kiếm theo tên/email) */
    @GetMapping("/api/admin/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers(
            @RequestParam(required = false) String search) {
        List<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.findByFullnameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(search, search, search);
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }
        List<UserAdminResponse> result = users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** Cập nhật role của user (CUSTOMER / ADMIN / BANNED) */
    @PatchMapping("/api/admin/users/{id}/role")
    public ResponseEntity<UserAdminResponse> updateUserRole(
            @PathVariable Long id,
            @RequestParam String value) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Người dùng không tồn tại: " + id));
        user.setRole(value.toUpperCase());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/api/admin/users/{id}")
    public ResponseEntity<UserAdminResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UserAdminUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Người dùng không tồn tại: " + id));

        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        if (email.isBlank()) {
            throw new BadRequestException("Email không được để trống.");
        }

        userRepository.findByEmail(email).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Email đã được sử dụng bởi tài khoản khác.");
            }
        });

        user.setEmail(email);
        user.setFullname(request.getFullname());
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        user.setRole(request.getRole() != null && !request.getRole().isBlank()
                ? request.getRole().trim().toUpperCase()
                : User.DEFAULT_ROLE);

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    private UserAdminResponse toResponse(User user) {
        long totalOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size();
        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .phone(user.getPhone())
                .gender(user.getGender())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .totalOrders(totalOrders)
                .build();
    }
}
