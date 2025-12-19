package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CompanyDto {
    private Long companyId;
    private String companyCode;
    private String companyName;
    private Long createdBy;  // 회사를 등록한 ADMIN의 user_id
    private Boolean isActive;
    private Long subscriptionId;  // 현재 활성 구독 ID
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

