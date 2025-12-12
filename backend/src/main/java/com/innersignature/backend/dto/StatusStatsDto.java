package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 상태별 통계 DTO
 */
@Data
public class StatusStatsDto {
    private String status;         // 상태 (DRAFT, PENDING, APPROVED, REJECTED, PAID)
    private Long count;            // 건수
    private Long totalAmount;      // 총 금액
}

