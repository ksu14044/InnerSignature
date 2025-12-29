package com.innersignature.backend.service;

import com.innersignature.backend.dto.AuditRuleDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.AuditRuleMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditRuleService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditRuleService.class);
    private final AuditRuleMapper auditRuleMapper;
    
    /**
     * 감사 규칙 생성
     */
    @Transactional
    public AuditRuleDto createRule(AuditRuleDto rule) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        rule.setCompanyId(companyId);
        
        if (rule.getIsActive() == null) {
            rule.setIsActive(true);
        }
        
        int result = auditRuleMapper.insert(rule);
        if (result > 0) {
            logger.info("감사 규칙 생성 완료 - ruleId: {}, ruleName: {}", rule.getRuleId(), rule.getRuleName());
            return auditRuleMapper.findById(rule.getRuleId(), companyId);
        } else {
            throw new BusinessException("감사 규칙 생성에 실패했습니다.");
        }
    }
    
    /**
     * 감사 규칙 수정
     */
    @Transactional
    public AuditRuleDto updateRule(Long ruleId, AuditRuleDto rule) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        AuditRuleDto existing = auditRuleMapper.findById(ruleId, companyId);
        if (existing == null) {
            throw new BusinessException("감사 규칙을 찾을 수 없습니다.");
        }
        
        rule.setRuleId(ruleId);
        rule.setCompanyId(companyId);
        rule.setRuleType(existing.getRuleType()); // 규칙 유형은 변경 불가
        
        int result = auditRuleMapper.update(rule);
        if (result > 0) {
            logger.info("감사 규칙 수정 완료 - ruleId: {}", ruleId);
            return auditRuleMapper.findById(ruleId, companyId);
        } else {
            throw new BusinessException("감사 규칙 수정에 실패했습니다.");
        }
    }
    
    /**
     * 감사 규칙 삭제
     */
    @Transactional
    public void deleteRule(Long ruleId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        AuditRuleDto existing = auditRuleMapper.findById(ruleId, companyId);
        if (existing == null) {
            throw new BusinessException("감사 규칙을 찾을 수 없습니다.");
        }
        
        int result = auditRuleMapper.delete(ruleId, companyId);
        if (result > 0) {
            logger.info("감사 규칙 삭제 완료 - ruleId: {}", ruleId);
        } else {
            throw new BusinessException("감사 규칙 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 활성화된 감사 규칙 목록 조회
     */
    public List<AuditRuleDto> getActiveRules() {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return auditRuleMapper.findActiveByCompanyId(companyId);
    }
    
    /**
     * 감사 규칙 목록 조회
     */
    public List<AuditRuleDto> getRuleList() {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return auditRuleMapper.findByCompanyId(companyId);
    }
}

