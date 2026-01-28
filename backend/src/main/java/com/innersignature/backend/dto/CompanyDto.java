package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Schema(description = "회사 정보")
@Data
public class CompanyDto {
    @Schema(description = "회사 ID", example = "1")
    private Long companyId;
    
    @Schema(description = "회사 코드", example = "COMP001")
    private String companyCode;
    
    @Schema(description = "회사명", example = "내부서명 주식회사")
    private String companyName;
    
    @Schema(description = "사업자등록번호", example = "123-45-67890")
    private String businessRegNo;  // 사업자등록번호
    
    @Schema(description = "대표자 이름", example = "홍길동")
    private String representativeName;  // 대표자 이름
    
    @Schema(description = "생성자 ID", example = "1")
    private Long createdBy;  // 회사를 등록한 ADMIN의 user_id
    
    @Schema(description = "활성화 여부", example = "true")
    private Boolean isActive;
    
    @Schema(description = "현재 활성 구독 ID", example = "1")
    private Long subscriptionId;  // 현재 활성 구독 ID
    
    @Schema(description = "생성 일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-15T10:30:00")
    private LocalDateTime updatedAt;
}

