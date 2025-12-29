package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogDto {
    private Long auditLogId;        // PK
    private Long expenseReportId;   // 지출결의서 ID
    private Long ruleId;            // 규칙 ID
    private String severity;        // 심각도
    private String message;         // 감사 메시지
    private LocalDateTime detectedAt; // 탐지 일시
    private Boolean isResolved;     // 해결 여부
    private LocalDateTime resolvedAt; // 해결 일시
    private Long resolvedBy;        // 해결한 사용자 ID
    
    // 조인 필드
    private String ruleName;        // 규칙명
    private String expenseTitle;    // 지출결의서 제목
    private String resolvedByName;  // 해결한 사용자 이름
}

