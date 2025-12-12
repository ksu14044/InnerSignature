package com.innersignature.backend.exception;

/**
 * 비즈니스 로직 예외 클래스
 * 비즈니스 규칙 위반 시 사용
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}

