package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.ExpenseCategoryDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExpenseCategoryMapper {
    /**
     * 항목 ID로 조회
     */
    ExpenseCategoryDto findById(@Param("categoryId") Long categoryId, @Param("companyId") Long companyId);
    
    /**
     * 전역 기본값 항목 목록 조회
     */
    List<ExpenseCategoryDto> findGlobalCategories();
    
    /**
     * 회사별 항목 목록 조회
     */
    List<ExpenseCategoryDto> findByCompanyId(@Param("companyId") Long companyId);
    
    /**
     * 전역 + 회사별 항목 병합 조회 (전역 기본값 상속 + 회사별 오버라이드)
     */
    List<ExpenseCategoryDto> findMergedCategories(@Param("companyId") Long companyId);
    
    /**
     * 항목명 중복 확인 (회사별)
     */
    boolean existsByName(@Param("categoryName") String categoryName, @Param("companyId") Long companyId);
    
    /**
     * 항목 생성
     */
    int insert(ExpenseCategoryDto category);
    
    /**
     * 항목 수정
     */
    int update(ExpenseCategoryDto category);
    
    /**
     * 항목 삭제 (비활성화)
     */
    int delete(@Param("categoryId") Long categoryId, @Param("companyId") Long companyId);
    
    /**
     * 항목 순서 변경
     */
    int updateDisplayOrder(@Param("categoryId") Long categoryId, @Param("displayOrder") Integer displayOrder, @Param("companyId") Long companyId);
    
    /**
     * 회사별 최대 display_order 조회
     */
    Integer getMaxDisplayOrder(@Param("companyId") Long companyId);
}

