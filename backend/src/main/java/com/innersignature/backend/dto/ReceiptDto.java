package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReceiptDto {
    private Long receiptId;
    private Long expenseReportId;
    private Long expenseDetailId; // 지출 상세 내역 ID
    private String filePath;
    private String originalFilename;
    private Long fileSize;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
    
    // 화면 표시용
    private String uploadedByName; // 업로드한 사용자 이름
    
    private Long companyId; // 회사 ID
}

