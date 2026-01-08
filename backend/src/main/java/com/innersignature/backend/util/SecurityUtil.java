package com.innersignature.backend.util;

import com.innersignature.backend.exception.AuthenticationRequiredException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * SecurityContext에서 현재 인증된 사용자 정보를 추출하는 유틸리티 클래스
 */
public class SecurityUtil {
    
    /**
     * 현재 인증된 사용자의 ID를 반환합니다.
     * JWT 필터에서 설정한 Authentication의 principal이 Long 타입의 userId입니다.
     * 
     * @return 현재 인증된 사용자 ID
     * @throws IllegalStateException 인증되지 않은 경우 또는 사용자 ID를 찾을 수 없는 경우
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationRequiredException("인증되지 않은 사용자입니다.");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Long) {
            return (Long) principal;
        }
        
        // UserDetails를 사용하는 경우 (현재는 사용하지 않지만 확장성을 위해)
        if (principal instanceof UserDetails) {
            throw new AuthenticationRequiredException("UserDetails 기반 인증은 지원하지 않습니다. 사용자 ID를 직접 사용하세요.");
        }
        
        throw new AuthenticationRequiredException("알 수 없는 인증 타입입니다. Principal: " + principal.getClass().getName());
    }
    
    /**
     * 현재 인증된 사용자가 있는지 확인합니다.
     * 
     * @return 인증된 사용자가 있으면 true, 없으면 false
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
    
    /**
     * 현재 인증된 사용자의 companyId를 반환합니다.
     * JWT 필터에서 설정한 Authentication의 details에 저장된 companyId를 반환합니다.
     * 
     * @return 현재 인증된 사용자의 companyId (nullable, SUPERADMIN인 경우 null)
     */
    public static Long getCurrentCompanyId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object details = authentication.getDetails();
        if (details instanceof java.util.Map) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> detailsMap = (java.util.Map<String, Object>) details;
            Object companyIdObj = detailsMap.get("companyId");
            if (companyIdObj == null) {
                return null;
            }
            if (companyIdObj instanceof Number) {
                return ((Number) companyIdObj).longValue();
            }
            if (companyIdObj instanceof String) {
                return Long.parseLong((String) companyIdObj);
            }
        }
        
        return null;
    }
    
    /**
     * 현재 인증된 사용자의 Role을 반환합니다.
     * JWT 필터에서 설정한 Authentication의 authorities에서 role을 추출합니다.
     * 
     * @return 현재 인증된 사용자의 Role (예: SUPERADMIN, CEO, ADMIN, ACCOUNTANT, USER 등)
     */
    public static String getCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // authorities에서 role 추출 (ROLE_ 접두사 제거)
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> {
                    String role = authority.getAuthority();
                    if (role.startsWith("ROLE_")) {
                        return role.substring(5);
                    }
                    return role;
                })
                .orElse(null);
    }
}

