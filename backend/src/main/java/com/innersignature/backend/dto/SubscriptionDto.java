package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SubscriptionDto {
    private Long subscriptionId;
    private Long companyId;
    private Long planId;
    private String status;  // ACTIVE, EXPIRED, CANCELLED, TRIAL
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean autoRenew;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 플랜 변경 관련 필드
    private Long pendingPlanId;  // 대기 중인 플랜 ID (다운그레이드용)
    private LocalDate pendingChangeDate;  // 플랜 변경 예정일
    private Integer creditAmount;  // 크레딧 금액 (원)
    
    // 조인된 데이터
    private SubscriptionPlanDto plan;
    private SubscriptionPlanDto pendingPlan;  // 대기 중인 플랜 정보
    private CompanyDto company;
}

