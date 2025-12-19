package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.SubscriptionDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface SubscriptionMapper {
    // 회사의 현재 활성 구독 조회
    SubscriptionDto findActiveByCompanyId(@Param("companyId") Long companyId);
    
    // 구독 ID로 조회
    SubscriptionDto findById(@Param("subscriptionId") Long subscriptionId);
    
    // 회사의 모든 구독 조회
    List<SubscriptionDto> findByCompanyId(@Param("companyId") Long companyId);
    
    // 구독 생성
    int insert(SubscriptionDto subscription);
    
    // 구독 업데이트
    int update(SubscriptionDto subscription);
    
    // 구독 상태 업데이트
    int updateStatus(@Param("subscriptionId") Long subscriptionId, 
                     @Param("status") String status,
                     @Param("companyId") Long companyId);
    
    // 만료된 구독 조회 (스케줄러용)
    List<SubscriptionDto> findExpiredSubscriptions(@Param("currentDate") LocalDate currentDate);
    
    // 만료 예정 구독 조회 (알림용)
    List<SubscriptionDto> findExpiringSoon(@Param("currentDate") LocalDate currentDate, 
                                          @Param("days") int days);
    
    // 전체 구독 목록 조회 (SUPERADMIN 전용)
    List<SubscriptionDto> findAll();
}

