package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AccountCodeMappingDto {
    private Long mappingId;        // PK
    private Long companyId;        // 회사 ID (NULL이면 전역 설정)
    private String category;       // 카테고리
    private String merchantKeyword; // 가맹점명 키워드
    private String accountCode;    // 계정 과목 코드
    private String accountName;     // 계정 과목명
    private LocalDateTime createdAt; // 생성 시간
    private LocalDateTime updatedAt; // 수정 시간
}

