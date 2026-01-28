package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "구독 정보")
@Data
public class SubscriptionDto {
    @Schema(description = "구독 ID", example = "1")
    private Long subscriptionId;
    
    @Schema(description = "회사 ID", example = "1")
    private Long companyId;
    
    @Schema(description = "플랜 ID", example = "1")
    private Long planId;
    
    @Schema(description = "구독 상태", example = "ACTIVE", allowableValues = {"ACTIVE", "EXPIRED", "CANCELLED", "TRIAL"})
    private String status;  // ACTIVE, EXPIRED, CANCELLED, TRIAL
    
    @Schema(description = "시작일", example = "2024-01-01")
    private LocalDate startDate;
    
    @Schema(description = "종료일", example = "2024-12-31")
    private LocalDate endDate;
    
    @Schema(description = "자동 갱신 여부", example = "true")
    private Boolean autoRenew;
    
    @Schema(description = "생성 일시", example = "2024-01-01T00:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-01T00:00:00")
    private LocalDateTime updatedAt;
    
    @Schema(description = "대기 중인 플랜 ID (다운그레이드용)", example = "2")
    private Long pendingPlanId;  // 대기 중인 플랜 ID (다운그레이드용)
    
    @Schema(description = "플랜 변경 예정일", example = "2024-12-31")
    private LocalDate pendingChangeDate;  // 플랜 변경 예정일
    
    @Schema(description = "크레딧 금액 (원)", example = "100000")
    private Integer creditAmount;  // 크레딧 금액 (원)
    
    @Schema(description = "플랜 정보")
    private SubscriptionPlanDto plan;
    
    @Schema(description = "대기 중인 플랜 정보")
    private SubscriptionPlanDto pendingPlan;  // 대기 중인 플랜 정보
    
    @Schema(description = "회사 정보")
    private CompanyDto company;
}

