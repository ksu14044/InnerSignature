package com.innersignature.backend.dto;

import lombok.Data;

@Data
public class CompanySearchResultDto {
    private Long companyId;
    private String companyName;
    private String businessRegNo;  // 사업자등록번호
    private String representativeName;  // 대표자 이름
    private String adminName;  // 첫 번째 ADMIN 이름 (korean_name)
}

