package com.innersignature.backend.service;

import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.CompanySearchResultDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.CompanyMapper;
import com.innersignature.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CompanyService {
    
    private static final Logger logger = LoggerFactory.getLogger(CompanyService.class);
    private final CompanyMapper companyMapper;
    private final UserMapper userMapper;
    private final com.innersignature.backend.service.SubscriptionService subscriptionService;
    private final com.innersignature.backend.service.SubscriptionPlanService subscriptionPlanService;
    private final Random random = new Random();
    
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;
    
    public CompanyDto findByCode(String companyCode) {
        return companyMapper.findByCode(companyCode);
    }
    
    public CompanyDto findById(Long companyId) {
        return companyMapper.findById(companyId);
    }
    
    public List<CompanyDto> findByCreatedBy(Long adminUserId) {
        return companyMapper.findByCreatedBy(adminUserId);
    }
    
    /**
     * 사용자가 소속된 회사 목록 조회
     * @param userId 사용자 ID
     * @return 소속된 회사 목록
     */
    public List<CompanyDto> findByUserId(Long userId) {
        return userMapper.findCompaniesByUserId(userId);
    }
    
    private static final int MIN_SEARCH_LENGTH = 2;
    private static final int MAX_SEARCH_LENGTH = 50;
    
    public List<CompanySearchResultDto> searchByName(String companyName) {
        if (companyName == null || companyName.trim().isEmpty()) {
            return List.of();
        }
        
        String trimmedName = companyName.trim();
        
        // 최소 길이 검증
        if (trimmedName.length() < MIN_SEARCH_LENGTH) {
            logger.warn("검색어가 너무 짧습니다. 최소 {}자 이상 입력해주세요. - searchQuery: {}", MIN_SEARCH_LENGTH, trimmedName);
            return List.of();
        }
        
        // 최대 길이 검증
        if (trimmedName.length() > MAX_SEARCH_LENGTH) {
            logger.warn("검색어가 너무 깁니다. 최대 {}자까지 입력 가능합니다. - searchQuery length: {}", MAX_SEARCH_LENGTH, trimmedName.length());
            trimmedName = trimmedName.substring(0, MAX_SEARCH_LENGTH);
        }
        
        // 특수문자 제거 (SQL Injection 방지 및 검색 최적화)
        // 한글, 영문, 숫자, 공백만 허용
        String sanitized = trimmedName.replaceAll("[^가-힣a-zA-Z0-9\\s-]", "");
        
        if (sanitized.isEmpty()) {
            return List.of();
        }
        
        return companyMapper.searchByName(sanitized);
    }
    
    public boolean existsByBusinessRegNo(String businessRegNo) {
        if (businessRegNo == null || businessRegNo.trim().isEmpty()) {
            return false;
        }
        return companyMapper.existsByBusinessRegNo(businessRegNo.trim());
    }
    
    @Transactional
    public CompanyDto createCompany(String companyName, String businessRegNo, String representativeName, Long adminUserId) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new BusinessException("회사명은 필수입니다.");
        }
        
        if (businessRegNo == null || businessRegNo.trim().isEmpty()) {
            throw new BusinessException("사업자등록번호는 필수입니다.");
        }
        
        if (representativeName == null || representativeName.trim().isEmpty()) {
            throw new BusinessException("대표자 이름은 필수입니다.");
        }
        
        // 사업자등록번호 중복 체크
        String trimmedBusinessRegNo = businessRegNo.trim();
        if (companyMapper.existsByBusinessRegNo(trimmedBusinessRegNo)) {
            throw new BusinessException("이미 등록된 사업자등록번호입니다.");
        }
        
        // 회사 코드 생성 (중복 체크)
        String companyCode = generateCompanyCode();
        
        CompanyDto company = new CompanyDto();
        company.setCompanyCode(companyCode);
        company.setCompanyName(companyName.trim());
        company.setBusinessRegNo(trimmedBusinessRegNo);
        company.setRepresentativeName(representativeName.trim());
        company.setCreatedBy(adminUserId);
        company.setIsActive(true);
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        
        int result = companyMapper.insert(company);
        if (result > 0) {
            // 회사 생성 후 기본 FREE 플랜 할당
            try {
                com.innersignature.backend.dto.SubscriptionPlanDto freePlan = 
                    subscriptionPlanService.findByCode("FREE");
                subscriptionService.createSubscription(
                    company.getCompanyId(), freePlan.getPlanId(), false);
                logger.info("기본 FREE 플랜 할당 완료 - companyId: {}", company.getCompanyId());
            } catch (Exception e) {
                logger.warn("기본 FREE 플랜 할당 실패 - companyId: {}, error: {}", 
                    company.getCompanyId(), e.getMessage());
                // 플랜 할당 실패해도 회사 생성은 성공으로 처리
            }
            
            logger.info("회사 생성 완료 - companyId: {}, companyName: {}, createdBy: {}", 
                company.getCompanyId(), company.getCompanyName(), adminUserId);
            return company;
        } else {
            throw new BusinessException("회사 생성에 실패했습니다.");
        }
    }
    
    public String generateCompanyCode() {
        int maxAttempts = 100;
        for (int i = 0; i < maxAttempts; i++) {
            StringBuilder code = new StringBuilder();
            for (int j = 0; j < CODE_LENGTH; j++) {
                code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
            }
            String generatedCode = code.toString();
            
            if (!companyMapper.existsByCode(generatedCode)) {
                return generatedCode;
            }
        }
        throw new BusinessException("회사 코드 생성에 실패했습니다. 다시 시도해주세요.");
    }
    
    public void assignUserToCompany(Long userId, Long companyId) {
        // 이 메서드는 UserService에서 사용할 수 있도록 제공
        // 실제 구현은 UserService에서 처리
    }
    
    /**
     * 전체 회사 목록 조회 (SUPERADMIN 전용)
     */
    public List<CompanyDto> getAllCompanies() {
        return companyMapper.findAll();
    }
    
    /**
     * 회사 활성화 상태 변경 (SUPERADMIN 전용)
     */
    @Transactional
    public void updateCompanyStatus(Long companyId, Boolean isActive, Long operatorId) {
        CompanyDto company = companyMapper.findById(companyId);
        if (company == null) {
            throw new BusinessException("회사를 찾을 수 없습니다.");
        }
        
        int result = companyMapper.updateIsActive(companyId, isActive);
        if (result > 0) {
            logger.info("회사 상태 변경 완료 - companyId: {}, isActive: {}, operatorId: {}", companyId, isActive, operatorId);
            // 감사 로그 기록
            com.innersignature.backend.util.SecurityLogger.companyManagement(
                "UPDATE_STATUS", operatorId, companyId, 
                String.format("isActive=%s", isActive)
            );
        } else {
            throw new BusinessException("회사 상태 변경에 실패했습니다.");
        }
    }
}

