package com.innersignature.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReceiptDto {
    private Long receiptId;
    private Long expenseReportId;
    private String filePath;
    private String originalFilename;
    private Long fileSize;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
    
    // 화면 표시용
    private String uploadedByName; // 업로드한 사용자 이름
}

