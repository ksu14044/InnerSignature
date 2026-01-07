package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.CompanyCardDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CompanyCardMapper {
    // 회사 카드 생성
    int insert(CompanyCardDto card);
    
    // 카드 ID로 조회
    CompanyCardDto findById(@Param("cardId") Long cardId);
    
    // 회사의 모든 카드 조회
    List<CompanyCardDto> findByCompanyId(@Param("companyId") Long companyId);
    
    // 회사의 활성 카드만 조회
    List<CompanyCardDto> findActiveByCompanyId(@Param("companyId") Long companyId);
    
    // 회사 카드 수정
    int update(CompanyCardDto card);
    
    // 회사 카드 삭제 (soft delete)
    int delete(@Param("cardId") Long cardId);
    
    // 회사 카드 비활성화
    int deactivate(@Param("cardId") Long cardId);
}


