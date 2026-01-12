package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.ApprovalLineDto;
import com.innersignature.backend.dto.CategoryRatioDto;
import com.innersignature.backend.dto.CategorySummaryDto;
import com.innersignature.backend.dto.DashboardStatsDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.dto.MonthlyTaxSummaryDto;
import com.innersignature.backend.dto.MonthlyTrendDto;
import com.innersignature.backend.dto.PagedResponse;
import com.innersignature.backend.dto.ReceiptDto;
import com.innersignature.backend.dto.StatusStatsDto;
import com.innersignature.backend.dto.TaxStatusDto;
import com.innersignature.backend.service.ExpenseService;
import com.innersignature.backend.util.SecurityUtil;
import com.innersignature.backend.util.SecurityLogger;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Expense", description = "지출결의서 관리 API")
@RestController // "여기는 API 요청을 받는 곳입니다"
@RequestMapping("/api/expenses") // 모든 주소 앞에 /api/expenses 가 붙습니다.
@RequiredArgsConstructor
public class ExpenseController {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);
    private final ExpenseService expenseService;

    /**
     * 1. 목록 조회 API (페이지네이션 + 필터링)
     * 주소: GET /api/expenses?page=1&size=10&startDate=2024-01-01&endDate=2024-12-31&minAmount=1000&maxAmount=100000&status=APPROVED
     * @param page 페이지 번호 (1부터 시작, 기본값: 1)
     * @param size 페이지 크기 (기본값: 10)
     * @param startDate 작성일 시작일 (optional, 형식: YYYY-MM-DD)
     * @param endDate 작성일 종료일 (optional, 형식: YYYY-MM-DD)
     * @param minAmount 최소 금액 (optional)
     * @param maxAmount 최대 금액 (optional)
     * @param status 상태 배열 (optional, 여러 개 가능: ?status=APPROVED)
     * @param category 카테고리 (optional)
     * @param taxProcessed 세무처리 완료 여부 (optional, true: 완료, false: 미완료, null: 전체)
     */
    @Operation(summary = "지출결의서 목록 조회", description = "페이지네이션/필터 조건으로 지출결의 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<PagedResponse<ExpenseReportDto>> getExpenseList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long minAmount,
            @RequestParam(required = false) Long maxAmount,
            @RequestParam(required = false) String[] status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean taxProcessed,
            @RequestParam(required = false) String drafterName,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String cardNumber) {
        
        // 날짜 파라미터 변환
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }
        
        // 상태 배열을 List로 변환
        List<String> statusList = null;
        if (status != null && status.length > 0) {
            statusList = Arrays.stream(status)
                    .filter(s -> s != null && !s.isEmpty())
                    .collect(Collectors.toList());
            if (statusList.isEmpty()) {
                statusList = null;
            }
        }
        
        // 현재 사용자 ID 조회
        Long currentUserId = SecurityUtil.getCurrentUserId();
        
        // 서비스한테 "필터링된 페이지네이션된 목록 좀 줘" 라고 시킴
        PagedResponse<ExpenseReportDto> pagedResponse = expenseService.getExpenseList(
                page, size, startDateParsed, endDateParsed,
                minAmount, maxAmount, statusList, category,
                taxProcessed, drafterName, currentUserId, paymentMethod, cardNumber);
        
        // 약속된 포장지(ApiResponse)에 담아서 리턴
        return new ApiResponse<>(true, "목록 조회 성공", pagedResponse);
    }

    /**
     * 2. 상세 조회 API
     * 주소: GET /api/expenses/1 (숫자는 변함)
     */
    @Operation(summary = "지출결의서 단건 조회", description = "expenseId로 결의서 상세를 조회합니다.")
    @GetMapping("/{expenseId}")
    public ApiResponse<ExpenseReportDto> getExpenseDetail(@PathVariable Long expenseId) {
        // 현재 사용자 ID 조회
        Long currentUserId = SecurityUtil.getCurrentUserId();
        
        // 서비스한테 "1번 문서 상세 내용 다 가져와" 라고 시킴
        ExpenseReportDto detail = expenseService.getExpenseDetail(expenseId, currentUserId);
        
        if (detail == null) {
            return new ApiResponse<>(false, "해당 문서를 찾을 수 없습니다.", null);
        }
        
        return new ApiResponse<>(true, "상세 조회 성공", detail);
    }
    /**
     * 3. 결제 승인 API
     * POST /api/expenses/{expenseId}/approve
     */
    @Operation(summary = "결재 승인", description = "결의서를 승인하고 서명 데이터(옵션)를 남깁니다.")
    @PostMapping("/{expenseId}/approve")
    public ApiResponse<Void> approveExpense(
        @PathVariable Long expenseId,
        @Valid @RequestBody ApprovalLineDto request){
            Long currentUserId = SecurityUtil.getCurrentUserId();
            logger.info("결재 승인 요청 - expenseId: {}, approverId: {}", expenseId, currentUserId);
            expenseService.approveExpense(expenseId, currentUserId, request.getSignatureData());
            logger.info("결재 승인 완료 - expenseId: {}", expenseId);
            return new ApiResponse<Void>(true, "결제 승인 완료", null);
    }

    /**
     * 3-1. 결제 반려 API
     * POST /api/expenses/{expenseId}/reject
     */
    @Operation(summary = "결재 반려", description = "반려 사유와 함께 결의서를 반려합니다.")
    @PostMapping("/{expenseId}/reject")
    public ApiResponse<Void> rejectExpense(
        @PathVariable Long expenseId,
        @RequestBody ApprovalLineDto request){
            Long currentUserId = SecurityUtil.getCurrentUserId();
            logger.info("결재 반려 요청 - expenseId: {}, approverId: {}", expenseId, currentUserId);
            expenseService.rejectExpense(expenseId, currentUserId, request.getRejectionReason());
            logger.info("결재 반려 완료 - expenseId: {}", expenseId);
            return new ApiResponse<Void>(true, "결제 반려 완료", null);
    }

    /**
     * 3-2. 결재 취소 API
     * POST /api/expenses/{expenseId}/cancel-approval
     */
    @Operation(summary = "결재 취소", description = "서명 완료된 결재를 취소합니다.")
    @PostMapping("/{expenseId}/cancel-approval")
    public ApiResponse<Void> cancelApproval(@PathVariable Long expenseId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("결재 취소 요청 - expenseId: {}, approverId: {}", expenseId, currentUserId);
        expenseService.cancelApproval(expenseId, currentUserId);
        logger.info("결재 취소 완료 - expenseId: {}", expenseId);
        return new ApiResponse<Void>(true, "결재 취소 완료", null);
    }

    /**
     * 3-3. 반려 취소 API
     * POST /api/expenses/{expenseId}/cancel-rejection
     */
    @Operation(summary = "반려 취소", description = "반려된 결재를 취소합니다.")
    @PostMapping("/{expenseId}/cancel-rejection")
    public ApiResponse<Void> cancelRejection(@PathVariable Long expenseId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("반려 취소 요청 - expenseId: {}, approverId: {}", expenseId, currentUserId);
        expenseService.cancelRejection(expenseId, currentUserId);
        logger.info("반려 취소 완료 - expenseId: {}", expenseId);
        return new ApiResponse<Void>(true, "반려 취소 완료", null);
    }

    @Data
    static class ApproveRequest {
        private Long approverId;
        private String signatureData;
    }

    /**
     * 4. 기안서 작성(생성) API
     * 주소: POST /api/expenses
     * 설명: 프론트에서 작성한 데이터를 받아서 저장합니다.
     */
    @Operation(summary = "지출결의서 생성", description = "기안서를 생성합니다.")
    @PostMapping("/create")
    public ApiResponse<Long> createExpense(@Valid @RequestBody ExpenseReportDto request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("지출결의서 생성 요청 - drafterId: {}, currentUserId: {}, totalAmount: {}", 
                request.getDrafterId(), currentUserId, request.getTotalAmount());
        Long expenseId = expenseService.createExpense(request, currentUserId);
        logger.info("지출결의서 생성 완료 - expenseId: {}", expenseId);
        return new ApiResponse<>(true, "기안서 저장 성공", expenseId);
    }

    /**
     * 4-1. 기안서 수정 API
     * 주소: PUT /api/expenses/{expenseId}
     * 설명: WAIT 상태의 지출결의서를 수정합니다.
     */
    @Operation(summary = "지출결의서 수정", description = "WAIT 상태의 기안서를 수정합니다.")
    @PutMapping("/{expenseId}")
    public ApiResponse<Long> updateExpense(
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseReportDto request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("지출결의서 수정 요청 - expenseId: {}, currentUserId: {}, totalAmount: {}", 
                expenseId, currentUserId, request.getTotalAmount());
        Long updatedExpenseId = expenseService.updateExpense(expenseId, request, currentUserId);
        logger.info("지출결의서 수정 완료 - expenseId: {}", updatedExpenseId);
        return new ApiResponse<>(true, "기안서 수정 성공", updatedExpenseId);
    }

    /**
     * 5. 결재 라인 설정 API
     * 주소: POST /api/expenses/{expenseId}/approval-lines
     * 설명: 이미 생성된 지출결의서에 결재 라인을 설정합니다.
     */
    @Operation(summary = "결재 라인 설정", description = "지출결의서에 결재 라인을 설정합니다.")
    @PostMapping("/{expenseId}/approval-lines")
    public ApiResponse<Void> setApprovalLines(
            @PathVariable Long expenseId,
            @RequestBody ApprovalLineRequest request) {

        expenseService.setApprovalLines(expenseId, request.getApprovalLines());
        return new ApiResponse<>(true, "결재 라인 설정 성공", null);
    }

    /**
     * 5-1. 추가 결재 라인 추가 API
     * 주소: POST /api/expenses/{expenseId}/approval-lines/add
     * 설명: 결재 라인에 있는 결재자가 결재한 후 추가 결재자를 추가합니다.
     */
    @Operation(summary = "추가 결재 라인 추가", description = "결재 라인에 있는 결재자가 결재한 후 추가 결재자를 추가합니다.")
    @PostMapping("/{expenseId}/approval-lines/add")
    public ApiResponse<Void> addApprovalLine(
            @PathVariable Long expenseId,
            @RequestBody ApprovalLineDto approvalLine) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        expenseService.addApprovalLine(expenseId, approvalLine, currentUserId);
        return new ApiResponse<>(true, "추가 결재 라인 추가 성공", null);
    }

    @Data
    static class ApprovalLineRequest {
        private List<ApprovalLineDto> approvalLines;
    }

    /**
     * 6. 지출결의서 상태 변경 API
     * PUT /api/expenses/{expenseId}/status
     * 설명: ACCOUNTANT 권한을 가진 사용자만 상태를 변경할 수 있습니다.
     */

    /**
     * 7. 지출결의서 삭제 API
     * DELETE /api/expenses/{expenseId}
     * 설명: 작성자 본인 또는 ADMIN 권한을 가진 사용자만 삭제 가능
     */
    @Operation(summary = "지출결의서 삭제", description = "작성자 또는 ADMIN이 결의서를 삭제합니다.")
    @DeleteMapping("/{expenseId}")
    public ApiResponse<Void> deleteExpense(@PathVariable Long expenseId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("지출결의서 삭제 요청 - expenseId: {}, userId: {}", expenseId, currentUserId);
        expenseService.deleteExpense(expenseId, currentUserId);
        logger.info("지출결의서 삭제 완료 - expenseId: {}", expenseId);
        return new ApiResponse<>(true, "지출결의서 삭제 완료", null);
    }

    /**
     * 8. 미서명 건 조회 API (알람)
     * GET /api/expenses/pending-approvals
     * 설명: 현재 사용자가 서명해야 할 미완료 건 목록을 반환합니다.
     */
    @Operation(summary = "미서명 결재건 조회", description = "사용자가 서명해야 할 결의서 목록을 조회합니다.")
    @GetMapping("/pending-approvals")
    public ApiResponse<List<ExpenseReportDto>> getPendingApprovals() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<ExpenseReportDto> pendingList = expenseService.getPendingApprovals(currentUserId);
        return new ApiResponse<>(true, "미서명 건 조회 성공", pendingList);
    }

    /**
     * 8-1. 내가 결재했던 문서 이력 조회 API
     * GET /api/expenses/my-approvals
     * 설명: 현재 사용자가 APPROVED/REJECTED 한 결재 문서 목록을 반환합니다.
     */
    @Operation(summary = "내 결재 문서 이력 조회", description = "현재 사용자가 결재(승인/반려)했던 결의서 목록을 조회합니다.")
    @GetMapping("/my-approvals")
    public ApiResponse<List<ExpenseReportDto>> getMyApprovals() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<ExpenseReportDto> myApprovals = expenseService.getMyApprovedReports(currentUserId);
        return new ApiResponse<>(true, "내 결재 문서 조회 성공", myApprovals);
    }

    /**
     * 세무 수정 요청 목록 (작성자용)
     * TAX_ACCOUNTANT가 수정 요청한 결의서들을 작성자 기준으로 조회합니다.
     */
    @Operation(summary = "세무 수정 요청 목록(작성자용)", description = "세무사가 수정 요청한 결의서 목록을 작성자 기준으로 조회합니다.")
    @GetMapping("/tax/revision-requests")
    public ApiResponse<List<ExpenseReportDto>> getTaxRevisionRequestsForDrafter() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<ExpenseReportDto> list = expenseService.getTaxRevisionRequestsForDrafter(currentUserId);
        return new ApiResponse<>(true, "세무 수정 요청 목록 조회 성공", list);
    }

    /**
     * 9. 영수증 업로드 API
     * POST /api/expenses/{expenseId}/receipt
     * 설명: APPROVED 상태의 결의서에 영수증을 첨부합니다. (작성자 또는 ACCOUNTANT만 가능)
     */
    @Operation(summary = "영수증 업로드", description = "APPROVED 상태 결의서에 영수증을 첨부합니다.")
    @PostMapping(value = "/{expenseId}/receipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> uploadReceipt(
            @PathVariable Long expenseId,
            @RequestParam("file") MultipartFile file) throws IOException {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("영수증 업로드 요청 - expenseId: {}, userId: {}, filename: {}", expenseId, currentUserId, file.getOriginalFilename());
        expenseService.uploadReceipt(expenseId, currentUserId, file);
        logger.info("영수증 업로드 완료 - expenseId: {}", expenseId);
        return new ApiResponse<>(true, "영수증 업로드 완료", null);
    }

    /**
     * 10. 영수증 목록 조회 API
     * GET /api/expenses/{expenseId}/receipts
     * 설명: 영수증 목록을 반환합니다. (모든 로그인 사용자 조회 가능)
     */
    @Operation(summary = "영수증 목록 조회", description = "결의서에 첨부된 영수증 목록을 조회합니다.")
    @GetMapping("/{expenseId}/receipts")
    public ApiResponse<List<ReceiptDto>> getReceipts(@PathVariable Long expenseId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.debug("영수증 목록 조회 요청 - expenseId: {}, userId: {}", expenseId, currentUserId);
        List<ReceiptDto> receipts = expenseService.getReceipts(expenseId, currentUserId);
        return new ApiResponse<>(true, "영수증 목록 조회 성공", receipts);
    }

    /**
     * 11. 영수증 파일 다운로드 API
     * GET /api/expenses/receipts/{receiptId}/download
     * 설명: 영수증 파일을 다운로드합니다. (권한이 있는 사용자만 다운로드 가능)
     */
    @Operation(summary = "영수증 다운로드", description = "권한이 있는 사용자가 영수증 파일을 다운로드합니다.")
    @GetMapping("/receipts/{receiptId}/download")
    public ResponseEntity<?> downloadReceipt(@PathVariable Long receiptId) {
        try {
            Long currentUserId = SecurityUtil.getCurrentUserId();
            ReceiptDto receipt = expenseService.getReceiptById(receiptId, currentUserId);
            
            if (receipt.getFilePath() == null || receipt.getFilePath().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(new ApiResponse<>(false, "영수증 파일 경로를 찾을 수 없습니다.", null));
            }

            String projectRoot = System.getProperty("user.dir");
            Path filePath = Paths.get(projectRoot, receipt.getFilePath());
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(new ApiResponse<>(false, "영수증 파일을 찾을 수 없습니다.", null));
            }

            Resource resource = new FileSystemResource(file);
            String contentType = "application/octet-stream";
            try {
                String probed = Files.probeContentType(filePath);
                if (probed != null) {
                    contentType = probed;
                }
            } catch (IOException ignore) {
                // fallback to default content type
            }

            SecurityLogger.fileAccess("DOWNLOAD", currentUserId, receipt.getExpenseReportId(), receipt.getOriginalFilename());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + receipt.getOriginalFilename() + "\"")
                    .body(resource);
        } catch (com.innersignature.backend.exception.BusinessException e) {
            // 권한 관련 예외는 JSON 응답으로 반환
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (com.innersignature.backend.exception.ResourceNotFoundException e) {
            // 리소스를 찾을 수 없는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * 12. 영수증 삭제 API
     * DELETE /api/expenses/receipts/{receiptId}
     * 설명: 영수증을 삭제합니다. (작성자 또는 ACCOUNTANT만 가능)
     */
    @Operation(summary = "영수증 삭제", description = "작성자 또는 ACCOUNTANT가 영수증을 삭제합니다.")
    @DeleteMapping("/receipts/{receiptId}")
    public ApiResponse<Void> deleteReceipt(@PathVariable Long receiptId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("영수증 삭제 요청 - receiptId: {}, userId: {}", receiptId, currentUserId);
        expenseService.deleteReceipt(receiptId, currentUserId);
        logger.info("영수증 삭제 완료 - receiptId: {}", receiptId);
        return new ApiResponse<>(true, "영수증 삭제 완료", null);
    }

    /**
     * 13. 카테고리별 요약 조회 API (세무사 전용)
     * GET /api/expenses/summary/by-category?startDate=2024-01-01&endDate=2024-12-31&taxProcessed=true
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "카테고리별 요약", description = "기간/상태/세무처리 여부로 카테고리 요약을 조회합니다. (TAX_ACCOUNTANT)")
    @GetMapping("/summary/by-category")
    public ApiResponse<List<CategorySummaryDto>> getCategorySummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String[] status,
            @RequestParam(required = false) Boolean taxProcessed) {

        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<String> statusList = null;

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
            if (status != null && status.length > 0) {
                statusList = Arrays.stream(status)
                        .filter(s -> s != null && !s.isEmpty())
                        .collect(Collectors.toList());
                if (statusList.isEmpty()) {
                    statusList = null;
                }
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<CategorySummaryDto> summary = expenseService.getCategorySummaryForTaxAccountant(
                startDateParsed, endDateParsed, statusList, taxProcessed, currentUserId);
        return new ApiResponse<>(true, "카테고리별 요약 조회 성공", summary);
    }

    /**
     * 14. 세무처리 완료 API
     * PUT /api/expenses/{expenseId}/tax-processing/complete
     * 설명: TAX_ACCOUNTANT 권한을 가진 사용자만 세무처리를 완료할 수 있습니다.
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "세무처리 완료", description = "TAX_ACCOUNTANT가 결의서의 세무처리를 완료로 표시합니다.")
    @PutMapping("/{expenseId}/tax-processing/complete")
    public ApiResponse<Void> completeTaxProcessing(@PathVariable Long expenseId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("세무처리 완료 요청 - expenseId: {}, userId: {}", expenseId, currentUserId);
        expenseService.completeTaxProcessing(expenseId, currentUserId);
        logger.info("세무처리 완료 완료 - expenseId: {}", expenseId);
        return new ApiResponse<>(true, "세무처리 완료", null);
    }

    /**
     * 15. 대시보드 전체 요약 통계 API
     * GET /api/expenses/dashboard/stats?startDate=2024-01-01&endDate=2024-12-31
     * 설명: CEO, ADMIN 또는 ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN', 'ACCOUNTANT')")
    @Operation(summary = "대시보드 통계", description = "기간별 지출 통계를 조회합니다. (CEO/ADMIN/ACCOUNTANT)")
    @GetMapping("/dashboard/stats")
    public ApiResponse<DashboardStatsDto> getDashboardStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        DashboardStatsDto stats = expenseService.getDashboardStats(startDateParsed, endDateParsed);
        return new ApiResponse<>(true, "대시보드 통계 조회 성공", stats);
    }

    /**
     * 16. 월별 지출 추이 API
     * GET /api/expenses/dashboard/monthly-trend?startDate=2024-01-01&endDate=2024-12-31
     * 설명: CEO, ADMIN 또는 ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN', 'ACCOUNTANT')")
    @Operation(summary = "월별 지출 추이", description = "기간별 월간 지출 추이를 조회합니다. (CEO/ADMIN/ACCOUNTANT)")
    @GetMapping("/dashboard/monthly-trend")
    public ApiResponse<List<MonthlyTrendDto>> getMonthlyTrend(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        List<MonthlyTrendDto> trend = expenseService.getMonthlyTrend(startDateParsed, endDateParsed);
        return new ApiResponse<>(true, "월별 추이 조회 성공", trend);
    }

    /**
     * 17. 상태별 통계 API
     * GET /api/expenses/dashboard/status-stats?startDate=2024-01-01&endDate=2024-12-31
     * 설명: CEO, ADMIN 또는 ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN', 'ACCOUNTANT')")
    @Operation(summary = "상태별 통계", description = "기간별 상태별 지출결의 건수를 조회합니다. (CEO/ADMIN/ACCOUNTANT)")
    @GetMapping("/dashboard/status-stats")
    public ApiResponse<List<StatusStatsDto>> getStatusStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        List<StatusStatsDto> stats = expenseService.getStatusStats(startDateParsed, endDateParsed);
        return new ApiResponse<>(true, "상태별 통계 조회 성공", stats);
    }

    /**
     * 18. 카테고리별 비율 API
     * GET /api/expenses/dashboard/category-ratio?startDate=2024-01-01&endDate=2024-12-31
     * 설명: CEO, ADMIN 또는 ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN', 'ACCOUNTANT')")
    @Operation(summary = "카테고리별 비율", description = "기간별 카테고리 지출 비율을 조회합니다. (CEO/ADMIN/ACCOUNTANT)")
    @GetMapping("/dashboard/category-ratio")
    public ApiResponse<List<CategoryRatioDto>> getCategoryRatio(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        List<CategoryRatioDto> ratios = expenseService.getCategoryRatio(startDateParsed, endDateParsed);
        return new ApiResponse<>(true, "카테고리별 비율 조회 성공", ratios);
    }

    /**
     * 19. APPROVED 상태 결의서 목록 조회 API
     * GET /api/expenses/tax/pending?startDate=2024-01-01&endDate=2024-12-31
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "APPROVED 상태 결의서 조회", description = "세무사(TAX_ACCOUNTANT)가 APPROVED 상태 결의서를 조회합니다.")
    @GetMapping("/tax/pending")
    public ApiResponse<List<ExpenseReportDto>> getTaxPendingReports(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        List<ExpenseReportDto> pendingReports = expenseService.getTaxPendingReports(startDateParsed, endDateParsed);
        return new ApiResponse<>(true, "세무처리 대기 건 조회 성공", pendingReports);
    }

    /**
     * 20. 세무 자료 수집 현황 통계 API
     * GET /api/expenses/tax/status?startDate=2024-01-01&endDate=2024-12-31
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "세무 자료 수집 현황", description = "세무 자료 수집 상태별 통계를 조회합니다. (TAX_ACCOUNTANT)")
    @GetMapping("/tax/status")
    public ApiResponse<TaxStatusDto> getTaxStatus(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        TaxStatusDto status = expenseService.getTaxStatus(startDateParsed, endDateParsed);
        return new ApiResponse<>(true, "세무 자료 수집 현황 통계 조회 성공", status);
    }

    /**
     * 21. 월별 집계 API
     * GET /api/expenses/tax/monthly-summary?startDate=2024-01-01&endDate=2024-12-31
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "월별 집계", description = "월별 세무 자료 집계를 조회합니다. (TAX_ACCOUNTANT)")
    @GetMapping("/tax/monthly-summary")
    public ApiResponse<List<MonthlyTaxSummaryDto>> getMonthlyTaxSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null);
        }

        List<MonthlyTaxSummaryDto> summary = expenseService.getMonthlyTaxSummary(startDateParsed, endDateParsed);
        return new ApiResponse<>(true, "월별 집계 조회 성공", summary);
    }

    /**
     * 22. 세무처리 일괄 완료 API
     * POST /api/expenses/tax/batch-complete
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "세무처리 일괄 완료", description = "선택한 문서들에 대해 세무처리를 일괄 완료합니다. (TAX_ACCOUNTANT)")
    @PostMapping("/tax/batch-complete")
    public ApiResponse<Void> batchCompleteTaxProcessing(@RequestBody BatchCompleteRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("세무처리 일괄 완료 요청 - expenseIds: {}, userId: {}", request.getExpenseReportIds(), currentUserId);
        
        if (request.getExpenseReportIds() == null || request.getExpenseReportIds().isEmpty()) {
            return new ApiResponse<>(false, "처리할 문서 ID가 필요합니다.", null);
        }
        
        expenseService.batchCompleteTaxProcessing(request.getExpenseReportIds(), currentUserId);
        logger.info("세무처리 일괄 완료 완료 - userId: {}", currentUserId);
        return new ApiResponse<>(true, "세무처리 일괄 완료 처리 완료", null);
    }

    @Data
    static class BatchCompleteRequest {
        private List<Long> expenseReportIds;
    }

    /**
     * 기간별 세무 자료 일괄 수집 및 다운로드
     * POST /api/expenses/tax/collect?startDate=2024-01-01&endDate=2024-12-31
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     * 자료 수집 후 5개 시트로 구성된 종합 검토 자료를 다운로드합니다.
     */
    @PostMapping("/tax/collect")
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "기간별 세무 자료 일괄 수집 및 다운로드", description = "TAX_ACCOUNTANT가 기간별로 APPROVED 상태의 자료를 수집하고 종합 검토 자료(5개 시트)를 다운로드합니다.")
    public ResponseEntity<?> collectTaxData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("세무 자료 일괄 수집 및 다운로드 요청 - startDate: {}, endDate: {}, userId: {}", startDate, endDate, currentUserId);
        
        try {
            // 1. 자료 수집 처리
            expenseService.collectTaxData(startDate, endDate, currentUserId);
            
            // 2. 종합 검토 자료 엑셀 파일 생성 및 다운로드 (5개 시트)
            File excelFile = expenseService.exportFullTaxReview(startDate, endDate, currentUserId);
            Resource resource = new FileSystemResource(excelFile);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            String filename = String.format("세무자료수집_%s_%s.xlsx",
                    startDate != null ? startDate.format(formatter) : "전체",
                    endDate != null ? endDate.format(formatter) : "전체");
            
            logger.info("세무 자료 일괄 수집 및 다운로드 완료 - userId: {}", currentUserId);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (com.innersignature.backend.exception.BusinessException e) {
            logger.warn("세무 자료 일괄 수집 실패 - userId: {}, error: {}", currentUserId, e.getMessage());
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            logger.error("세무 자료 일괄 수집 중 예상치 못한 오류 발생 - userId: {}", currentUserId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "세무 자료 수집 중 오류가 발생했습니다: " + e.getMessage(), null));
        }
    }

    /**
     * 세무 수정 요청
     * POST /api/expenses/{expenseReportId}/tax/revision-request
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PostMapping("/{expenseReportId}/tax/revision-request")
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "세무 수정 요청", description = "TAX_ACCOUNTANT가 세무 수집된 문서에 대해 수정 요청을 보냅니다.")
    public ApiResponse<Void> requestTaxRevision(
            @PathVariable Long expenseReportId,
            @RequestBody java.util.Map<String, String> request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        String reason = request.get("reason");
        
        if (reason == null || reason.trim().isEmpty()) {
            return new ApiResponse<>(false, "수정 요청 사유를 입력해주세요.", null);
        }
        
        logger.info("세무 수정 요청 - expenseId: {}, userId: {}, reason: {}", expenseReportId, currentUserId, reason);
        
        try {
            expenseService.requestTaxRevision(expenseReportId, reason, currentUserId);
            logger.info("세무 수정 요청 완료 - expenseId: {}, userId: {}", expenseReportId, currentUserId);
            return new ApiResponse<>(true, "수정 요청이 전송되었습니다.", null);
        } catch (com.innersignature.backend.exception.BusinessException | com.innersignature.backend.exception.ResourceNotFoundException e) {
            logger.warn("세무 수정 요청 실패 - expenseId: {}, userId: {}, error: {}", expenseReportId, currentUserId, e.getMessage());
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 23. 지출 엑셀 다운로드 API
     * GET /api/expenses/export/excel?startDate=2024-01-01&endDate=2024-12-31
     * 설명: ADMIN, ACCOUNTANT, CEO, TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'CEO', 'TAX_ACCOUNTANT')")
    @Operation(summary = "지출 엑셀 다운로드", description = "기간별 지출 데이터를 엑셀 파일로 다운로드합니다. (ADMIN/ACCOUNTANT/CEO/TAX_ACCOUNTANT)")
    @GetMapping("/export/excel")
    public ResponseEntity<?> exportExpensesToExcel(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            logger.error("날짜 파싱 실패", e);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null));
        }
        
        Long currentUserId = SecurityUtil.getCurrentUserId();
        
        try {
            File excelFile = expenseService.exportExpensesToExcel(startDateParsed, endDateParsed, currentUserId);
            Resource resource = new FileSystemResource(excelFile);
            
            String filename = String.format("지출내역_%s_%s.xlsx",
                    startDateParsed != null ? startDateParsed.format(formatter) : "전체",
                    endDateParsed != null ? endDateParsed.format(formatter) : "전체");
            
            logger.info("엑셀 다운로드 요청 - userId: {}, startDate: {}, endDate: {}", 
                    currentUserId, startDateParsed, endDateParsed);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            logger.error("엑셀 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "엑셀 파일 생성 중 오류가 발생했습니다: " + e.getMessage(), null));
        }
    }

    /**
     * 24. 전표 다운로드 API
     * GET /api/expenses/export/journal?startDate=2024-01-01&endDate=2024-12-31
     * 설명: ACCOUNTANT 또는 TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'TAX_ACCOUNTANT')")
    @Operation(summary = "전표 다운로드", description = "승인된 지출결의서를 회계 전표 형식으로 엑셀 파일로 다운로드합니다. (ACCOUNTANT/TAX_ACCOUNTANT)")
    @GetMapping("/export/journal")
    public ResponseEntity<?> exportJournalEntries(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            logger.error("날짜 파싱 실패", e);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null));
        }
        
        Long currentUserId = SecurityUtil.getCurrentUserId();
        
        try {
            File excelFile = expenseService.exportJournalEntriesToExcel(startDateParsed, endDateParsed, currentUserId);
            Resource resource = new FileSystemResource(excelFile);
            
            String filename = String.format("전표_%s_%s.xlsx",
                    startDateParsed != null ? startDateParsed.format(formatter) : "전체",
                    endDateParsed != null ? endDateParsed.format(formatter) : "전체");
            
            logger.info("전표 다운로드 요청 - userId: {}, startDate: {}, endDate: {}", 
                    currentUserId, startDateParsed, endDateParsed);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            logger.error("전표 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "전표 파일 생성 중 오류가 발생했습니다: " + e.getMessage(), null));
        }
    }

    /**
     * 25. 부가세 신고 서식 다운로드 API
     * GET /api/expenses/export/tax-report?startDate=2024-01-01&endDate=2024-12-31
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "부가세 신고 서식 다운로드", description = "부가세 신고용 서식을 엑셀 파일로 다운로드합니다. (TAX_ACCOUNTANT)")
    @GetMapping("/export/tax-report")
    public ResponseEntity<?> exportTaxReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            logger.error("날짜 파싱 실패", e);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null));
        }
        
        try {
            File excelFile = expenseService.exportTaxReportToExcel(startDateParsed, endDateParsed);
            Resource resource = new FileSystemResource(excelFile);
            
            String filename = String.format("부가세신고서식_%s_%s.xlsx",
                    startDateParsed != null ? startDateParsed.format(formatter) : "전체",
                    endDateParsed != null ? endDateParsed.format(formatter) : "전체");
            
            logger.info("부가세 신고 서식 다운로드 요청 - startDate: {}, endDate: {}", 
                    startDateParsed, endDateParsed);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            logger.error("부가세 신고 서식 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "부가세 신고 서식 생성 중 오류가 발생했습니다: " + e.getMessage(), null));
        }
    }
    
    /**
     * 26. 세무 검토용 증빙 리스트 다운로드 API
     * GET /api/expenses/export/tax-review?startDate=2024-01-01&endDate=2024-12-31&format=full
     * 설명: ACCOUNTANT 또는 TAX_ACCOUNTANT 권한 사용자만 접근 가능
     * format: full(전체 5시트), simple(간단 요약), import(더존 Import)
     */
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'TAX_ACCOUNTANT')")
    @Operation(summary = "세무 검토용 증빙 리스트 다운로드", description = "세무사가 검토하기 쉬운 형식의 증빙 리스트를 다운로드합니다. (ACCOUNTANT, TAX_ACCOUNTANT)")
    @GetMapping("/export/tax-review")
    public ResponseEntity<?> exportTaxReview(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false, defaultValue = "full") String format) {
        
        LocalDate startDateParsed = null;
        LocalDate endDateParsed = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        try {
            if (startDate != null && !startDate.isEmpty()) {
                startDateParsed = LocalDate.parse(startDate, formatter);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateParsed = LocalDate.parse(endDate, formatter);
            }
        } catch (Exception e) {
            logger.error("날짜 파싱 실패", e);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)", null));
        }
        
        Long currentUserId = SecurityUtil.getCurrentUserId();
        
        try {
            File excelFile = expenseService.exportFullTaxReview(startDateParsed, endDateParsed, currentUserId);
            Resource resource = new FileSystemResource(excelFile);
            
            String filename = String.format("세무검토_%s_%s.xlsx",
                    startDateParsed != null ? startDateParsed.format(formatter) : "전체",
                    endDateParsed != null ? endDateParsed.format(formatter) : "전체");
            
            logger.info("세무 검토 자료 다운로드 요청 - userId: {}, startDate: {}, endDate: {}, format: {}", 
                    currentUserId, startDateParsed, endDateParsed, format);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            logger.error("세무 검토 자료 다운로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, "세무 검토 자료 생성 중 오류가 발생했습니다: " + e.getMessage(), null));
        }
    }

    /**
     * 27. 상세 항목 부가세 공제 정보 업데이트 API
     * PUT /api/expenses/details/{expenseDetailId}/tax-info
     * 설명: TAX_ACCOUNTANT 권한 사용자만 접근 가능
     */
    @PreAuthorize("hasRole('TAX_ACCOUNTANT')")
    @Operation(summary = "부가세 공제 정보 업데이트", description = "상세 항목의 부가세 공제 여부 및 불공제 사유를 업데이트합니다. (TAX_ACCOUNTANT)")
    @PutMapping("/details/{expenseDetailId}/tax-info")
    public ResponseEntity<ApiResponse<Void>> updateExpenseDetailTaxInfo(
            @PathVariable Long expenseDetailId,
            @RequestBody Map<String, Object> request) {
        try {
            Boolean isTaxDeductible = request.get("isTaxDeductible") != null 
                    ? Boolean.valueOf(request.get("isTaxDeductible").toString()) 
                    : true;
            String nonDeductibleReason = (String) request.get("nonDeductibleReason");
            
            expenseService.updateExpenseDetailTaxInfo(expenseDetailId, isTaxDeductible, nonDeductibleReason);
            
            logger.info("부가세 공제 정보 업데이트 완료 - expenseDetailId: {}", expenseDetailId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "부가세 공제 정보가 업데이트되었습니다.", null));
        } catch (Exception e) {
            logger.error("부가세 공제 정보 업데이트 실패", e);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

}