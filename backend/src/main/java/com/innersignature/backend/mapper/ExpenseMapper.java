package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.ApprovalLineDto;
import com.innersignature.backend.dto.CategoryRatioDto;
import com.innersignature.backend.dto.DashboardStatsDto;
import com.innersignature.backend.dto.ExpenseDetailDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.dto.MonthlyTaxSummaryDto;
import com.innersignature.backend.dto.MonthlyTrendDto;
import com.innersignature.backend.dto.ReceiptDto;
import com.innersignature.backend.dto.StatusStatsDto;
import com.innersignature.backend.dto.TaxStatusDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper // 스프링이 "이건 DB 연결 파일이야"라고 인식하게 함
public interface ExpenseMapper {

    // 1. 목록 조회: 모든 지출결의서를 가져옵니다. (작성자 이름 포함)
    List<ExpenseReportDto> selectExpenseList();

    // 1-1. 목록 조회 (페이지네이션): 페이지네이션을 적용한 지출결의서 목록 조회
    List<ExpenseReportDto> selectExpenseListWithPagination(int offset, int limit);

    // 1-2. 전체 개수 조회: 지출결의서 전체 개수 조회
    long countExpenseList();

    // 1-3. 목록 조회 (필터링 + 페이지네이션): 필터링 조건을 적용한 지출결의서 목록 조회
    List<ExpenseReportDto> selectExpenseListWithFilters(
            @Param("offset") int offset,
            @Param("limit") int limit,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("minAmount") Long minAmount,
            @Param("maxAmount") Long maxAmount,
            @Param("statuses") List<String> statuses,
            @Param("category") String category,
            @Param("taxProcessed") Boolean taxProcessed,
            @Param("isSecret") Boolean isSecret
    );

    // 1-4. 필터링된 전체 개수 조회: 필터링 조건을 적용한 지출결의서 전체 개수 조회
    long countExpenseListWithFilters(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("minAmount") Long minAmount,
            @Param("maxAmount") Long maxAmount,
            @Param("statuses") List<String> statuses,
            @Param("category") String category,
            @Param("taxProcessed") Boolean taxProcessed,
            @Param("isSecret") Boolean isSecret
    );
    
    // 1-5. 카테고리별 합계/건수 요약 조회 (세무사용)
    List<com.innersignature.backend.dto.CategorySummaryDto> selectCategorySummary(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<String> statuses,
            @Param("taxProcessed") Boolean taxProcessed,
            @Param("isSecret") Boolean isSecret
    );

    // 2. 상세 조회 (메인): 문서 1건의 기본 정보를 가져옵니다.
    ExpenseReportDto selectExpenseReportById(Long expenseReportId);

    // 3. 상세 조회 (지출 내역): 문서에 딸린 지출 항목들을 가져옵니다.
    List<ExpenseDetailDto> selectExpenseDetails(Long expenseReportId);

    // 4. 상세 조회 (결재 라인): 문서에 딸린 결재/서명 정보를 가져옵니다.
    List<ApprovalLineDto> selectApprovalLines(Long expenseReportId);

    void updateApprovalLine(ApprovalLineDto approvalLineDto);

    // 결재 반려 처리
    void rejectApprovalLine(ApprovalLineDto approvalLineDto);

    // 문서 상태 업데이트
    void updateExpenseReportStatus(Long expenseReportId, String status);

    // 세무처리 완료 업데이트
    void updateTaxProcessed(
        @Param("expenseReportId") Long expenseReportId,
        @Param("taxProcessed") Boolean taxProcessed,
        @Param("taxProcessedAt") LocalDateTime taxProcessedAt
    );

    // 1. 메인 문서 저장
    void insertExpenseReport(ExpenseReportDto expenseReportDto);

    // 2. 상세 항목(지출 내역) 저장
    void insertExpenseDetail(ExpenseDetailDto expenseDetailDto);

    // 3. 결재 라인 저장
    void insertApprovalLine(ApprovalLineDto approvalLineDto);

    // 지출결의서 삭제 (작성자 또는 ADMIN 권한 필요)
    void deleteExpenseReport(Long expenseReportId);

    // 미서명 건 조회: 현재 사용자가 서명해야 할 미완료 건 조회
    List<ExpenseReportDto> selectPendingApprovalsByUserId(Long userId);

    // 영수증 목록 조회
    List<ReceiptDto> selectReceiptsByExpenseReportId(Long expenseReportId);

    // 영수증 저장
    void insertReceipt(ReceiptDto receiptDto);

    // 영수증 삭제
    void deleteReceipt(Long receiptId);

    // 영수증 조회 (단건)
    ReceiptDto selectReceiptById(Long receiptId);

    // 대시보드 통계 조회
    DashboardStatsDto selectDashboardStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 월별 지출 추이 조회
    List<MonthlyTrendDto> selectMonthlyTrend(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 상태별 통계 조회
    List<StatusStatsDto> selectStatusStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 카테고리별 비율 조회
    List<CategoryRatioDto> selectCategoryRatio(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 세무처리 대기 건 조회 (PAID 상태이지만 taxProcessed=false)
    List<ExpenseReportDto> selectTaxPendingReports(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 세무처리 현황 통계 조회
    TaxStatusDto selectTaxStatus(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 월별 세무처리 집계 조회
    List<MonthlyTaxSummaryDto> selectMonthlyTaxSummary(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}