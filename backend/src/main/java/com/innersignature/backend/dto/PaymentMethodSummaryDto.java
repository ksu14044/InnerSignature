package com.innersignature.backend.dto;

import lombok.Data;

/**
 * 지출 수단별 금액 요약 DTO (세무사용)
 */
@Data
public class PaymentMethodSummaryDto {
    private String paymentMethod;  // 결제수단 (CASH, CARD, COMPANY_CARD, CHECK 등)
    private Long totalAmount;      // 해당 결제수단별 총 금액
    private Long itemCount;        // 해당 결제수단을 사용한 상세 항목 수
}

