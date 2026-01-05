package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserApproverMappingDto {
    private Long mappingId;      // PK
    private Long userId;          // 사용자 ID
    private Long approverId;      // 담당 결재자 ID
    private Long companyId;      // 회사 ID
    private Integer priority;    // 우선순위 (낮을수록 우선)
    private Boolean isActive;    // 활성화 여부
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조인을 위한 추가 필드
    private String approverName;     // 결재자 이름
    private String approverPosition; // 결재자 직급
}

