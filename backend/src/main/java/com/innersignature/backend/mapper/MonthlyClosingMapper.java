package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.MonthlyClosingDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MonthlyClosingMapper {
    /**
     * 월 마감 정보 조회
     */
    MonthlyClosingDto findById(@Param("closingId") Long closingId, @Param("companyId") Long companyId);
    
    /**
     * 회사별, 년도별, 월별 마감 정보 조회
     */
    MonthlyClosingDto findByCompanyAndDate(
            @Param("companyId") Long companyId,
            @Param("year") Integer year,
            @Param("month") Integer month);
    
    /**
     * 회사별 마감 목록 조회
     */
    List<MonthlyClosingDto> findByCompanyId(@Param("companyId") Long companyId);
    
    /**
     * 월 마감 정보 생성
     */
    int insert(MonthlyClosingDto closing);
    
    /**
     * 월 마감 정보 수정
     */
    int update(MonthlyClosingDto closing);
    
    /**
     * 마감 해제
     */
    int reopen(@Param("closingId") Long closingId, @Param("companyId") Long companyId);
    
    /**
     * 특정 월이 마감되었는지 확인
     */
    boolean isClosed(@Param("companyId") Long companyId, @Param("year") Integer year, @Param("month") Integer month);
}

