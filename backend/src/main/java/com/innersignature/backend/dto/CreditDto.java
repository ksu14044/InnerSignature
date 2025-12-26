package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CreditDto {
    private Long creditId;
    private Long companyId;
    private Integer amount;
    private String reason;
    private Integer usedAmount;
    private LocalDate expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 계산된 필드
    public Integer getAvailableAmount() {
        if (amount == null || usedAmount == null) {
            return 0;
        }
        return Math.max(0, amount - usedAmount);
    }
    
    public boolean isExpired() {
        if (expiresAt == null) {
            return false; // 만료일 없음 = 만료 안됨
        }
        return expiresAt.isBefore(LocalDate.now());
    }
}

