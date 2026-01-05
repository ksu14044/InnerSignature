package com.innersignature.backend.service;

import com.innersignature.backend.dto.ExpenseCategoryDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.ExpenseCategoryMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseCategoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(ExpenseCategoryService.class);
    private final ExpenseCategoryMapper expenseCategoryMapper;
    
    /**
     * 전역 기본값 항목 목록 조회 (SUPERADMIN용)
     */
    public List<ExpenseCategoryDto> getGlobalCategories() {
        return expenseCategoryMapper.findGlobalCategories();
    }
    
    /**
     * 회사별 항목 목록 조회
     */
    public List<ExpenseCategoryDto> getCompanyCategories(Long companyId) {
        return expenseCategoryMapper.findByCompanyId(companyId);
    }
    
    /**
     * 전역 + 회사별 항목 병합 조회 (전역 기본값 상속 + 회사별 오버라이드)
     */
    public List<ExpenseCategoryDto> getMergedCategories(Long companyId) {
        return expenseCategoryMapper.findMergedCategories(companyId);
    }
    
    /**
     * 항목 생성
     */
    @Transactional
    public ExpenseCategoryDto createCategory(ExpenseCategoryDto category) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        Long currentUserId = SecurityUtil.getCurrentUserId();
        
        // 중복 확인
        boolean exists = expenseCategoryMapper.existsByName(category.getCategoryName(), companyId);
        if (exists) {
            throw new BusinessException("이미 존재하는 항목명입니다.");
        }
        
        category.setCompanyId(companyId);
        category.setCreatedBy(currentUserId);
        
        // display_order 설정 (없으면 최대값 + 1)
        if (category.getDisplayOrder() == null) {
            Integer maxOrder = expenseCategoryMapper.getMaxDisplayOrder(companyId);
            category.setDisplayOrder(maxOrder != null ? maxOrder + 1 : 0);
        }
        
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        
        int result = expenseCategoryMapper.insert(category);
        if (result > 0) {
            logger.info("항목 생성 완료 - categoryId: {}", category.getCategoryId());
            return expenseCategoryMapper.findById(category.getCategoryId(), companyId);
        } else {
            throw new BusinessException("항목 생성에 실패했습니다.");
        }
    }
    
    /**
     * 항목 수정
     */
    @Transactional
    public ExpenseCategoryDto updateCategory(ExpenseCategoryDto category) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        ExpenseCategoryDto existing = expenseCategoryMapper.findById(category.getCategoryId(), companyId);
        if (existing == null) {
            throw new BusinessException("항목을 찾을 수 없습니다.");
        }
        
        // 항목명 변경 시 중복 확인
        if (!existing.getCategoryName().equals(category.getCategoryName())) {
            boolean exists = expenseCategoryMapper.existsByName(category.getCategoryName(), companyId);
            if (exists) {
                throw new BusinessException("이미 존재하는 항목명입니다.");
            }
        }
        
        category.setCompanyId(companyId);
        int result = expenseCategoryMapper.update(category);
        if (result > 0) {
            logger.info("항목 수정 완료 - categoryId: {}", category.getCategoryId());
            return expenseCategoryMapper.findById(category.getCategoryId(), companyId);
        } else {
            throw new BusinessException("항목 수정에 실패했습니다.");
        }
    }
    
    /**
     * 항목 삭제 (비활성화)
     */
    @Transactional
    public void deleteCategory(Long categoryId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        int result = expenseCategoryMapper.delete(categoryId, companyId);
        if (result == 0) {
            throw new BusinessException("항목을 찾을 수 없습니다.");
        }
        logger.info("항목 삭제 완료 - categoryId: {}", categoryId);
    }
    
    /**
     * 항목 순서 변경
     */
    @Transactional
    public void updateDisplayOrder(Long categoryId, Integer displayOrder) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        int result = expenseCategoryMapper.updateDisplayOrder(categoryId, displayOrder, companyId);
        if (result == 0) {
            throw new BusinessException("항목을 찾을 수 없습니다.");
        }
        logger.info("항목 순서 변경 완료 - categoryId: {}, displayOrder: {}", categoryId, displayOrder);
    }
    
    /**
     * 항목 순서 일괄 변경 (드래그 앤 드롭)
     */
    @Transactional
    public void reorderCategories(List<Long> categoryIds) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        for (int i = 0; i < categoryIds.size(); i++) {
            expenseCategoryMapper.updateDisplayOrder(categoryIds.get(i), i, companyId);
        }
        logger.info("항목 순서 일괄 변경 완료 - 항목 수: {}", categoryIds.size());
    }
}

