package com.innersignature.backend.service;

import com.innersignature.backend.dto.ApprovalLineDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.SecurityUtil;
import com.innersignature.backend.util.PermissionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 결의서 결재 서비스
 * 승인, 반려, 결재선 관리 기능 담당
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseApprovalService {

    private final ExpenseMapper expenseMapper;
    private final ExpenseReportService expenseReportService;
    private final PermissionUtil permissionUtil;

    /**
     * 결의서 승인
     */
    @Transactional
    public void approveExpense(Long expenseId, Long approverId, String signatureData) {
        ExpenseReportDto report = expenseReportService.getExpenseDetail(expenseId, approverId);

        // 결재 권한 검증
        if (!canApproveExpense(report, approverId)) {
            throw new RuntimeException("결재 권한이 없습니다.");
        }

        Long companyId = SecurityUtil.getCurrentCompanyId();

        // 결재 상태 업데이트
        expenseMapper.updateExpenseReportStatus(expenseId, "APPROVED", companyId);

        // 결재 히스토리 기록
        expenseMapper.insertApprovalHistory(expenseId, approverId, "APPROVED", null, signatureData);

        // 다음 결재자 확인 및 상태 업데이트
        updateNextApproverStatus(expenseId);
    }

    /**
     * 결의서 반려
     */
    @Transactional
    public void rejectExpense(Long expenseId, Long approverId, String rejectionReason) {
        ExpenseReportDto report = expenseReportService.getExpenseDetail(expenseId, approverId);

        if (!canApproveExpense(report, approverId)) {
            throw new RuntimeException("결재 권한이 없습니다.");
        }

        Long companyId = SecurityUtil.getCurrentCompanyId();
        expenseMapper.updateExpenseReportStatus(expenseId, "REJECTED", companyId);

        // 결재 히스토리 기록
        expenseMapper.insertApprovalHistory(expenseId, approverId, "REJECTED", rejectionReason, null);
    }

    /**
     * 결재 취소 (승인 취소)
     */
    @Transactional
    public void cancelApproval(Long expenseId, Long approverId) {
        ExpenseReportDto report = expenseReportService.getExpenseDetail(expenseId, approverId);

        if (!canCancelApproval(report, approverId)) {
            throw new RuntimeException("결재 취소 권한이 없습니다.");
        }

        Long companyId = SecurityUtil.getCurrentCompanyId();
        expenseMapper.updateExpenseReportStatus(expenseId, "WAIT", companyId);

        // 결재 히스토리 삭제
        expenseMapper.deleteApprovalHistory(expenseId, approverId, "APPROVED");
    }

    /**
     * 반려 취소
     */
    @Transactional
    public void cancelRejection(Long expenseId, Long approverId) {
        ExpenseReportDto report = expenseReportService.getExpenseDetail(expenseId, approverId);

        if (!canCancelRejection(report, approverId)) {
            throw new RuntimeException("반려 취소 권한이 없습니다.");
        }

        Long companyId = SecurityUtil.getCurrentCompanyId();
        expenseMapper.updateExpenseReportStatus(expenseId, "WAIT", companyId);

        // 결재 히스토리 삭제
        expenseMapper.deleteApprovalHistory(expenseId, approverId, "APPROVED");
    }

    /**
     * 결재 대기 목록 조회
     */
    public List<ExpenseReportDto> getPendingApprovals(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> reports = expenseMapper.selectPendingApprovalsByUserId(userId, companyId);

        // 요약 정보 생성
        for (ExpenseReportDto report : reports) {
            generateSummaryDescription(report);
        }

        return reports;
    }

    /**
     * 승인한 결의서 목록 조회
     */
    public List<ExpenseReportDto> getMyApprovedReports(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> reports = expenseMapper.selectMyApprovedReports(userId, companyId);

        for (ExpenseReportDto report : reports) {
            generateSummaryDescription(report);
        }

        return reports;
    }

    /**
     * 결재선 추가
     */
    @Transactional
    public void addApprovalLine(Long expenseReportId, ApprovalLineDto approvalLine, Long currentUserId) {
        ExpenseReportDto report = expenseReportService.getExpenseDetail(expenseReportId, currentUserId);

        if (!canModifyApprovalLines(report, currentUserId)) {
            throw new RuntimeException("결재선 수정 권한이 없습니다.");
        }

        // 다음 시퀀스 계산 (기존 결재선 수 + 1)
        int nextSequence = (report.getApprovalLines() != null) ? report.getApprovalLines().size() + 1 : 1;

        approvalLine.setExpenseReportId(expenseReportId);
        approvalLine.setStepOrder(nextSequence);
        expenseMapper.insertApprovalLine(approvalLine);
    }

    // ===== Private Helper Methods =====

    private boolean canApproveExpense(ExpenseReportDto report, Long approverId) {
        if (!"WAIT".equals(report.getStatus())) {
            return false;
        }

        // 결재자 목록에서 현재 사용자 확인
        return report.getApprovalLines() != null &&
               report.getApprovalLines().stream().anyMatch(a -> a.getApproverId().equals(approverId));
    }

    private boolean canCancelApproval(ExpenseReportDto report, Long approverId) {
        // 최근 승인한 사람이면 취소 가능
        return "APPROVED".equals(report.getStatus()) &&
               expenseMapper.hasRecentApproval(report.getExpenseReportId(), approverId);
    }

    private boolean canCancelRejection(ExpenseReportDto report, Long approverId) {
        // 최근 반려한 사람이면 취소 가능
        return "REJECTED".equals(report.getStatus()) &&
               expenseMapper.hasRecentRejection(report.getExpenseReportId(), approverId);
    }

    private boolean canModifyApprovalLines(ExpenseReportDto report, Long currentUserId) {
        // WAIT 상태이고 결의서 작성자이거나 관리자인 경우
        return "WAIT".equals(report.getStatus()) &&
               (report.getDrafterId().equals(currentUserId) || permissionUtil.isAdmin(currentUserId));
    }

    private void updateNextApproverStatus(Long expenseId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        // 간단한 로직: 결재선이 없거나 모든 결재자가 승인한 경우 APPROVED로 변경
        // TODO: 더 복잡한 결재 로직 구현 필요
        expenseMapper.updateExpenseReportStatus(expenseId, "APPROVED", companyId);
    }

    // 요약 정보 생성 헬퍼 메소드
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
