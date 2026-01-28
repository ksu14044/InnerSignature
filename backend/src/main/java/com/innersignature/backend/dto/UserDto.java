package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Schema(description = "사용자 정보")
@Data // Getter, Setter, ToString 등을 자동으로 만들어주는 롬복 어노테이션
public class UserDto {
    @Schema(description = "사용자 ID", example = "1")
    private Long userId;        // PK
    
    @Schema(description = "아이디", example = "user123", required = true)
    @NotBlank(message = "아이디는 필수입니다.")
    @Size(min = 3, max = 50, message = "아이디는 3자 이상 50자 이하여야 합니다.")
    private String username;    // 아이디
    
    @Schema(description = "비밀번호 (응답 시에는 null)", example = "password123", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;    // 비밀번호 (검증 규칙 없음 - 테스트 편의)
    
    @Schema(description = "이름", example = "김신입", required = true)
    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
    private String koreanName;  // 이름 (예: 김신입)
    
    @Schema(description = "이메일", example = "user@example.com")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
    private String email;       // 이메일 (선택적)
    
    @Schema(description = "직급", example = "대리")
    @Size(max = 50, message = "직급은 50자 이하여야 합니다.")
    private String position;    // 직급
    
    @Schema(description = "권한", example = "USER", allowableValues = {"USER", "ADMIN", "CEO", "ACCOUNTANT", "TAX_ACCOUNTANT", "SUPERADMIN"})
    private String role;        // 권한 (USER, ADMIN, CEO, TAX_ACCOUNTANT)
    private Boolean isActive;   // 활성화 상태
    private Boolean isApprover; // 결재자 지정 여부 (회사별)
    private String approvalStatus; // 승인 상태 (PENDING, APPROVED, REJECTED)
    private Long companyId;     // 회사 ID (nullable - ADMIN은 회사 등록 전 NULL 가능)
    private LocalDateTime createdAt;  // 생성 시간
    private LocalDateTime updatedAt;  // 수정 시간
}