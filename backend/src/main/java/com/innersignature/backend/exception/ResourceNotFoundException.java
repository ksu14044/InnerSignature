package com.innersignature.backend.exception;

/**
 * 리소스를 찾을 수 없을 때 사용하는 예외
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

