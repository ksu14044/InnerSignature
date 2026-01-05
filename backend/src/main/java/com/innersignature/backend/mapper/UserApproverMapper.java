package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.UserApproverMappingDto;
import com.innersignature.backend.dto.UserDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserApproverMapper {
    /**
     * 사용자별 담당 결재자 매핑 조회
     */
    List<UserApproverMappingDto> findByUserId(@Param("userId") Long userId, @Param("companyId") Long companyId);
    
    /**
     * 담당 결재자 ID로 매핑 조회
     */
    List<UserApproverMappingDto> findByApproverId(@Param("approverId") Long approverId, @Param("companyId") Long companyId);
    
    /**
     * 특정 사용자의 특정 담당 결재자 매핑 조회
     */
    UserApproverMappingDto findByUserAndApprover(
        @Param("userId") Long userId, 
        @Param("approverId") Long approverId, 
        @Param("companyId") Long companyId
    );
    
    /**
     * 담당 결재자 매핑 생성
     */
    int insert(UserApproverMappingDto mapping);
    
    /**
     * 담당 결재자 매핑 수정
     */
    int update(UserApproverMappingDto mapping);
    
    /**
     * 담당 결재자 매핑 삭제 (비활성화)
     */
    int delete(@Param("mappingId") Long mappingId, @Param("companyId") Long companyId);
    
    /**
     * 사용자의 활성화된 담당 결재자 목록 조회 (결재자 정보 포함)
     */
    List<UserDto> findActiveApproversByUserId(@Param("userId") Long userId, @Param("companyId") Long companyId);
}

