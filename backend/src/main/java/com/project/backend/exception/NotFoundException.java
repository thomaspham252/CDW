package com.project.backend.exception;

import org.springframework.http.HttpStatus;

/**
 * Ném ra khi một resource (Product, Variant, Image...) không tồn tại trong DB.
 * GlobalExceptionHandler sẽ bắt và trả về HTTP 404 Not Found.
 */
public class NotFoundException extends RuntimeException {

    private final HttpStatus status = HttpStatus.NOT_FOUND;

    public NotFoundException(String message) {
        super(message);
    }

    public HttpStatus getStatus() {
        return status;
    }
}
