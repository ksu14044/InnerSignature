package com.innersignature.backend.service;

import com.innersignature.backend.dto.*;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * 결의서 분석 및 통계 서비스
 * 대시보드, 차트, 통계 데이터 제공
 */
@Service
@RequiredArgsConstructor
public class ExpenseAnalyticsService {

    private final ExpenseMapper expenseMapper;

    /**
     * 대시보드 통계 조회
     */
    public DashboardStatsDto getDashboardStats(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        DashboardStatsDto stats = new DashboardStatsDto();

        // 기본 통계 계산
        List<ExpenseReportDto> reports = expenseMapper.selectExpenseList(companyId);
        stats.setTotalAmount(calculateTotalAmount(reports));
        stats.setTotalCount((long) reports.size());
        stats.setPendingCount(reports.stream().filter(r -> "WAIT".equals(r.getStatus())).count());

        return stats;
    }

    /**
     * 월별 트렌드 조회
     */
    public List<MonthlyTrendDto> getMonthlyTrend(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectMonthlyTrend(startDate, endDate, companyId);
    }

    /**
     * 상태별 통계 조회
     */
    public List<StatusStatsDto> getStatusStats(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectStatusStats(startDate, endDate, companyId);
    }

    /**
     * 카테고리별 비율 조회
     */
    public List<CategoryRatioDto> getCategoryRatio(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectCategoryRatio(startDate, endDate, companyId);
    }

    /**
     * 결의서 상태별 카운트 조회 (간단한 구현)
     */
    public ExpenseStatusCountDto getExpenseStatusCounts(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        ExpenseStatusCountDto counts = new ExpenseStatusCountDto();
        counts.setWaitCount(expenseMapper.countExpensesByStatus(companyId, "WAIT", startDate, endDate));
        counts.setApprovedCount(expenseMapper.countExpensesByStatus(companyId, "APPROVED", startDate, endDate));
        counts.setRejectedCount(expenseMapper.countExpensesByStatus(companyId, "REJECTED", startDate, endDate));
        counts.setPaidCount(expenseMapper.countExpensesByStatus(companyId, "PAID", startDate, endDate));
        counts.setTotalCount(counts.getWaitCount() + counts.getApprovedCount() + counts.getRejectedCount() + counts.getPaidCount());

        return counts;
    }

    /**
     * 사용자별 결의서 통계
     */
    public List<UserExpenseStatsDto> getUserExpenseStats(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectUserExpenseStats(companyId, startDate, endDate);
    }

    /**
     * 최근 결의서 활동 조회
     */
    public List<ExpenseReportDto> getRecentActivities(int limit) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> reports = expenseMapper.selectRecentActivities(companyId, limit);

        // 요약 정보 생성
        for (ExpenseReportDto report : reports) {
            generateSummaryDescription(report);
        }

        return reports;
    }

    // ===== Private Helper Methods =====

    private long calculateTotalAmount(List<ExpenseReportDto> reports) {
        return reports.stream()
                .filter(r -> "APPROVED".equals(r.getStatus()) || "PAID".equals(r.getStatus()))
                .mapToLong(r -> r.getTotalAmount() != null ? r.getTotalAmount() : 0L)
                .sum();
    }

    private void generateSummaryDescription(ExpenseReportDto report) {
        if (report == null) {
            return;
        }

        Integer count = report.getDescriptionCount();
        if (count == null || count == 0) {
            report.setSummaryDescription("");
            return;
        }

        String firstDesc = report.getFirstDescription();
        if (firstDesc == null || firstDesc.trim().isEmpty()) {
            report.setSummaryDescription("");
            return;
        }

        if (count == 1) {
            report.setSummaryDescription(firstDesc);
        } else {
            report.setSummaryDescription(firstDesc + " 외 " + (count - 1) + "개");
        }
    }
}
