package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.PasswordResetTokenDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PasswordResetTokenMapper {
    // 토큰 저장
    int insertToken(PasswordResetTokenDto tokenDto);

    // 토큰으로 조회
    PasswordResetTokenDto findByToken(@Param("token") String token);

    // 사용자 ID로 토큰 삭제 (만료된 토큰 정리용)
    int deleteByUserId(@Param("userId") Long userId);

    // 만료된 토큰 삭제
    int deleteExpiredTokens();
}

