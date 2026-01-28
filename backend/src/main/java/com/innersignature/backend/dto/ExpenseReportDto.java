package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "지출결의서 정보")
@Data
public class ExpenseReportDto {
    @Schema(description = "지출결의서 ID", example = "1")
    private Long expenseReportId; // PK
    
    @Schema(description = "작성자 ID", example = "1", required = true)
    @NotNull(message = "작성자 ID는 필수입니다.")
    private Long drafterId;       // 작성자 ID
    
    @Schema(description = "작성일", example = "2024-01-15")
    private LocalDate reportDate; // 작성일 (YYYY-MM-DD)
    
    @Schema(description = "제목", example = "1월 식대 및 간식비")
    private String title;         // 제목
    
    @Schema(description = "총 금액", example = "500000")
    @Positive(message = "총 금액은 양수여야 합니다.")
    private Long totalAmount;     // 총 합계 (결재 금액)
    
    @Schema(description = "실제 지급 금액", example = "500000")
    private Long actualPaidAmount; // 실제 지급 금액 (결재 금액과 다를 수 있음)
    
    @Schema(description = "금액 차이 사유", example = "할인 적용")
    private String amountDifferenceReason; // 금액 차이 사유
    
    @Schema(description = "문서 상태", example = "APPROVED", allowableValues = {"WAIT", "PENDING", "APPROVED", "REJECTED"})
    private String status;        // 문서 상태
    private LocalDate paymentReqDate; // 지급 요청일 (결의서 단위)
    private Boolean isPreApproval; // 가승인 요청 여부 (결의서 단위)
    private LocalDateTime createdAt;  // 시스템 등록 시간
    private LocalDateTime finalApprovalDate; // 최종 승인 완료일 (모든 결재자 승인 완료 시점)
    private Boolean taxProcessed;      // 세무처리 완료 여부
    private LocalDateTime taxProcessedAt; // 세무처리 완료 일시
    private LocalDateTime taxCollectedAt; // 세무사가 자료를 수집한 일시
    private Long taxCollectedBy; // 세무사가 자료를 수집한 사용자 ID
    private Boolean taxRevisionRequested; // 세무사가 수정 요청을 보냈는지 여부
    private String taxRevisionRequestReason; // 수정 요청 사유
    private Long companyId;            // 회사 ID

    // --- 화면 보여주기용 추가 필드 ---
    private String drafterName;   // 작성자 이름 (김신입)
    private String companyName;    // 회사명 (SUPERADMIN용)
    
    // 적요 요약 정보 (목록 표시용)
    private String firstDescription;  // 첫 번째 적요
    private Integer descriptionCount; // 적요 개수
    private String summaryDescription; // 가공된 요약 문자열 (예: "첫번째 적요 외 2개")
    
    // --- 1:N 관계 데이터 (상세화면 조회 시 사용) ---
    private List<ExpenseDetailDto> details;      // 상세 내역 리스트 (식대, 간식...)
    private List<ApprovalLineDto> approvalLines; // 결재 라인 리스트 (담당->전무->대표)
    private List<ReceiptDto> receipts;           // 영수증 리스트
}