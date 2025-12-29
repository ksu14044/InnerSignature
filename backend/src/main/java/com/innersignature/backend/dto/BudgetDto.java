package com.innersignature.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BudgetDto {
    private Long budgetId;          // PK
    private Long companyId;         // 회사 ID
    private Integer budgetYear;     // 예산 년도
    private Integer budgetMonth;    // 예산 월 (NULL이면 연간 예산)
    private String category;        // 카테고리
    private Long budgetAmount;      // 예산 금액
    private BigDecimal alertThreshold; // 경고 임계값 (퍼센트)
    private Boolean isBlocking;      // 초과 시 차단 여부
    private LocalDateTime createdAt; // 생성 시간
    private LocalDateTime updatedAt; // 수정 시간
    
    // 계산 필드 (조회 시 계산)
    private Long usedAmount;        // 사용 금액
    private BigDecimal usageRate;   // 사용률 (퍼센트)
}

