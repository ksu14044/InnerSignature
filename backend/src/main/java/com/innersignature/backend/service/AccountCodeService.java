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
     * - SUPERADMIN: 전역 매핑만 생성 가능 (company_id = NULL)
     * - TAX_ACCOUNTANT: 회사별 매핑만 생성 가능 (company_id != NULL)
     */
    @Transactional
    public AccountCodeMappingDto createMapping(AccountCodeMappingDto mapping) {
        String role = SecurityUtil.getCurrentRole();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 권한 검증: SUPERADMIN은 전역 매핑만, TAX_ACCOUNTANT는 회사별 매핑만
        if ("SUPERADMIN".equals(role)) {
            if (companyId != null) {
                throw new BusinessException("SUPERADMIN은 전역 매핑(company_id = NULL)만 생성할 수 있습니다.");
            }
            mapping.setCompanyId(null); // 전역 매핑 강제
        } else if ("TAX_ACCOUNTANT".equals(role)) {
            if (companyId == null) {
                throw new BusinessException("TAX_ACCOUNTANT는 회사별 매핑(company_id != NULL)만 생성할 수 있습니다.");
            }
            mapping.setCompanyId(companyId); // 회사별 매핑 강제
        } else {
            throw new BusinessException("계정 과목 매핑 생성 권한이 없습니다.");
        }
        
        int result = accountCodeMappingMapper.insert(mapping);
        if (result > 0) {
            logger.info("계정 과목 매핑 생성 완료 - mappingId: {}, companyId: {}, role: {}", 
                mapping.getMappingId(), mapping.getCompanyId(), role);
            return accountCodeMappingMapper.findById(mapping.getMappingId(), mapping.getCompanyId());
        } else {
            throw new BusinessException("계정 과목 매핑 생성에 실패했습니다.");
        }
    }
    
    /**
     * 계정 과목 매핑 수정
     * - SUPERADMIN: 전역 매핑만 수정 가능 (company_id = NULL)
     * - TAX_ACCOUNTANT: 회사별 매핑만 수정 가능 (company_id != NULL)
     */
    @Transactional
    public AccountCodeMappingDto updateMapping(Long mappingId, AccountCodeMappingDto mapping) {
        String role = SecurityUtil.getCurrentRole();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 기존 매핑 조회
        AccountCodeMappingDto existing = accountCodeMappingMapper.findById(mappingId, companyId);
        if (existing == null) {
            throw new BusinessException("계정 과목 매핑을 찾을 수 없습니다.");
        }
        
        // 권한 검증: SUPERADMIN은 전역 매핑만, TAX_ACCOUNTANT는 회사별 매핑만
        if ("SUPERADMIN".equals(role)) {
            if (existing.getCompanyId() != null) {
                throw new BusinessException("SUPERADMIN은 전역 매핑(company_id = NULL)만 수정할 수 있습니다.");
            }
            mapping.setCompanyId(null); // 전역 매핑 유지
        } else if ("TAX_ACCOUNTANT".equals(role)) {
            if (existing.getCompanyId() == null) {
                throw new BusinessException("TAX_ACCOUNTANT는 회사별 매핑(company_id != NULL)만 수정할 수 있습니다.");
            }
            if (!existing.getCompanyId().equals(companyId)) {
                throw new BusinessException("본인 회사의 매핑만 수정할 수 있습니다.");
            }
            mapping.setCompanyId(companyId); // 회사별 매핑 유지
        } else {
            throw new BusinessException("계정 과목 매핑 수정 권한이 없습니다.");
        }
        
        mapping.setMappingId(mappingId);
        
        int result = accountCodeMappingMapper.update(mapping);
        if (result > 0) {
            logger.info("계정 과목 매핑 수정 완료 - mappingId: {}, companyId: {}, role: {}", 
                mappingId, mapping.getCompanyId(), role);
            return accountCodeMappingMapper.findById(mappingId, mapping.getCompanyId());
        } else {
            throw new BusinessException("계정 과목 매핑 수정에 실패했습니다.");
        }
    }
    
    /**
     * 계정 과목 매핑 삭제
     * - SUPERADMIN: 전역 매핑만 삭제 가능 (company_id = NULL)
     * - TAX_ACCOUNTANT: 회사별 매핑만 삭제 가능 (company_id != NULL)
     */
    @Transactional
    public void deleteMapping(Long mappingId) {
        String role = SecurityUtil.getCurrentRole();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 기존 매핑 조회
        AccountCodeMappingDto existing = accountCodeMappingMapper.findById(mappingId, companyId);
        if (existing == null) {
            throw new BusinessException("계정 과목 매핑을 찾을 수 없습니다.");
        }
        
        // 권한 검증: SUPERADMIN은 전역 매핑만, TAX_ACCOUNTANT는 회사별 매핑만
        if ("SUPERADMIN".equals(role)) {
            if (existing.getCompanyId() != null) {
                throw new BusinessException("SUPERADMIN은 전역 매핑(company_id = NULL)만 삭제할 수 있습니다.");
            }
            companyId = null; // 전역 매핑 삭제
        } else if ("TAX_ACCOUNTANT".equals(role)) {
            if (existing.getCompanyId() == null) {
                throw new BusinessException("TAX_ACCOUNTANT는 회사별 매핑(company_id != NULL)만 삭제할 수 있습니다.");
            }
            if (!existing.getCompanyId().equals(companyId)) {
                throw new BusinessException("본인 회사의 매핑만 삭제할 수 있습니다.");
            }
            // companyId는 이미 설정됨
        } else {
            throw new BusinessException("계정 과목 매핑 삭제 권한이 없습니다.");
        }
        
        int result = accountCodeMappingMapper.delete(mappingId, companyId);
        if (result > 0) {
            logger.info("계정 과목 매핑 삭제 완료 - mappingId: {}, companyId: {}, role: {}", 
                mappingId, companyId, role);
        } else {
            throw new BusinessException("계정 과목 매핑 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 계정 과목 매핑 목록 조회
     * - SUPERADMIN: 전체 매핑 조회 (전역 + 모든 회사별)
     * - TAX_ACCOUNTANT: 전역 매핑 + 본인 회사 매핑 조회
     */
    public List<AccountCodeMappingDto> getMappingList() {
        String role = SecurityUtil.getCurrentRole();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        if ("SUPERADMIN".equals(role)) {
            // SUPERADMIN은 전체 매핑 조회
            return accountCodeMappingMapper.findAll();
        } else if ("TAX_ACCOUNTANT".equals(role)) {
            // TAX_ACCOUNTANT는 전역 매핑 + 본인 회사 매핑 조회
            return accountCodeMappingMapper.findByCompanyId(companyId);
        } else {
            throw new BusinessException("계정 과목 매핑 조회 권한이 없습니다.");
        }
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

