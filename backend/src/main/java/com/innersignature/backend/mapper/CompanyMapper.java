package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.CompanySearchResultDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CompanyMapper {
    // 회사 코드로 조회
    CompanyDto findByCode(@Param("companyCode") String companyCode);
    
    // 회사 ID로 조회
    CompanyDto findById(@Param("companyId") Long companyId);
    
    // ADMIN이 등록한 회사 목록 조회
    List<CompanyDto> findByCreatedBy(@Param("adminUserId") Long adminUserId);
    
    // 회사명으로 검색 (LIKE, 회사명과 첫 번째 ADMIN 이름 반환)
    List<CompanySearchResultDto> searchByName(@Param("companyName") String companyName);
    
    // 회사 생성
    int insert(CompanyDto company);
    
    // 랜덤 회사 코드 생성 (중복 체크)
    String generateRandomCode();
    
    // 회사 코드 중복 확인
    boolean existsByCode(@Param("companyCode") String companyCode);
    
    // 회사의 구독 ID 업데이트
    int updateSubscriptionId(@Param("companyId") Long companyId, 
                             @Param("subscriptionId") Long subscriptionId);
}

