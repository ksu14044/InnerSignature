package com.innersignature.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data // Getter, Setter, ToString 등을 자동으로 만들어주는 롬복 어노테이션
public class UserDto {
    private Long userId;        // PK
    
    @NotBlank(message = "아이디는 필수입니다.")
    @Size(min = 3, max = 50, message = "아이디는 3자 이상 50자 이하여야 합니다.")
    private String username;    // 아이디
    
    private String password;    // 비밀번호 (검증 규칙 없음 - 테스트 편의)
    
    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
    private String koreanName;  // 이름 (예: 김신입)
    
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
    private String email;       // 이메일 (선택적)
    
    @Size(max = 50, message = "직급은 50자 이하여야 합니다.")
    private String position;    // 직급
    
    private String role;        // 권한 (USER, ADMIN, CEO, TAX_ACCOUNTANT)
    private Boolean isActive;   // 활성화 상태
    private Boolean isApprover; // 결재자 지정 여부 (회사별)
    private String approvalStatus; // 승인 상태 (PENDING, APPROVED, REJECTED)
    private Long companyId;     // 회사 ID (nullable - ADMIN은 회사 등록 전 NULL 가능)
    private LocalDateTime createdAt;  // 생성 시간
    private LocalDateTime updatedAt;  // 수정 시간
}