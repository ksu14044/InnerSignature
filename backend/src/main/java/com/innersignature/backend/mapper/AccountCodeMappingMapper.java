package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.AccountCodeMappingDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AccountCodeMappingMapper {
    /**
     * 계정 과목 매핑 조회
     */
    AccountCodeMappingDto findById(@Param("mappingId") Long mappingId, @Param("companyId") Long companyId);
    
    /**
     * 카테고리와 가맹점명으로 계정 과목 추천
     */
    AccountCodeMappingDto findByCategoryAndMerchant(
            @Param("companyId") Long companyId,
            @Param("category") String category,
            @Param("merchantKeyword") String merchantKeyword);
    
    /**
     * 회사별 계정 과목 매핑 목록 조회
     */
    List<AccountCodeMappingDto> findByCompanyId(@Param("companyId") Long companyId);
    
    /**
     * 계정 과목 매핑 생성
     */
    int insert(AccountCodeMappingDto mapping);
    
    /**
     * 계정 과목 매핑 수정
     */
    int update(AccountCodeMappingDto mapping);
    
    /**
     * 계정 과목 매핑 삭제
     */
    int delete(@Param("mappingId") Long mappingId, @Param("companyId") Long companyId);
}

