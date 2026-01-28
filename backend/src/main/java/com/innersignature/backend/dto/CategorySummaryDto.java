package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 카테고리별 금액/건수 요약 DTO (세무사용)
 */
@Schema(description = "카테고리별 요약 통계")
@Data
public class CategorySummaryDto {
    @Schema(description = "카테고리명", example = "식대")
    private String category;     // 카테고리명 (식대, 교통비, 비품비, 기타 등)
    
    @Schema(description = "카테고리별 총 금액", example = "1000000")
    private Long totalAmount;    // 카테고리별 총 금액 (detail.amount 합계)
    
    @Schema(description = "카테고리별 상세 항목 수", example = "50")
    private Long itemCount;      // 카테고리별 상세 항목 수
    
    @Schema(description = "카테고리를 포함하는 결의서 수", example = "20")
    private Long reportCount;    // 카테고리를 포함하는 결의서 수
}

