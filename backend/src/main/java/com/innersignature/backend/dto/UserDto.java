package com.innersignature.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

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
    
    private String role;        // 권한 (USER, ADMIN)
    private Boolean isActive;   // 활성화 상태
}