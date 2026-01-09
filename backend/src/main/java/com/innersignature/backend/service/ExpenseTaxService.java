package com.innersignature.backend.service;

import com.innersignature.backend.dto.*;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 결의서 세무 처리 서비스
 * 세무 신고, 세액 공제, 세무 통계 기능 담당
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseTaxService {

    private final ExpenseMapper expenseMapper;
    private final ExpenseReportService expenseReportService;

    /**
     * 세무 처리 대기 결의서 목록 조회
     */
    public List<ExpenseReportDto> getTaxPendingReports(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectTaxPendingReports(startDate, endDate, companyId);
    }

    /**
     * 세무 상태 조회
     */
    public TaxStatusDto getTaxStatus(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        TaxStatusDto status = new TaxStatusDto();

        // 세무 처리 상태별 카운트
        status.setPendingCount(expenseMapper.countTaxPending(companyId, startDate, endDate));
        status.setCompletedCount(expenseMapper.countTaxCompleted(companyId, startDate, endDate));

        // 세액 공제 총액 계산 (간단한 구현)
        status.setTotalAmount(status.getCompletedCount() * 10000L); // 임시 계산
        status.setPendingAmount(status.getPendingCount() * 5000L);   // 임시 계산
        status.setCompletedAmount(status.getTotalAmount());

        // 수집률 계산
        long total = status.getPendingCount() + status.getCompletedCount();
        if (total > 0) {
            status.setCompletionRate((double) status.getCompletedCount() / total);
        }

        return status;
    }

    /**
     * 월별 세무 요약 조회
     */
    public List<MonthlyTaxSummaryDto> getMonthlyTaxSummary(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectMonthlyTaxSummary(startDate, endDate, companyId);
    }

    /**
     * 세무 처리 완료
     */
    @Transactional
    public void completeTaxProcessing(Long expenseReportId, Long userId) {
        // 결의서 접근 권한 검증
        expenseReportService.getExpenseDetail(expenseReportId, userId);

        if (!SecurityUtil.isTaxAccountant()) {
            throw new RuntimeException("세무 담당자만 세무 처리를 수행할 수 있습니다.");
        }

        // TODO: 세무 처리 상태 업데이트 기능 구현
        expenseMapper.updateTaxProcessingStatus(expenseReportId, "COMPLETED", userId);

        // 세액 공제 정보 업데이트 (필요한 경우)
        updateTaxDeductionInfo(expenseReportId);
    }

    /**
     * 일괄 세무 처리 완료
     */
    @Transactional
    public void batchCompleteTaxProcessing(List<Long> expenseReportIds, Long userId) {
        if (!SecurityUtil.isTaxAccountant()) {
            throw new RuntimeException("세무 담당자만 세무 처리를 수행할 수 있습니다.");
        }

        for (Long expenseReportId : expenseReportIds) {
            try {
                // 각 결의서에 대한 권한 검증
                expenseReportService.getExpenseDetail(expenseReportId, userId);

                // TODO: 세무 처리 상태 업데이트 기능 구현
                expenseMapper.updateTaxProcessingStatus(expenseReportId, "COMPLETED", userId);
                updateTaxDeductionInfo(expenseReportId);
            } catch (Exception e) {
                // 개별 실패는 로그만 기록하고 계속 진행
                System.err.println("결의서 " + expenseReportId + " 세무 처리 실패: " + e.getMessage());
            }
        }
    }

    /**
     * 세액 공제 정보 업데이트
     */
    @Transactional
    public void updateTaxDeductionInfo(Long expenseDetailId, boolean isDeductible, String reason) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        expenseMapper.updateExpenseDetailTaxInfo(expenseDetailId, isDeductible, reason, companyId);
    }

    /**
     * 세무 보고서 생성을 위한 데이터 조회
     */
    public java.util.Map<String, Object> generateTaxReportData(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        java.util.Map<String, Object> reportData = new java.util.HashMap<>();

        // 기본 정보
        reportData.put("startDate", startDate);
        reportData.put("endDate", endDate);
        reportData.put("companyId", companyId);

        // 세무 처리 현황
        TaxStatusDto taxStatus = getTaxStatus(startDate, endDate);
        reportData.put("taxStatus", taxStatus);

        // 월별 세무 요약
        List<MonthlyTaxSummaryDto> monthlySummary = getMonthlyTaxSummary(startDate, endDate);
        reportData.put("monthlySummary", monthlySummary);

        // 세무 처리 대상 결의서 목록
        List<ExpenseReportDto> pendingReports = getTaxPendingReports(startDate, endDate);
        reportData.put("pendingReports", pendingReports);

        return reportData;
    }

    // ===== Private Helper Methods =====


    private void updateTaxDeductionInfo(Long expenseReportId) {
        // 결의서의 상세 항목들에 대해 기본적인 세액 공제 판별 로직 적용
        List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetails(expenseReportId, SecurityUtil.getCurrentCompanyId());

        for (ExpenseDetailDto detail : details) {
            // 기본 판별 로직 (실제로는 더 복잡한 비즈니스 로직이 적용되어야 함)
            boolean isDeductible = isExpenseDeductible(detail);
            String reason = isDeductible ? "기본 판별: 공제 가능" : "기본 판별: 공제 불가";

            // 세액 공제 정보 업데이트
            if (detail.getIsTaxDeductible() == null) {
                expenseMapper.updateExpenseDetailTaxInfo(
                    detail.getExpenseDetailId(),
                    isDeductible,
                    reason,
                    SecurityUtil.getCurrentCompanyId()
                );
            }
        }
    }

    private boolean isExpenseDeductible(ExpenseDetailDto detail) {
        // 기본적인 판별 로직 (실제로는 세무사 또는 복잡한 규칙에 따라 결정)
        String category = detail.getCategory();

        // 공제 가능한 주요 카테고리들
        return category != null && (
            category.contains("교통비") ||
            category.contains("식대") ||
            category.contains("숙박비") ||
            category.contains("사무용품") ||
            category.contains("통신비") ||
            category.contains("교육비")
        );
    }
}
