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
    
    public List<CompanySearchResultDto> searchByName(String companyName) {
        if (companyName == null || companyName.trim().isEmpty()) {
            return List.of();
        }
        return companyMapper.searchByName(companyName.trim());
    }
    
    @Transactional
    public CompanyDto createCompany(String companyName, Long adminUserId) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new BusinessException("회사명은 필수입니다.");
        }
        
        // 회사 코드 생성 (중복 체크)
        String companyCode = generateCompanyCode();
        
        CompanyDto company = new CompanyDto();
        company.setCompanyCode(companyCode);
        company.setCompanyName(companyName.trim());
        company.setCreatedBy(adminUserId);
        company.setIsActive(true);
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        
        int result = companyMapper.insert(company);
        if (result > 0) {
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
}

