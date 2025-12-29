package com.innersignature.backend.service;

import com.innersignature.backend.dto.AccountCodeMappingDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.AccountCodeMappingMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountCodeService {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountCodeService.class);
    private final AccountCodeMappingMapper accountCodeMappingMapper;
    
    /**
     * 계정 과목 매핑 생성
     */
    @Transactional
    public AccountCodeMappingDto createMapping(AccountCodeMappingDto mapping) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        mapping.setCompanyId(companyId);
        
        int result = accountCodeMappingMapper.insert(mapping);
        if (result > 0) {
            logger.info("계정 과목 매핑 생성 완료 - mappingId: {}", mapping.getMappingId());
            return accountCodeMappingMapper.findById(mapping.getMappingId(), companyId);
        } else {
            throw new BusinessException("계정 과목 매핑 생성에 실패했습니다.");
        }
    }
    
    /**
     * 계정 과목 매핑 수정
     */
    @Transactional
    public AccountCodeMappingDto updateMapping(Long mappingId, AccountCodeMappingDto mapping) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        AccountCodeMappingDto existing = accountCodeMappingMapper.findById(mappingId, companyId);
        if (existing == null) {
            throw new BusinessException("계정 과목 매핑을 찾을 수 없습니다.");
        }
        
        mapping.setMappingId(mappingId);
        mapping.setCompanyId(companyId);
        
        int result = accountCodeMappingMapper.update(mapping);
        if (result > 0) {
            logger.info("계정 과목 매핑 수정 완료 - mappingId: {}", mappingId);
            return accountCodeMappingMapper.findById(mappingId, companyId);
        } else {
            throw new BusinessException("계정 과목 매핑 수정에 실패했습니다.");
        }
    }
    
    /**
     * 계정 과목 매핑 삭제
     */
    @Transactional
    public void deleteMapping(Long mappingId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        AccountCodeMappingDto existing = accountCodeMappingMapper.findById(mappingId, companyId);
        if (existing == null) {
            throw new BusinessException("계정 과목 매핑을 찾을 수 없습니다.");
        }
        
        int result = accountCodeMappingMapper.delete(mappingId, companyId);
        if (result > 0) {
            logger.info("계정 과목 매핑 삭제 완료 - mappingId: {}", mappingId);
        } else {
            throw new BusinessException("계정 과목 매핑 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 계정 과목 매핑 목록 조회
     */
    public List<AccountCodeMappingDto> getMappingList() {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return accountCodeMappingMapper.findByCompanyId(companyId);
    }
    
    /**
     * 카테고리와 가맹점명으로 계정 과목 추천
     */
    public AccountCodeMappingDto recommendAccountCode(String category, String merchantName) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 먼저 회사별 설정을 찾고, 없으면 전역 설정을 찾음
        AccountCodeMappingDto mapping = accountCodeMappingMapper.findByCategoryAndMerchant(
                companyId, category, merchantName);
        
        if (mapping == null) {
            // 기본 매핑 반환
            mapping = new AccountCodeMappingDto();
            mapping.setAccountCode("기타비용");
            mapping.setAccountName("기타비용");
        }
        
        return mapping;
    }
}

