package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 사용자별 결의서 통계 DTO
 */
@Data
public class UserExpenseStatsDto {
    private Long userId;          // 사용자 ID
    private String userName;      // 사용자 이름
    private Long totalCount;      // 전체 결의서 수
    private Long totalAmount;     // 전체 금액
    private Long approvedCount;   // 승인된 결의서 수
    private Long pendingCount;    // 대기 중인 결의서 수
    private Long rejectedCount;   // 반려된 결의서 수
    private Double approvalRate;  // 승인율 (0.0 ~ 1.0)
}
