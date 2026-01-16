package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 사용자별 지출 합계 DTO
 */
@Data
public class UserExpenseStatsDto {
    private Long userId;          // 사용자 ID
    private String userName;      // 사용자 이름
    private Long totalAmount;     // 총 지출 금액
    private Long itemCount;       // 건수
}

