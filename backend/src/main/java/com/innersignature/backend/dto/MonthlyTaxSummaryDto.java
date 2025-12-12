package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 월별 세무처리 집계 DTO
 */
@Data
public class MonthlyTaxSummaryDto {
    private String yearMonth;         // 년월 (예: "2024-01")
    private Long completedCount;      // 해당 월 세무처리 완료 건수
    private Long totalAmount;          // 해당 월 총 금액
    private Long completedAmount;      // 해당 월 세무처리 완료 금액
}

