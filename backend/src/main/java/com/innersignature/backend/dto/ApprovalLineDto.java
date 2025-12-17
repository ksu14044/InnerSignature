package com.innersignature.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApprovalLineDto {
    private Long approvalLineId;  // PK
    private Long expenseReportId; // 문서 ID
    
    @NotNull(message = "결재자 ID는 필수입니다.")
    private Long approverId;      // 결재자 ID
    
    private Integer stepOrder;    // 순서 (1, 2, 3)
    private String status;        // 상태 (WAIT, APPROVED...)
    private LocalDateTime approvalDate; // 결재 일시
    
    @Size(max = 10000, message = "서명 데이터는 10000자 이하여야 합니다.")
    private String signatureData; // 서명 데이터 (Base64 Long Text)
    
    @Size(max = 500, message = "반려 사유는 500자 이하여야 합니다.")
    private String rejectionReason; // 반려 사유

    // --- DB 테이블에는 없지만 화면에 보여줄 때 필요한 필드 (JOIN용) ---
    private String approverName;  // 결재자 이름 (예: 박대표)
    private String approverPosition; // 결재자 직급
    
    private Long companyId; // 회사 ID
}