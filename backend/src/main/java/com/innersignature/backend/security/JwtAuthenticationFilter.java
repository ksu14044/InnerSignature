package com.innersignature.backend.security;

import com.innersignature.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@Order(2) // RateLimitFilter(1) 다음 순서로 실행되도록 명시
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;
    private final JwtBlacklistService jwtBlacklistService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        // Swagger UI 및 API 문서 경로는 필터 제외
        String path = request.getRequestURI();
        if (path.startsWith("/swagger-ui") || 
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/webjars") ||
            path.startsWith("/swagger-resources")) {
            chain.doFilter(request, response);
            return;
        }
        
        String token = getTokenFromRequest(request);
        
        if (token != null && !jwtBlacklistService.isBlacklisted(token) && jwtUtil.validateToken(token)) {
            try {
                var claims = jwtUtil.parseToken(token);
                Long userId = Long.parseLong(claims.getSubject());
                String role = claims.get("role", String.class);
                Long companyId = jwtUtil.getCompanyIdFromToken(token);
                
                // SUPERADMIN은 항상 전역 권한 (companyId = null)
                if ("SUPERADMIN".equals(role)) {
                    companyId = null;
                }
                
                // details에 companyId 저장
                java.util.Map<String, Object> detailsMap = new java.util.HashMap<>();
                detailsMap.put("companyId", companyId);
                detailsMap.put("webAuthenticationDetails", new WebAuthenticationDetailsSource().buildDetails(request));
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                authentication.setDetails(detailsMap);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                logger.debug("JWT 인증 성공 - userId: {}, role: {}, companyId: {}, uri: {}", userId, role, companyId, request.getRequestURI());
            } catch (NumberFormatException e) {
                logger.warn("JWT 토큰 파싱 실패 - 잘못된 사용자 ID 형식: {}", e.getMessage());
                // 인증 실패지만 요청은 계속 진행 (인증되지 않은 상태로)
            } catch (Exception e) {
                logger.warn("JWT 토큰 처리 중 오류 발생 - uri: {}, error: {}", request.getRequestURI(), e.getMessage());
                // 인증 실패지만 요청은 계속 진행 (인증되지 않은 상태로)
            }
        }
        
        chain.doFilter(request, response);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

