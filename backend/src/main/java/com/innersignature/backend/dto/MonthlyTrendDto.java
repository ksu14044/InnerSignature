package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 월별 지출 추이 DTO
 */
@Data
public class MonthlyTrendDto {
    private String yearMonth;      // 년월 (예: "2024-01")
    private Long totalAmount;      // 해당 월 총 금액
    private Long count;            // 해당 월 건수
}

