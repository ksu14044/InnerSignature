package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Schema(description = "영수증 정보")
@Data
public class ReceiptDto {
    @Schema(description = "영수증 ID", example = "1")
    private Long receiptId;
    
    @Schema(description = "지출결의서 ID", example = "1")
    private Long expenseReportId;
    
    @Schema(description = "지출 상세 내역 ID", example = "1")
    private Long expenseDetailId; // 지출 상세 내역 ID
    
    @Schema(description = "파일 경로", example = "uploads/receipts/receipt_123.pdf")
    private String filePath;
    
    @Schema(description = "원본 파일명", example = "영수증_20240115.pdf")
    private String originalFilename;
    
    @Schema(description = "파일 크기 (bytes)", example = "1024000")
    private Long fileSize;
    
    @Schema(description = "업로드한 사용자 ID", example = "1")
    private Long uploadedBy;
    
    @Schema(description = "업로드 일시", example = "2024-01-15T10:30:00")
    private LocalDateTime uploadedAt;
    
    @Schema(description = "업로드한 사용자 이름", example = "김신입")
    private String uploadedByName; // 업로드한 사용자 이름
    
    @Schema(description = "회사 ID", example = "1")
    private Long companyId; // 회사 ID
}

