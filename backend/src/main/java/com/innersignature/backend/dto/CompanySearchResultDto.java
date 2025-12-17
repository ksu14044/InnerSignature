package com.innersignature.backend.dto;

import lombok.Data;

@Data
public class CompanySearchResultDto {
    private Long companyId;
    private String companyName;
    private String adminName;  // 첫 번째 ADMIN 이름 (korean_name)
}

