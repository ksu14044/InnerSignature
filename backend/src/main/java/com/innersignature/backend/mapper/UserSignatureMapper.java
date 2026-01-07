package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.UserSignatureDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserSignatureMapper {
    // 서명/도장 생성
    int insert(UserSignatureDto signature);
    
    // 서명/도장 ID로 조회
    UserSignatureDto findById(@Param("signatureId") Long signatureId, @Param("companyId") Long companyId);
    
    // 사용자의 모든 서명/도장 조회
    List<UserSignatureDto> findByUserId(@Param("userId") Long userId, @Param("companyId") Long companyId);
    
    // 사용자의 기본 서명/도장 조회
    UserSignatureDto findDefaultByUserId(@Param("userId") Long userId, @Param("companyId") Long companyId);
    
    // 서명/도장 수정
    int update(UserSignatureDto signature);
    
    // 서명/도장 삭제
    int delete(@Param("signatureId") Long signatureId, @Param("companyId") Long companyId);
    
    // 사용자의 다른 서명/도장들의 기본 해제
    int clearDefaultByUserId(@Param("userId") Long userId, @Param("companyId") Long companyId);
}

