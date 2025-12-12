package com.innersignature.backend.util;

import org.slf4j.Logger;

/**
 * 로깅 유틸리티 클래스
 * 민감한 정보를 마스킹하여 로그에 기록하지 않도록 함
 */
public class LoggingUtil {
    
    /**
     * 비밀번호를 마스킹하여 반환
     * 
     * @param password 원본 비밀번호
     * @return 마스킹된 비밀번호 (예: "****")
     */
    public static String maskPassword(String password) {
        if (password == null || password.isEmpty()) {
            return "****";
        }
        return "****";
    }
    
    /**
     * JWT 토큰을 마스킹하여 반환
     * 
     * @param token 원본 토큰
     * @return 마스킹된 토큰 (처음 10자만 표시)
     */
    public static String maskToken(String token) {
        if (token == null || token.isEmpty()) {
            return "****";
        }
        if (token.length() <= 10) {
            return "****";
        }
        return token.substring(0, 10) + "****";
    }
    
    /**
     * 사용자 ID를 안전하게 로깅
     * 
     * @param userId 사용자 ID
     * @return 로깅 가능한 문자열
     */
    public static String safeUserId(Long userId) {
        return userId != null ? userId.toString() : "null";
    }
    
    /**
     * 민감한 정보가 포함된 문자열을 마스킹
     * 
     * @param value 원본 문자열
     * @return 마스킹된 문자열
     */
    public static String maskSensitive(String value) {
        if (value == null || value.isEmpty()) {
            return "****";
        }
        if (value.length() <= 4) {
            return "****";
        }
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }
    
    /**
     * 안전하게 로깅 (민감 정보 자동 마스킹)
     * 
     * @param logger Logger 인스턴스
     * @param level 로그 레벨 (INFO, WARN, ERROR 등)
     * @param message 메시지
     * @param args 인자들 (자동으로 민감 정보 마스킹)
     */
    public static void safeLog(Logger logger, String level, String message, Object... args) {
        Object[] maskedArgs = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            Object arg = args[i];
            if (arg instanceof String) {
                String str = (String) arg;
                // 비밀번호나 토큰으로 보이는 문자열은 마스킹
                if (str.toLowerCase().contains("password") || 
                    str.toLowerCase().contains("token") ||
                    str.length() > 50) { // 긴 문자열은 토큰일 가능성이 높음
                    maskedArgs[i] = maskSensitive(str);
                } else {
                    maskedArgs[i] = arg;
                }
            } else {
                maskedArgs[i] = arg;
            }
        }
        
        switch (level.toUpperCase()) {
            case "DEBUG":
                logger.debug(message, maskedArgs);
                break;
            case "INFO":
                logger.info(message, maskedArgs);
                break;
            case "WARN":
                logger.warn(message, maskedArgs);
                break;
            case "ERROR":
                logger.error(message, maskedArgs);
                break;
            default:
                logger.info(message, maskedArgs);
        }
    }
}

