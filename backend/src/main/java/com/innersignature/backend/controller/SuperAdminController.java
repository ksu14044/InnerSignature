package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.dto.PagedResponse;
import com.innersignature.backend.dto.PaymentDto;
import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.service.AdminReportService;
import com.innersignature.backend.service.CompanyService;
import com.innersignature.backend.service.ExpenseService;
import com.innersignature.backend.service.PaymentService;
import com.innersignature.backend.service.SubscriptionService;
import com.innersignature.backend.service.UserService;
import com.innersignature.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SUPERADMIN 전용 관리 API
 */
@Tag(name = "SuperAdmin", description = "SUPERADMIN 전용 관리 API")
@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(SuperAdminController.class);
    private final UserService userService;
    private final CompanyService companyService;
    private final SubscriptionService subscriptionService;
    private final PaymentService paymentService;
    private final AdminReportService adminReportService;
    private final ExpenseService expenseService;
    
    /**
     * 전체 사용자 목록 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "전체 사용자 목록 조회", description = "SUPERADMIN 전용 전체 사용자 목록 조회")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/users")
    public ApiResponse<List<UserDto>> getAllUsers() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("전체 사용자 목록 조회 요청 - userId: {}", currentUserId);
        List<UserDto> users = userService.getAllUsers();
        users.forEach(user -> user.setPassword(null));
        logger.info("전체 사용자 목록 조회 완료 - count: {}", users.size());
        return new ApiResponse<>(true, "전체 사용자 목록 조회 성공", users);
    }
    
    /**
     * 전체 회사 목록 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "전체 회사 목록 조회", description = "SUPERADMIN 전용 전체 회사 목록 조회")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/companies")
    public ApiResponse<List<CompanyDto>> getAllCompanies() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("전체 회사 목록 조회 요청 - userId: {}", currentUserId);
        List<CompanyDto> companies = companyService.getAllCompanies();
        logger.info("전체 회사 목록 조회 완료 - count: {}", companies.size());
        return new ApiResponse<>(true, "전체 회사 목록 조회 성공", companies);
    }
    
    /**
     * 회사 상태 변경 (SUPERADMIN 전용)
     */
    @Operation(summary = "회사 상태 변경", description = "SUPERADMIN 전용 회사 활성화/비활성화")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @PutMapping("/companies/{companyId}/status")
    public ApiResponse<Void> updateCompanyStatus(
            @PathVariable Long companyId,
            @RequestBody CompanyStatusRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("회사 상태 변경 요청 - operatorId: {}, companyId: {}, isActive: {}", 
            currentUserId, companyId, request.getIsActive());
        
        companyService.updateCompanyStatus(companyId, request.getIsActive(), currentUserId);
        logger.info("회사 상태 변경 완료 - companyId: {}, isActive: {}", companyId, request.getIsActive());
        return new ApiResponse<>(true, "회사 상태 변경 완료", null);
    }
    
    /**
     * 전체 구독 목록 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "전체 구독 목록 조회", description = "SUPERADMIN 전용 전체 구독 목록 조회")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/subscriptions")
    public ApiResponse<List<SubscriptionDto>> getAllSubscriptions() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("전체 구독 목록 조회 요청 - userId: {}", currentUserId);
        List<SubscriptionDto> subscriptions = subscriptionService.getAllSubscriptions();
        logger.info("전체 구독 목록 조회 완료 - count: {}", subscriptions.size());
        return new ApiResponse<>(true, "전체 구독 목록 조회 성공", subscriptions);
    }
    
    /**
     * 전체 결제 내역 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "전체 결제 내역 조회", description = "SUPERADMIN 전용 전체 결제 내역 조회")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/payments")
    public ApiResponse<List<PaymentDto>> getAllPayments() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("전체 결제 내역 조회 요청 - userId: {}", currentUserId);
        List<PaymentDto> payments = paymentService.getAllPayments();
        logger.info("전체 결제 내역 조회 완료 - count: {}", payments.size());
        return new ApiResponse<>(true, "전체 결제 내역 조회 성공", payments);
    }
    
    /**
     * 대시보드 요약 통계 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "대시보드 요약 통계", description = "SUPERADMIN 전용 대시보드 요약 통계")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/reports/summary")
    public ApiResponse<AdminReportService.DashboardSummaryDto> getDashboardSummary() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("대시보드 요약 통계 조회 요청 - userId: {}", currentUserId);
        AdminReportService.DashboardSummaryDto summary = adminReportService.getDashboardSummary();
        return new ApiResponse<>(true, "대시보드 요약 통계 조회 성공", summary);
    }
    
    /**
     * 사용자 가입 추이 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "사용자 가입 추이", description = "SUPERADMIN 전용 사용자 가입 추이 리포트")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/reports/user-signups")
    public ApiResponse<List<AdminReportService.UserSignupTrendDto>> getUserSignupTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("사용자 가입 추이 조회 요청 - userId: {}, from: {}, to: {}", currentUserId, from, to);
        
        LocalDate fromDate = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate toDate = to != null ? to : LocalDate.now();
        
        List<AdminReportService.UserSignupTrendDto> trend = adminReportService.getUserSignupTrend(fromDate, toDate);
        return new ApiResponse<>(true, "사용자 가입 추이 조회 성공", trend);
    }
    
    /**
     * 매출 추이 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "매출 추이", description = "SUPERADMIN 전용 매출 추이 리포트")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/reports/revenue")
    public ApiResponse<List<AdminReportService.RevenueTrendDto>> getRevenueTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("매출 추이 조회 요청 - userId: {}, from: {}, to: {}", currentUserId, from, to);
        
        LocalDate fromDate = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate toDate = to != null ? to : LocalDate.now();
        
        List<AdminReportService.RevenueTrendDto> trend = adminReportService.getRevenueTrend(fromDate, toDate);
        return new ApiResponse<>(true, "매출 추이 조회 성공", trend);
    }
    
    /**
     * 회사별 지출결의서 목록 조회 (SUPERADMIN 전용)
     */
    @Operation(summary = "회사별 지출결의서 목록 조회", description = "SUPERADMIN 전용 회사별 지출결의서 목록 조회 (companyId가 null이면 전체 조회)")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/expenses")
    public ApiResponse<PagedResponse<ExpenseReportDto>> getExpenseListForSuperAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long minAmount,
            @RequestParam(required = false) Long maxAmount,
            @RequestParam(required = false) String[] status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean taxProcessed,
            @RequestParam(required = false) Boolean isSecret,
            @RequestParam(required = false) String drafterName,
            @RequestParam(required = false) Long companyId) {
        
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("회사별 지출결의서 목록 조회 요청 - userId: {}, companyId: {}, page: {}, size: {}", 
            currentUserId, companyId, page, size);
        
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
        
        PagedResponse<ExpenseReportDto> pagedResponse = expenseService.getExpenseListForSuperAdmin(
                page, size, startDateParsed, endDateParsed,
                minAmount, maxAmount, statusList, category,
                taxProcessed, isSecret, drafterName, companyId);
        
        logger.info("회사별 지출결의서 목록 조회 완료 - totalElements: {}", pagedResponse.getTotalElements());
        return new ApiResponse<>(true, "지출결의서 목록 조회 성공", pagedResponse);
    }
    
    @Data
    static class CompanyStatusRequest {
        private Boolean isActive;
    }
}

