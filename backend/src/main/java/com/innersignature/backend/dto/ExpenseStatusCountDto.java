package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 결의서 상태별 카운트 DTO
 */
@Data
public class ExpenseStatusCountDto {
    private Long waitCount;       // 대기 중
    private Long approvedCount;   // 승인됨
    private Long rejectedCount;   // 반려됨
    private Long paidCount;       // 지급 완료
    private Long totalCount;      // 전체
}

