package com.innersignature.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CompanyCardDto {
    private Long cardId;                    // PK
    private Long companyId;                 // 회사 ID
    
    @NotBlank(message = "카드 별칭은 필수입니다.")
    @Size(max = 100, message = "카드 별칭은 100자 이하여야 합니다.")
    private String cardName;                // 카드 별칭 (예: 회사법인카드1)
    
    // @NotBlank 제거 - 수정 시에는 카드번호가 선택사항
    @Size(max = 19, message = "카드번호는 19자 이하여야 합니다.")
    private String cardNumber;              // 카드번호 (평문, 저장 시 암호화됨)
    
    private String cardNumberEncrypted;     // 암호화된 카드번호 (DB 저장용)
    private String cardLastFour;            // 마지막 4자리 (표시용)
    
    private Boolean isActive;              // 활성화 상태
    private Long createdBy;                 // 생성한 사용자 ID
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조인을 위한 추가 필드
    private String createdByName;           // 생성한 사용자 이름
    private String companyName;             // 회사명
}

