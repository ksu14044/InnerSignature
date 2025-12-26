package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.CreditDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface CreditMapper {
    // 크레딧 생성
    int insert(CreditDto credit);
    
    // 크레딧 ID로 조회
    CreditDto findById(@Param("creditId") Long creditId);
    
    // 회사의 모든 크레딧 조회
    List<CreditDto> findByCompanyId(@Param("companyId") Long companyId);
    
    // 회사의 사용 가능한 크레딧 조회 (만료되지 않고 사용 가능한 것만)
    List<CreditDto> findAvailableByCompanyId(@Param("companyId") Long companyId, 
                                            @Param("currentDate") LocalDate currentDate);
    
    // 크레딧 사용 금액 업데이트
    int updateUsedAmount(@Param("creditId") Long creditId, 
                        @Param("usedAmount") Integer usedAmount);
    
    // 회사의 총 사용 가능한 크레딧 금액 조회
    Integer getTotalAvailableAmount(@Param("companyId") Long companyId, 
                                   @Param("currentDate") LocalDate currentDate);
}

