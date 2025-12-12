package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 세무처리 현황 통계 DTO
 */
@Data
public class TaxStatusDto {
    private Long totalCount;          // 총 처리 대상 건수 (PAID 상태)
    private Long pendingCount;        // 세무처리 대기 건수 (PAID 상태이지만 taxProcessed=false)
    private Long completedCount;      // 세무처리 완료 건수 (taxProcessed=true)
    private Double completionRate;    // 세무처리 완료율 (0.0 ~ 1.0)
    private Long totalAmount;          // 총 금액
    private Long pendingAmount;        // 대기 건 총 금액
    private Long completedAmount;     // 완료 건 총 금액
}

