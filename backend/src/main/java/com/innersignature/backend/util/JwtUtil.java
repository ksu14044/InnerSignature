package com.innersignature.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret:inner-signature-jwt-secret-key-2024-minimum-256-bits-required-for-security}")
    private String secret;
    
    @Value("${jwt.expiration:43200000}") // 12시간
    private Long expiration;

    @Value("${jwt.refresh-expiration:1209600000}") // 14일
    private Long refreshExpiration;
    
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // 최소 32바이트(256비트) 검증
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret key must be at least 32 bytes (256 bits) long. Current length: " + keyBytes.length);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public String generateToken(Long userId, String username, String role, Long companyId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        var builder = Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate);
        
        // companyId가 null이 아닌 경우에만 claim에 추가
        if (companyId != null) {
            builder.claim("companyId", companyId);
        }
        
        return builder.signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(Long userId, String username, String role, Long companyId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        var builder = Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate);
        
        // companyId가 null이 아닌 경우에만 claim에 추가
        if (companyId != null) {
            builder.claim("companyId", companyId);
        }
        
        return builder.signWith(getSigningKey())
                .compact();
    }
    
    public String switchCompanyToken(String currentToken, Long newCompanyId) {
        Claims claims = parseToken(currentToken);
        Long userId = Long.parseLong(claims.getSubject());
        String username = claims.get("username", String.class);
        String role = claims.get("role", String.class);
        
        return generateToken(userId, username, role, newCompanyId);
    }
    
    public Long getCompanyIdFromToken(String token) {
        Claims claims = parseToken(token);
        Object companyIdObj = claims.get("companyId");
        if (companyIdObj == null) {
            return null;
        }
        if (companyIdObj instanceof Number) {
            return ((Number) companyIdObj).longValue();
        }
        if (companyIdObj instanceof String) {
            return Long.parseLong((String) companyIdObj);
        }
        return null;
    }
    
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }
    
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token);
    }
}

