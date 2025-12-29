package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.AuditRuleDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AuditRuleMapper {
    /**
     * 감사 규칙 조회
     */
    AuditRuleDto findById(@Param("ruleId") Long ruleId, @Param("companyId") Long companyId);
    
    /**
     * 회사별 활성화된 감사 규칙 목록 조회
     */
    List<AuditRuleDto> findActiveByCompanyId(@Param("companyId") Long companyId);
    
    /**
     * 회사별 감사 규칙 목록 조회
     */
    List<AuditRuleDto> findByCompanyId(@Param("companyId") Long companyId);
    
    /**
     * 감사 규칙 생성
     */
    int insert(AuditRuleDto rule);
    
    /**
     * 감사 규칙 수정
     */
    int update(AuditRuleDto rule);
    
    /**
     * 감사 규칙 삭제
     */
    int delete(@Param("ruleId") Long ruleId, @Param("companyId") Long companyId);
}

