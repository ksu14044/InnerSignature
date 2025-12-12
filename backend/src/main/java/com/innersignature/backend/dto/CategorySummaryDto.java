package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 카테고리별 금액/건수 요약 DTO (세무사용)
 */
@Data
public class CategorySummaryDto {
    private String category;     // 카테고리명 (식대, 교통비, 비품비, 기타 등)
    private Long totalAmount;    // 카테고리별 총 금액 (detail.amount 합계)
    private Long itemCount;      // 카테고리별 상세 항목 수
    private Long reportCount;    // 카테고리를 포함하는 결의서 수
}

