package com.innersignature.backend.service;

import com.innersignature.backend.dto.ApprovalLineDto;
import com.innersignature.backend.dto.ExpenseDetailDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.dto.PagedResponse;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 결의서 기본 CRUD 서비스
 * 생성, 조회, 수정, 삭제 기능 담당
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseReportService {

    private final ExpenseMapper expenseMapper;
    private final UserService userService;

    /**
     * 결의서 목록 조회 (페이지네이션 미적용)
     */
    public List<ExpenseReportDto> getExpenseList(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        List<ExpenseReportDto> list = expenseMapper.selectExpenseList(companyId);

        // 권한 필터링 적용
        filterSalaryExpenses(list, userId);

        // 요약 정보 생성
        for (ExpenseReportDto report : list) {
            generateSummaryDescription(report);
        }

        return list;
    }

    /**
     * 결의서 목록 조회 (페이지네이션 적용)
     */
    public PagedResponse<ExpenseReportDto> getExpenseList(int page, int size, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        // 전체 개수 계산 (권한 필터링 적용)
        long totalElements = calculateFilteredTotalElements(userId);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        // 페이징된 데이터 조회
        List<ExpenseReportDto> content = expenseMapper.selectExpenseListWithPagination((page - 1) * size, size, companyId);

        // 권한 필터링 적용
        filterSalaryExpenses(content, userId);

        // 요약 정보 생성
        for (ExpenseReportDto report : content) {
            generateSummaryDescription(report);
        }

        return new PagedResponse<ExpenseReportDto>(content, page, size, totalElements, totalPages);
    }

    /**
     * 결의서 상세 조회
     */
    public ExpenseReportDto getExpenseDetail(Long expenseReportId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        // 기본 정보 조회
        List<ExpenseReportDto> reports = expenseMapper.selectExpenseList(companyId);
        ExpenseReportDto report = reports.stream()
                .filter(r -> r.getExpenseReportId().equals(expenseReportId))
                .findFirst()
                .orElse(null);

        if (report == null) {
            throw new RuntimeException("결의서를 찾을 수 없습니다.");
        }

        // 상세 정보 조회
        List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetails(expenseReportId, companyId);
        report.setDetails(details);

        // 결재선 정보 조회
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseReportId, companyId);
        report.setApprovalLines(approvalLines);

        // 권한 체크
        if (!canAccessExpense(report, userId)) {
            throw new RuntimeException("접근 권한이 없습니다.");
        }

        // 요약 정보 생성
        generateSummaryDescription(report);

        return report;
    }

    /**
     * 결의서 생성
     */
    @Transactional
    public Long createExpense(ExpenseReportDto request, Long currentUserId) {
        // 기본 검증 로직
        validateExpenseRequest(request);

        // 결의서 저장
        expenseMapper.insertExpenseReport(request);

        // 상세 항목 저장
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            for (int i = 0; i < request.getDetails().size(); i++) {
                ExpenseDetailDto detail = request.getDetails().get(i);
                detail.setExpenseReportId(request.getExpenseReportId());
                detail.setCompanyId(request.getCompanyId());
                expenseMapper.insertExpenseDetail(detail);
            }
        }

        return request.getExpenseReportId();
    }

    /**
     * 결의서 수정
     */
    @Transactional
    public Long updateExpense(Long expenseId, ExpenseReportDto request, Long currentUserId) {
        // 기존 데이터 조회 및 검증
        ExpenseReportDto existing = getExpenseDetail(expenseId, currentUserId);

        if (!canModifyExpense(existing, currentUserId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        // 결의서 업데이트
        expenseMapper.updateExpenseReport(request, request.getCompanyId());

        // 상세 항목 재생성
        expenseMapper.deleteExpenseDetails(expenseId, request.getCompanyId());
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            for (int i = 0; i < request.getDetails().size(); i++) {
                ExpenseDetailDto detail = request.getDetails().get(i);
                detail.setExpenseReportId(expenseId);
                detail.setCompanyId(request.getCompanyId());
                expenseMapper.insertExpenseDetail(detail);
            }
        }

        return expenseId;
    }

    /**
     * 결의서 삭제
     */
    @Transactional
    public void deleteExpense(Long expenseReportId, Long userId) {
        ExpenseReportDto report = getExpenseDetail(expenseReportId, userId);

        if (!canDeleteExpense(report, userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        expenseMapper.deleteExpenseReport(expenseReportId, report.getCompanyId());
    }

    /**
     * 결재선 설정
     */
    @Transactional
    public void setApprovalLines(Long expenseReportId, List<ApprovalLineDto> approvalLines) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        // 기존 결재선 삭제
        expenseMapper.deleteApprovalLines(expenseReportId, companyId);

        // 새 결재선 저장
        for (int i = 0; i < approvalLines.size(); i++) {
            ApprovalLineDto line = approvalLines.get(i);
            line.setExpenseReportId(expenseReportId);
            line.setStepOrder(i + 1);
            expenseMapper.insertApprovalLine(line);
        }
    }

    // ===== Private Helper Methods =====

    private void validateExpenseRequest(ExpenseReportDto request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("제목은 필수입니다.");
        }
        if (request.getDetails() == null || request.getDetails().isEmpty()) {
            throw new RuntimeException("최소 하나의 상세 항목이 필요합니다.");
        }
    }

    private boolean canAccessExpense(ExpenseReportDto report, Long userId) {
        if (userId == null) {
            return false;
        }
        
        // 작성자는 항상 접근 가능
        if (report.getDrafterId().equals(userId)) {
            return true;
        }
        
        // 결재자는 접근 가능
        if (report.getApprovalLines() != null &&
            report.getApprovalLines().stream().anyMatch(a -> a.getApproverId().equals(userId))) {
            return true;
        }
        
        // ADMIN, CEO, ACCOUNTANT, TAX_ACCOUNTANT는 모든 문서 조회 가능
        UserDto user = userService.selectUserById(userId);
        if (user != null) {
            String role = user.getRole();
            if ("ADMIN".equals(role) || "CEO".equals(role) || 
                "ACCOUNTANT".equals(role) || "TAX_ACCOUNTANT".equals(role)) {
                return true;
            }
        }
        
        return false;
    }

    private boolean canModifyExpense(ExpenseReportDto report, Long userId) {
        // WAIT 상태이고 본인 결의서인 경우만 수정 가능
        return "WAIT".equals(report.getStatus()) && report.getDrafterId().equals(userId);
    }

    private boolean canDeleteExpense(ExpenseReportDto report, Long userId) {
        // WAIT 상태이고 본인 결의서인 경우만 삭제 가능
        return "WAIT".equals(report.getStatus()) && report.getDrafterId().equals(userId);
    }

    private void filterSalaryExpenses(List<ExpenseReportDto> reports, Long userId) {
        if (userId == null) return;

        reports.removeIf(report -> {
            boolean isSalaryExpense = report.getDetails() != null &&
                report.getDetails().stream()
                    .anyMatch(detail -> "급여".equals(detail.getCategory()));

            // 급여 지출은 본인만 볼 수 있음
            return isSalaryExpense && !report.getDrafterId().equals(userId);
        });
    }

    private long calculateFilteredTotalElements(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (userId == null) {
            return expenseMapper.countExpenseList(companyId);
        }

        List<ExpenseReportDto> allReports = expenseMapper.selectExpenseList(companyId);
        filterSalaryExpenses(allReports, userId);
        return allReports.size();
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
