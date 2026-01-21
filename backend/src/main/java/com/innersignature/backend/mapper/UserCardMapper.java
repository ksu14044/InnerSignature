package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.UserCardDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserCardMapper {
    // 개인 카드 생성
    int insert(UserCardDto card);
    
    // 카드 ID로 조회
    UserCardDto findById(@Param("cardId") Long cardId);
    
    // 사용자의 모든 카드 조회
    List<UserCardDto> findByUserId(@Param("userId") Long userId);
    
    // 사용자의 활성 카드만 조회
    List<UserCardDto> findActiveByUserId(@Param("userId") Long userId);
    
    // 사용자의 기본 카드 조회
    UserCardDto findDefaultByUserId(@Param("userId") Long userId);
    
    // 개인 카드 수정
    int update(UserCardDto card);
    
    // 개인 카드 삭제 (soft delete)
    int delete(@Param("cardId") Long cardId);
    
    // 개인 카드 비활성화
    int deactivate(@Param("cardId") Long cardId);
    
    // 사용자의 다른 카드들의 기본 카드 해제
    int clearDefaultByUserId(@Param("userId") Long userId);
}











