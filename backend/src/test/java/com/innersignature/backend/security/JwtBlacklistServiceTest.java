package com.innersignature.backend.security;

import com.innersignature.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtBlacklistServiceTest {

    @Test
    void blacklistedTokenShouldBeBlockedUntilExpiry() {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        Claims claims = mock(Claims.class);
        when(jwtUtil.parseToken("token")).thenReturn(claims);
        when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() + 10_000));

        JwtBlacklistService service = new JwtBlacklistService(jwtUtil);

        service.blacklist("token");

        assertTrue(service.isBlacklisted("token"));
    }

    @Test
    void expiredBlacklistedTokenShouldBeCleanedUp() {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        Claims claims = mock(Claims.class);
        when(jwtUtil.parseToken("expired")).thenReturn(claims);
        when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() - 1_000));

        JwtBlacklistService service = new JwtBlacklistService(jwtUtil);

        service.blacklist("expired");

        // 첫 조회에서 만료된 항목은 제거되고 false 반환
        assertFalse(service.isBlacklisted("expired"));
    }
}

