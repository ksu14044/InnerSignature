package com.innersignature.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserSignatureDto {
    private Long signatureId;      // PK
    
    // userId와 companyId는 백엔드에서 자동 설정하므로 검증 제거
    private Long userId;            // 사용자 ID (백엔드에서 설정)
    
    @NotBlank(message = "서명/도장 이름은 필수입니다.")
    @Size(max = 100, message = "서명/도장 이름은 100자 이하여야 합니다.")
    private String signatureName;   // 서명/도장 이름
    
    @NotBlank(message = "서명/도장 타입은 필수입니다.")
    @Size(max = 20, message = "서명/도장 타입은 20자 이하여야 합니다.")
    private String signatureType;   // SIGNATURE 또는 STAMP
    
    @NotBlank(message = "서명/도장 데이터는 필수입니다.")
    @Size(max = 5000000, message = "서명 데이터는 5MB 이하여야 합니다.")
    private String signatureData;    // Base64 이미지 데이터
    
    private Boolean isDefault;      // 기본 서명/도장 여부
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // companyId는 백엔드에서 자동 설정하므로 검증 제거
    private Long companyId;         // 회사 ID (백엔드에서 설정)
}

