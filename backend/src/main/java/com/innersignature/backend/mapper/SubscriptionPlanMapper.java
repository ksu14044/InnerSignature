package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.SubscriptionPlanDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SubscriptionPlanMapper {
    // 모든 활성 플랜 조회
    List<SubscriptionPlanDto> findAllActive();
    
    // 플랜 ID로 조회
    SubscriptionPlanDto findById(@Param("planId") Long planId);
    
    // 플랜 코드로 조회
    SubscriptionPlanDto findByCode(@Param("planCode") String planCode);
}

