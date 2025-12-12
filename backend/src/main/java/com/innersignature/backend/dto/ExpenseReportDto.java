package com.innersignature.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExpenseReportDto {
    private Long expenseReportId; // PK
    
    @NotNull(message = "작성자 ID는 필수입니다.")
    private Long drafterId;       // 작성자 ID
    
    private LocalDate reportDate; // 작성일 (YYYY-MM-DD)
    
    @NotBlank(message = "제목은 필수입니다.")
    private String title;         // 제목
    
    @Positive(message = "총 금액은 양수여야 합니다.")
    private Long totalAmount;     // 총 합계
    
    private String status;        // 문서 상태
    private LocalDate paymentReqDate; // 지급 요청일
    private LocalDateTime createdAt;  // 시스템 등록 시간
    private Boolean taxProcessed;      // 세무처리 완료 여부
    private LocalDateTime taxProcessedAt; // 세무처리 완료 일시
    private Boolean isSecret;           // 비밀글 여부

    // --- 화면 보여주기용 추가 필드 ---
    private String drafterName;   // 작성자 이름 (김신입)
    
    // --- 1:N 관계 데이터 (상세화면 조회 시 사용) ---
    private List<ExpenseDetailDto> details;      // 상세 내역 리스트 (식대, 간식...)
    private List<ApprovalLineDto> approvalLines; // 결재 라인 리스트 (담당->전무->대표)
    private List<ReceiptDto> receipts;           // 영수증 리스트
}