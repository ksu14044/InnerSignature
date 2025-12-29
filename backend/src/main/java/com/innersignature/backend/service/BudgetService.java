package com.innersignature.backend.service;

import com.innersignature.backend.dto.BudgetDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.BudgetMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {
    
    private static final Logger logger = LoggerFactory.getLogger(BudgetService.class);
    private final BudgetMapper budgetMapper;
    
    /**
     * 예산 생성
     */
    @Transactional
    public BudgetDto createBudget(BudgetDto budget) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        budget.setCompanyId(companyId);
        
        // 기본값 설정
        if (budget.getAlertThreshold() == null) {
            budget.setAlertThreshold(new BigDecimal("80.00"));
        }
        if (budget.getIsBlocking() == null) {
            budget.setIsBlocking(false);
        }
        
        // 중복 체크
        BudgetDto existing = budgetMapper.findByCompanyAndCategory(
                companyId, budget.getBudgetYear(), budget.getBudgetMonth(), budget.getCategory());
        if (existing != null) {
            throw new BusinessException("해당 기간과 카테고리에 대한 예산이 이미 존재합니다.");
        }
        
        int result = budgetMapper.insert(budget);
        if (result > 0) {
            logger.info("예산 생성 완료 - budgetId: {}, category: {}", budget.getBudgetId(), budget.getCategory());
            return budgetMapper.findById(budget.getBudgetId(), companyId);
        } else {
            throw new BusinessException("예산 생성에 실패했습니다.");
        }
    }
    
    /**
     * 예산 수정
     */
    @Transactional
    public BudgetDto updateBudget(Long budgetId, BudgetDto budget) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        BudgetDto existing = budgetMapper.findById(budgetId, companyId);
        if (existing == null) {
            throw new BusinessException("예산을 찾을 수 없습니다.");
        }
        
        budget.setBudgetId(budgetId);
        budget.setCompanyId(companyId);
        budget.setBudgetYear(existing.getBudgetYear());
        budget.setBudgetMonth(existing.getBudgetMonth());
        budget.setCategory(existing.getCategory());
        
        int result = budgetMapper.update(budget);
        if (result > 0) {
            logger.info("예산 수정 완료 - budgetId: {}", budgetId);
            return budgetMapper.findById(budgetId, companyId);
        } else {
            throw new BusinessException("예산 수정에 실패했습니다.");
        }
    }
    
    /**
     * 예산 삭제
     */
    @Transactional
    public void deleteBudget(Long budgetId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        BudgetDto existing = budgetMapper.findById(budgetId, companyId);
        if (existing == null) {
            throw new BusinessException("예산을 찾을 수 없습니다.");
        }
        
        int result = budgetMapper.delete(budgetId, companyId);
        if (result > 0) {
            logger.info("예산 삭제 완료 - budgetId: {}", budgetId);
        } else {
            throw new BusinessException("예산 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 예산 목록 조회
     */
    public List<BudgetDto> getBudgetList(Integer year, Integer month) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return budgetMapper.findByCompanyId(companyId, year, month);
    }
    
    /**
     * 예산 체크 (지출결의서 상신 시 호출)
     * @param year 년도
     * @param month 월
     * @param category 카테고리
     * @param amount 지출 금액
     * @return 예산 체크 결과 (경고 메시지 또는 null)
     */
    public String checkBudget(Integer year, Integer month, String category, Long amount) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 월별 예산 우선 조회, 없으면 연간 예산 조회
        BudgetDto budget = budgetMapper.findByCompanyAndCategory(companyId, year, month, category);
        if (budget == null) {
            budget = budgetMapper.findByCompanyAndCategory(companyId, year, null, category);
        }
        
        if (budget == null) {
            return null; // 예산이 설정되지 않았으면 체크하지 않음
        }
        
        // 사용 금액 계산
        Long usedAmount = budgetMapper.calculateUsedAmount(companyId, year, month, category);
        Long newTotalAmount = usedAmount + amount;
        
        // 예산 초과 체크
        if (newTotalAmount > budget.getBudgetAmount()) {
            if (budget.getIsBlocking()) {
                throw new BusinessException(
                        String.format("%s 카테고리의 예산(%,d원)을 초과합니다. (현재 사용: %,d원, 신청 금액: %,d원)",
                                category, budget.getBudgetAmount(), usedAmount, amount));
            } else {
                return String.format("%s 카테고리의 예산(%,d원)을 초과합니다. (현재 사용: %,d원, 신청 금액: %,d원)",
                        category, budget.getBudgetAmount(), usedAmount, amount);
            }
        }
        
        // 경고 임계값 체크
        BigDecimal usageRate = new BigDecimal(newTotalAmount)
                .multiply(new BigDecimal("100"))
                .divide(new BigDecimal(budget.getBudgetAmount()), 2, java.math.RoundingMode.HALF_UP);
        
        if (usageRate.compareTo(budget.getAlertThreshold()) >= 0) {
            return String.format("%s 카테고리의 예산 사용률이 %.2f%%에 도달했습니다. (예산: %,d원, 사용: %,d원)",
                    category, usageRate, budget.getBudgetAmount(), newTotalAmount);
        }
        
        return null;
    }
}

