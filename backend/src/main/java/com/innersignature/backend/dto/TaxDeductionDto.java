package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 세액 공제 정보 DTO
 */
@Data
public class TaxDeductionDto {
    private Long expenseReportId;     // 결의서 ID
    private Long expenseDetailId;     // 상세 항목 ID
    private String category;          // 비용 카테고리
    private Long amount;              // 원본 금액
    private Long deductionAmount;     // 공제 금액
    private boolean isDeductible;     // 공제 가능 여부
    private String deductionReason;   // 공제 사유
    private Long companyId;          // 회사 ID
}

