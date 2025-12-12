package com.innersignature.backend.exception;

/**
 * 인증이 필요한 요청에서 인증 정보가 없거나 유효하지 않을 때 발생하는 예외
 */
public class AuthenticationRequiredException extends RuntimeException {
    public AuthenticationRequiredException(String message) {
        super(message);
    }
}

