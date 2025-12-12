package com.innersignature.backend.security;

import com.innersignature.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * JWT 블랙리스트를 메모리에 관리 (만료 시간 기반 자동 정리)
 */
@Component
public class JwtBlacklistService {

    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();
    private final JwtUtil jwtUtil;

    public JwtBlacklistService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * 토큰 블랙리스트 추가 (토큰 만료 시점까지 보관)
     */
    public void blacklist(String token) {
        Claims claims = jwtUtil.parseToken(token);
        long expiry = claims.getExpiration().getTime();
        blacklist.put(token, expiry);
    }

    /**
     * 블랙리스트 여부 확인 (만료된 항목은 정리)
     */
    public boolean isBlacklisted(String token) {
        Long expiry = blacklist.get(token);
        if (expiry == null) {
            return false;
        }
        long now = System.currentTimeMillis();
        if (expiry < now) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }
}

