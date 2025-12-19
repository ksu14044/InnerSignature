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
    
    // 조인된 데이터
    private SubscriptionPlanDto plan;
    private CompanyDto company;
}

