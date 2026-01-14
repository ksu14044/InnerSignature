package com.innersignature.backend.dto;

import lombok.Data;
import java.util.List;

/**
 * 월별 상세 통계 DTO
 */
@Data
public class MonthlyDetailedStatsDto {
    private String yearMonth;                    // 년월 (YYYY-MM)
    private Long totalAmount;                    // 월 총 금액
    private List<CategoryBreakdownDto> categoryBreakdown;  // 카테고리별 내역
    private List<UserExpenseDto> topSpenders;   // 상위 지출자 (선택적)

    @Data
    public static class CategoryBreakdownDto {
        private String name;      // 카테고리명
        private Long amount;      // 금액
        private Double ratio;     // 비율 (0.0 ~ 100.0)
    }

    @Data
    public static class UserExpenseDto {
        private String name;      // 사용자명
        private Long amount;      // 지출 금액
    }
}
