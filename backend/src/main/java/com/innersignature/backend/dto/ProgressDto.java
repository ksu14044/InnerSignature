package com.innersignature.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 작업 진행률 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDto {
    private int percentage;      // 0-100
    private String message;      // 진행 상황 메시지
    private boolean completed;   // 완료 여부
    private boolean failed;      // 실패 여부
    private String errorMessage; // 실패 시 에러 메시지
    private Long expenseId;      // 완료 시 expenseId (지출결의서 생성의 경우)
}

