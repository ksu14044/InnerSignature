package com.innersignature.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal; // 금액 계산용

@Data
public class ExpenseDetailDto {
    private Long expenseDetailId; // PK
    private Long expenseReportId; // 부모 문서 ID
    
    @NotBlank(message = "항목은 필수입니다.")
    @Size(max = 50, message = "항목은 50자 이하여야 합니다.")
    private String category;      // 항목 (식대, 교통비)
    
    @Size(max = 500, message = "적요는 500자 이하여야 합니다.")
    private String description;   // 적요
    
    @NotNull(message = "금액은 필수입니다.")
    @Positive(message = "금액은 양수여야 합니다.")
    private Long amount;          // 금액 (원 단위라 Long 사용)
    
    @Size(max = 1000, message = "비고는 1000자 이하여야 합니다.")
    private String note;          // 비고
}