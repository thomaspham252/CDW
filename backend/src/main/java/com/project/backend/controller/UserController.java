package com.project.backend.controller;

import com.project.backend.dto.request.auth.ChangePasswordRequest;
import com.project.backend.dto.request.auth.UpdateProfileRequest;
import com.project.backend.dto.response.auth.AuthResponseDTO;
import com.project.backend.entity.auth.User;
import com.project.backend.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final AuthService authService;

    @PutMapping("/profile")
    public ResponseEntity<AuthResponseDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(authService.updateProfile(currentUser, request));
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser) {
        authService.changePassword(currentUser, request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}
