package com.innersignature.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 보안 이벤트 전용 로거
 */
public class SecurityLogger {
    private static final Logger SECURITY_LOGGER = LoggerFactory.getLogger("SECURITY");

    public static void loginSuccess(Long userId, String username, String role) {
        SECURITY_LOGGER.info("LOGIN_SUCCESS userId={} username={} role={}", userId, username, role);
    }

    public static void loginFailure(String username) {
        SECURITY_LOGGER.warn("LOGIN_FAILURE username={}", username);
    }

    public static void logout(Long userId) {
        SECURITY_LOGGER.info("LOGOUT userId={}", userId);
    }

    public static void rateLimitExceeded(String key, String path) {
        SECURITY_LOGGER.warn("RATE_LIMIT_EXCEEDED key={} path={}", key, path);
    }

    public static void fileAccess(String action, Long userId, Long expenseId, String detail) {
        SECURITY_LOGGER.info("FILE_{} userId={} expenseId={} detail={}", action, userId, expenseId, detail);
    }

    public static void userManagement(String action, Long operatorId, Long targetUserId, String detail) {
        SECURITY_LOGGER.info("USER_MANAGEMENT action={} operatorId={} targetUserId={} detail={}", 
            action, operatorId, targetUserId, detail);
    }
    
    public static void companyManagement(String action, Long operatorId, Long companyId, String detail) {
        SECURITY_LOGGER.info("COMPANY_MANAGEMENT action={} operatorId={} companyId={} detail={}", 
            action, operatorId, companyId, detail);
    }
    
    public static void superAdminAction(String action, Long operatorId, String targetType, Long targetId, String detail) {
        SECURITY_LOGGER.info("SUPERADMIN_ACTION action={} operatorId={} targetType={} targetId={} detail={}", 
            action, operatorId, targetType, targetId, detail);
    }
}

