package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Schema(description = "결재 라인 정보")
@Data
public class ApprovalLineDto {
    @Schema(description = "결재 라인 ID", example = "1")
    private Long approvalLineId;  // PK
    
    @Schema(description = "지출결의서 ID", example = "1")
    private Long expenseReportId; // 문서 ID
    
    @Schema(description = "결재자 ID", example = "1", required = true)
    @NotNull(message = "결재자 ID는 필수입니다.")
    private Long approverId;      // 결재자 ID
    
    @Schema(description = "결재 순서", example = "1")
    private Integer stepOrder;    // 순서 (1, 2, 3)
    
    @Schema(description = "결재 상태", example = "APPROVED", allowableValues = {"WAIT", "PENDING", "APPROVED", "REJECTED"})
    private String status;        // 상태 (WAIT, APPROVED...)
    
    @Schema(description = "결재 일시", example = "2024-01-15T10:30:00")
    private LocalDateTime approvalDate; // 결재 일시
    
    @Schema(description = "서명 데이터 (Base64)", example = "data:image/png;base64,iVBORw0KG...")
    @Size(max = 5000000, message = "서명 데이터는 5MB 이하여야 합니다.")
    private String signatureData; // 서명 데이터 (Base64 Long Text)
    
    @Schema(description = "반려 사유", example = "금액 확인 필요")
    @Size(max = 500, message = "반려 사유는 500자 이하여야 합니다.")
    private String rejectionReason; // 반려 사유

    // --- DB 테이블에는 없지만 화면에 보여줄 때 필요한 필드 (JOIN용) ---
    private String approverName;  // 결재자 이름 (예: 박대표)
    private String approverPosition; // 결재자 직급
    
    private Long companyId; // 회사 ID
}