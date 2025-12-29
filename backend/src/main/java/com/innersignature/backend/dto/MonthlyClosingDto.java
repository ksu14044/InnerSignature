package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MonthlyClosingDto {
    private Long closingId;        // PK
    private Long companyId;         // 회사 ID
    private Integer closingYear;    // 마감 년도
    private Integer closingMonth;  // 마감 월 (1-12)
    private Long closedBy;         // 마감 처리한 사용자 ID
    private LocalDateTime closedAt; // 마감 일시
    private Boolean isClosed;       // 마감 여부
    private LocalDateTime createdAt; // 생성 시간
    private LocalDateTime updatedAt; // 수정 시간
    
    // 화면 표시용 추가 필드
    private String closedByName;   // 마감 처리한 사용자 이름
}

