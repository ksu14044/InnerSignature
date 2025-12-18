package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserCompanyDto {
    private Long userCompanyId;      // PK
    private Long userId;             // 사용자 ID
    private Long companyId;          // 회사 ID
    private String role;             // 해당 회사에서의 역할
    private String position;         // 해당 회사에서의 직급
    private Boolean isActive;        // 활성화 상태
    private Boolean isPrimary;       // 기본 회사 여부
    private String approvalStatus;    // 승인 상태 (PENDING, APPROVED, REJECTED)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조인을 위한 추가 필드
    private String koreanName;       // 사용자 이름
    private String username;         // 사용자 아이디
    private String email;            // 사용자 이메일
    private String companyName;      // 회사명
    private String companyCode;      // 회사 코드
}

