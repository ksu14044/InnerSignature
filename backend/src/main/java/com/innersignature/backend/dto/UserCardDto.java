package com.innersignature.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserCardDto {
    private Long cardId;                    // PK
    private Long userId;                    // 사용자 ID
    
    @NotBlank(message = "카드 별칭은 필수입니다.")
    @Size(max = 100, message = "카드 별칭은 100자 이하여야 합니다.")
    private String cardName;                // 카드 별칭 (예: 개인신용카드)
    
    @NotBlank(message = "카드번호는 필수입니다.")
    @Size(max = 19, message = "카드번호는 19자 이하여야 합니다.")
    private String cardNumber;              // 카드번호 (평문, 저장 시 암호화됨)
    
    private String cardNumberEncrypted;     // 암호화된 카드번호 (DB 저장용)
    private String cardLastFour;            // 마지막 4자리 (표시용)
    
    private Boolean isActive;               // 활성화 상태
    private Boolean isDefault;              // 기본 카드 여부
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조인을 위한 추가 필드
    private String userName;                 // 사용자 이름
}

