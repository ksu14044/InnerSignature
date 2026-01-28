package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 대시보드 전체 요약 통계 DTO
 */
@Schema(description = "대시보드 전체 요약 통계")
@Data
public class DashboardStatsDto {
    @Schema(description = "총 금액", example = "5000000")
    private Long totalAmount;      // 총 금액
    
    @Schema(description = "총 건수", example = "100")
    private Long totalCount;       // 총 건수
    
    @Schema(description = "평균 금액", example = "50000")
    private Long averageAmount;    // 평균 금액
    
    @Schema(description = "최대 금액", example = "1000000")
    private Long maxAmount;        // 최대 금액
    
    @Schema(description = "최소 금액", example = "1000")
    private Long minAmount;        // 최소 금액
    
    @Schema(description = "진행 중 건수 (PENDING 상태)", example = "10")
    private Long pendingCount;     // 진행 중 건수 (PENDING 상태)
}

