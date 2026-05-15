package com.project.backend.exception;

import com.project.backend.dto.response.erro.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    // AuthException
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthException(
            AuthException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(ex.getStatus())
                .body(buildResponse(ex.getStatus().value(), ex.getMessage(), request.getRequestURI()));
    }

    // 400 – dữ liệu không hợp lệ, slug trùng, vi phạm business rule
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex,
            HttpServletRequest request) {

        return ResponseEntity.badRequest()
                .body(buildResponse(400, ex.getMessage(), request.getRequestURI()));
    }

    // 404 – resource (product / variant / image) không tồn tại
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            NotFoundException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(404)
                .body(buildResponse(404, ex.getMessage(), request.getRequestURI()));
    }

    // 400 – lỗi Bean Validation (@Valid trên DTO)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        // Trả về lỗi đầu tiên tìm được (field: message)
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Dữ liệu không hợp lệ");

        return ResponseEntity.badRequest()
                .body(buildResponse(400, message, request.getRequestURI()));
    }

    // 500 – lỗi không mong muốn
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(
            Exception ex,
            HttpServletRequest request) {

        return ResponseEntity.status(500)
                .body(buildResponse(500, ex.getMessage(), request.getRequestURI()));
    }

    private ErrorResponse buildResponse(int status, String message, String path) {
        return ErrorResponse.builder()
                .status(status)
                .error(getErrorName(status))
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private String getErrorName(int status) {
        return switch (status) {
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            default  -> "Internal Server Error";
        };
    }
}