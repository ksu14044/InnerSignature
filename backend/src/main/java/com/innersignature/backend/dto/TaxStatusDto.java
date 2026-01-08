package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 세무 자료 수집 현황 통계 DTO
 */
@Data
public class TaxStatusDto {
    private Long totalCount;          // 총 대상 건수 (PAID 상태 결의서)
    private Long pendingCount;        // 미수집 건수 (PAID 상태이지만 taxProcessed=false)
    private Long completedCount;      // 수집 완료 건수 (taxProcessed=true)
    private Double completionRate;    // 수집률 (0.0 ~ 1.0)
    private Long totalAmount;          // 총 금액
    private Long pendingAmount;        // 미수집 총 금액
    private Long completedAmount;     // 수집 완료 총 금액
}

