package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 대시보드 전체 요약 통계 DTO
 */
@Data
public class DashboardStatsDto {
    private Long totalAmount;      // 총 금액
    private Long totalCount;       // 총 건수
    private Long averageAmount;    // 평균 금액
    private Long maxAmount;        // 최대 금액
    private Long minAmount;        // 최소 금액
    private Long pendingCount;     // 진행 중 건수 (PENDING 상태)
}

