package com.innersignature.backend.service;

import com.innersignature.backend.dto.PasswordResetTokenDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.PasswordResetTokenMapper;
import com.innersignature.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private final PasswordResetTokenMapper tokenMapper;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int TOKEN_EXPIRATION_HOURS = 1;

    /**
     * 비밀번호 재설정 토큰 생성 및 저장
     * @param userId 사용자 ID
     * @return 생성된 토큰
     */
    @Transactional
    public String generateResetToken(Long userId) {
        // 기존 토큰 삭제 (한 사용자당 하나의 활성 토큰만 유지)
        tokenMapper.deleteByUserId(userId);

        // 새 토큰 생성
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        PasswordResetTokenDto tokenDto = new PasswordResetTokenDto();
        tokenDto.setUserId(userId);
        tokenDto.setToken(token);
        tokenDto.setExpiresAt(expiresAt);

        tokenMapper.insertToken(tokenDto);
        logger.info("비밀번호 재설정 토큰 생성 완료 - userId: {}, token: {}", userId, token);

        return token;
    }

    /**
     * 토큰 유효성 검증
     * @param token 검증할 토큰
     * @return 토큰 정보 (유효하지 않으면 null)
     */
    public PasswordResetTokenDto validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }

        PasswordResetTokenDto tokenDto = tokenMapper.findByToken(token);
        if (tokenDto == null) {
            logger.warn("비밀번호 재설정 토큰을 찾을 수 없음 - token: {}", token);
            return null;
        }

        if (tokenDto.getExpiresAt().isBefore(LocalDateTime.now())) {
            logger.warn("비밀번호 재설정 토큰 만료 - token: {}, expiresAt: {}", token, tokenDto.getExpiresAt());
            return null;
        }

        return tokenDto;
    }

    /**
     * 비밀번호 재설정
     * @param token 재설정 토큰
     * @param newPassword 새 비밀번호
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 토큰 검증
        PasswordResetTokenDto tokenDto = validateToken(token);
        if (tokenDto == null) {
            throw new BusinessException("유효하지 않거나 만료된 토큰입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(newPassword);

        // 비밀번호 업데이트
        int result = userMapper.updatePassword(tokenDto.getUserId(), encodedPassword);
        if (result <= 0) {
            throw new BusinessException("비밀번호 재설정에 실패했습니다.");
        }

        // 토큰 삭제 (한 번만 사용 가능)
        tokenMapper.deleteByUserId(tokenDto.getUserId());

        logger.info("비밀번호 재설정 완료 - userId: {}", tokenDto.getUserId());
    }

    /**
     * 만료된 토큰 정리 (스케줄러에서 주기적으로 호출 가능)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        int deletedCount = tokenMapper.deleteExpiredTokens();
        if (deletedCount > 0) {
            logger.info("만료된 비밀번호 재설정 토큰 삭제 완료 - count: {}", deletedCount);
        }
    }
}

