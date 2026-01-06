package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExpenseCategoryDto {
    private Long categoryId;      // PK
    private Long companyId;       // 회사 ID (NULL이면 전역)
    private String categoryName;  // 항목명
    private Integer displayOrder; // 표시 순서
    private Boolean isActive;    // 활성화 여부
    private Long createdBy;      // 생성자 ID
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조인을 위한 추가 필드
    private String createdByName; // 생성자 이름
    private Boolean isGlobal;     // 전역 항목 여부 (companyId가 NULL인지)
}


