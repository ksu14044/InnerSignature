package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 카테고리별 비율 DTO
 */
@Data
public class CategoryRatioDto {
    private String category;        // 카테고리명
    private Long amount;           // 금액
    private Double ratio;          // 비율 (0.0 ~ 1.0)
}

