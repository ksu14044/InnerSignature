package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentDto {
    private Long paymentId;
    private Long subscriptionId;
    private Integer amount;
    private String paymentMethod;
    private String paymentStatus;  // PENDING, COMPLETED, FAILED, REFUNDED
    private LocalDateTime paymentDate;
    private String externalPaymentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조인된 데이터
    private SubscriptionDto subscription;
}

