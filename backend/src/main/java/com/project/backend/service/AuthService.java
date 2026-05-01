package com.project.backend.service;

import com.project.backend.dto.request.LoginRequestDTO;
import com.project.backend.dto.response.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
}
