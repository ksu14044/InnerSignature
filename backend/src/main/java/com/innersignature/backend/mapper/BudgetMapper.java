package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.BudgetDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BudgetMapper {
    /**
     * 예산 정보 조회
     */
    BudgetDto findById(@Param("budgetId") Long budgetId, @Param("companyId") Long companyId);
    
    /**
     * 회사별, 년도별, 월별, 카테고리별 예산 조회
     */
    BudgetDto findByCompanyAndCategory(
            @Param("companyId") Long companyId,
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("category") String category);
    
    /**
     * 회사별 예산 목록 조회
     */
    List<BudgetDto> findByCompanyId(
            @Param("companyId") Long companyId,
            @Param("year") Integer year,
            @Param("month") Integer month);
    
    /**
     * 예산 정보 생성
     */
    int insert(BudgetDto budget);
    
    /**
     * 예산 정보 수정
     */
    int update(BudgetDto budget);
    
    /**
     * 예산 정보 삭제
     */
    int delete(@Param("budgetId") Long budgetId, @Param("companyId") Long companyId);
    
    /**
     * 카테고리별 사용 금액 계산 (승인된 지출결의서 기준)
     */
    Long calculateUsedAmount(
            @Param("companyId") Long companyId,
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("category") String category);
}

