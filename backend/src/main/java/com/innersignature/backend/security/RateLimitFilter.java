package com.innersignature.backend.security;

import com.innersignature.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import com.innersignature.backend.util.SecurityLogger;

/**
 * Rate Limiting 필터
 * 간단한 토큰 버킷 알고리즘을 사용한 API 호출 제한
 */
@Component
@Order(1) // JWT 필터보다 먼저 실행
public class RateLimitFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);
    
    // 키(IP/USER)별 요청 카운터
    private final Map<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();

    @Value("${ratelimit.ip.limit:100}")
    private int maxRequestsPerMinuteIp;

    @Value("${ratelimit.user.limit:200}")
    private int maxRequestsPerMinuteUser;

    @Value("${ratelimit.window-ms:60000}")
    private long resetIntervalMs;

    private final JwtUtil jwtUtil;
    private final JwtBlacklistService jwtBlacklistService;

    public RateLimitFilter(JwtUtil jwtUtil, JwtBlacklistService jwtBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.jwtBlacklistService = jwtBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        // 정적 리소스는 Rate Limiting 제외
        String path = request.getRequestURI();
        if (path.startsWith("/swagger-ui") || 
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/actuator")) {
            chain.doFilter(request, response);
            return;
        }

        // 사용자/토큰 기반 우선, 없으면 IP 기반
        Long userId = resolveUserId(request);
        String key;
        int limit;
        if (userId != null) {
            key = "USER:" + userId;
            limit = maxRequestsPerMinuteUser;
        } else {
            String clientIp = getClientIp(request);
            key = "IP:" + clientIp;
            limit = maxRequestsPerMinuteIp;
        }

        RequestCounter counter = requestCounters.computeIfAbsent(key, k -> new RequestCounter());
        RateLimitInfo info = counter.consume(limit, resetIntervalMs);

        // 헤더 설정
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(info.remaining()));
        long resetSeconds = Math.max(0, (info.resetAt() - System.currentTimeMillis()) / 1000);
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetSeconds));

        if (info.allowed()) {
            chain.doFilter(request, response);
        } else {
            logger.warn("Rate limit exceeded for key: {}, path: {}", key, path);
            SecurityLogger.rateLimitExceeded(key, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"요청 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.\"}");
        }
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    /**
     * Authorization 헤더에서 사용자 ID 추출 (유효 토큰이면서 블랙리스트가 아닐 때)
     */
    private Long resolveUserId(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (!jwtBlacklistService.isBlacklisted(token) && jwtUtil.validateToken(token)) {
                try {
                    return Long.parseLong(jwtUtil.parseToken(token).getSubject());
                } catch (Exception e) {
                    return null;
                }
            }
        }
        return null;
    }
    
    /**
     * 요청 카운터 클래스
     */
    private static class RequestCounter {
        private int count = 0;
        private long windowStart = System.currentTimeMillis();
        
        synchronized RateLimitInfo consume(int limit, long windowMs) {
            long now = System.currentTimeMillis();
            
            // 윈도우 경과 시 리셋
            if (now - windowStart >= windowMs) {
                count = 0;
                windowStart = now;
            }
            
            if (count < limit) {
                count++;
                int remaining = Math.max(0, limit - count);
                return new RateLimitInfo(true, remaining, windowStart + windowMs);
            }

            // 초과
            return new RateLimitInfo(false, 0, windowStart + windowMs);
        }
    }

    private record RateLimitInfo(boolean allowed, int remaining, long resetAt) {}
}

