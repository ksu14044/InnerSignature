package com.innersignature.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class SubscriptionCreateRequest {
    @NotNull(message = "플랜 ID는 필수입니다.")
    private Long planId;
    
    private Boolean autoRenew = true;
}

