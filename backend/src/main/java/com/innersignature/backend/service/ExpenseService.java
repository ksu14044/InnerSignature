package com.innersignature.backend.service;

import com.innersignature.backend.dto.ApprovalLineDto;
import com.innersignature.backend.dto.CategoryRatioDto;
import com.innersignature.backend.dto.CompanyCardDto;
import com.innersignature.backend.dto.DashboardStatsDto;
import com.innersignature.backend.dto.ExpenseDetailDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.dto.UserCardDto;
import com.innersignature.backend.dto.MonthlyTaxSummaryDto;
import com.innersignature.backend.dto.MonthlyTrendDto;
import com.innersignature.backend.dto.PagedResponse;
import com.innersignature.backend.dto.ReceiptDto;
import com.innersignature.backend.dto.StatusStatsDto;
import com.innersignature.backend.dto.TaxStatusDto;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.PermissionUtil;
import com.innersignature.backend.util.SecurityLogger;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Service // 스프링이 "이건 비즈니스 로직 담당이야"라고 인식
@RequiredArgsConstructor // final이 붙은 변수의 생성자를 자동으로 만들어줌 (의존성 주입)
public class ExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);
    private final ExpenseMapper expenseMapper; // 아까 만든 Mapper 가져오기
    private final UserService userService; // 사용자 정보 조회용
    private final PermissionUtil permissionUtil; // 권한 체크 유틸리티
    private final MonthlyClosingService monthlyClosingService; // 월 마감 서비스
    private final BudgetService budgetService; // 예산 서비스
    private final AuditService auditService; // 감사 서비스
    private final TaxReportService taxReportService; // 부가세 신고 서식 서비스
    private final UserApproverService userApproverService; // 담당 결재자 서비스
    private final com.innersignature.backend.util.EncryptionUtil encryptionUtil; // 암호화 유틸리티
    private final CompanyCardService companyCardService; // 회사 카드 서비스
    private final UserCardService userCardService; // 개인 카드 서비스
    private final AccountCodeService accountCodeService; // 계정 코드 매핑 서비스

    // 분리된 서비스들
    private final ExpenseReportService expenseReportService;
    private final ExpenseApprovalService expenseApprovalService;
    private final ExpenseReceiptService expenseReceiptService;
    private final ExpenseAnalyticsService expenseAnalyticsService;
    private final ExpenseTaxService expenseTaxService;

    @Value("${file.upload.base-dir:uploads}")
    private String fileUploadBaseDir;
    
    @Value("${file.upload.receipts-dir:receipts}")
    private String fileUploadReceiptsDir;

    /**
     * 1. 지출결의서 목록 조회
     * - 그냥 Mapper가 준 리스트를 그대로 리턴하면 끝
     * - 권한에 따라 세무처리 정보 필터링
     * - 급여 문서 권한 필터링
     */
    public List<ExpenseReportDto> getExpenseList(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> list = expenseMapper.selectExpenseList(companyId);
        filterSalaryExpenses(list, userId);
        filterTaxProcessingInfo(list, userId);
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : list) {
            generateSummaryDescription(report);
        }
        return list;
    }

    /**
     * 1-1. 지출결의서 목록 조회 (페이지네이션)
     * - 페이지 번호와 페이지 크기를 받아서 페이지네이션된 결과를 반환
     * - 권한에 따라 세무처리 정보 필터링
     * - 급여 문서 권한 필터링
     */
    public PagedResponse<ExpenseReportDto> getExpenseList(int page, int size, Long userId) {
        // 권한 필터링 후 실제 조회 가능한 전체 개수 계산
        long totalElements = calculateFilteredTotalElements(userId);
        
        // 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // 전체 목록 조회 후 필터링 (페이지네이션 전에 필터링 필요)
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> allContent = expenseMapper.selectExpenseList(companyId);
        
        // 급여 문서 권한 필터링
        filterSalaryExpenses(allContent, userId);
        // 권한에 따라 세무처리 정보 필터링
        filterTaxProcessingInfo(allContent, userId);
        
        // 필터링 후 페이지네이션 적용
        int offset = (page - 1) * size;
        int fromIndex = Math.min(offset, allContent.size());
        int toIndex = Math.min(offset + size, allContent.size());
        List<ExpenseReportDto> content = allContent.subList(fromIndex, toIndex);
        
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : content) {
            generateSummaryDescription(report);
        }
        
        // PagedResponse 객체 생성 및 반환
        return new PagedResponse<>(content, page, size, totalElements, totalPages);
    }

    /**
     * 1-2. 지출결의서 목록 조회 (필터링 + 페이지네이션)
     * - 필터링 조건과 페이지네이션을 함께 적용한 결과를 반환
     * - 권한에 따라 세무처리 정보 필터링
     * @param page 페이지 번호 (1부터 시작)
     * @param size 페이지 크기
     * @param startDate 작성일 시작일 (optional)
     * @param endDate 작성일 종료일 (optional)
     * @param minAmount 최소 금액 (optional)
     * @param maxAmount 최대 금액 (optional)
     * @param statuses 상태 리스트 (optional, 여러 개 선택 가능)
     * @param category 카테고리 (optional)
     * @param taxProcessed 세무처리 완료 여부 (optional, true: 완료, false: 미완료, null: 전체)
     * @param userId 현재 사용자 ID (권한 필터링용)
     */
    public PagedResponse<ExpenseReportDto> getExpenseList(
            int page,
            int size,
            LocalDate startDate,
            LocalDate endDate,
            Long minAmount,
            Long maxAmount,
            List<String> statuses,
            String category,
            Boolean taxProcessed,
            String drafterName,
            Long userId,
            String paymentMethod,
            String cardNumber) {
        
        // statuses가 null이거나 비어있으면 null로 설정 (필터링 안 함)
        if (statuses != null && statuses.isEmpty()) {
            statuses = null;
        }
        
        // 필터링 조건 + 권한 필터링 후 실제 조회 가능한 전체 개수 계산
        // 일반 사용자는 자신이 작성한 글만 조회
        UserDto currentUser = userService.selectUserById(userId);
        boolean isRegularUser = currentUser != null && "USER".equals(currentUser.getRole());
        String finalDrafterName = drafterName;
        if (isRegularUser && (finalDrafterName == null || finalDrafterName.trim().isEmpty())) {
            finalDrafterName = currentUser.getKoreanName();
        }
        
        long totalElements = calculateFilteredTotalElements(
                startDate, endDate, minAmount, maxAmount,
                statuses, category, taxProcessed,
                finalDrafterName, userId, paymentMethod, cardNumber);
        
        // 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // 필터링된 전체 데이터 조회 (페이지네이션 없이)
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        List<ExpenseReportDto> allContent = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                minAmount, maxAmount,
                statuses, category, taxProcessed,
                finalDrafterName, companyId, paymentMethod, null); // cardNumber는 애플리케이션 레벨에서 필터링
        
        // 급여 문서 권한 필터링
        filterSalaryExpenses(allContent, userId);
        // 권한에 따라 세무처리 정보 필터링
        filterTaxProcessingInfo(allContent, userId);
        
        // 일반 사용자는 자신이 작성한 글만 필터링 (이중 체크)
        if (isRegularUser) {
            allContent = allContent.stream()
                .filter(report -> report.getDrafterId().equals(userId))
                .collect(java.util.stream.Collectors.toList());
        }
        
        // 카드번호 필터링 (암호화되어 있어서 애플리케이션 레벨에서 처리)
        if (cardNumber != null && !cardNumber.trim().isEmpty()) {
            allContent = filterByCardNumber(allContent, cardNumber, companyId);
        }
        
        // 필터링 후 페이지네이션 적용
        int offset = (page - 1) * size;
        int fromIndex = Math.min(offset, allContent.size());
        int toIndex = Math.min(offset + size, allContent.size());
        List<ExpenseReportDto> content = allContent.subList(fromIndex, toIndex);
        
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : content) {
            generateSummaryDescription(report);
        }
        
        // PagedResponse 객체 생성 및 반환
        return new PagedResponse<>(content, page, size, totalElements, totalPages);
    }

    /**
     * 2. 지출결의서 상세 조회 (핵심 로직!)
     * - DB 테이블 3군데서 데이터를 각각 가져와서
     * - 하나의 DTO에 예쁘게 담아서 리턴함
     * - 권한에 따라 세무처리 정보 필터링
     */
    public ExpenseReportDto getExpenseDetail(Long expenseReportId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // (1) 메인 문서 정보 가져오기
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        
        // 만약 문서가 없으면 null 리턴 (혹은 에러 처리)
        if (report == null) {
            return null;
        }

        // (2) 상세 항목들(식대, 간식...) 가져오기
        List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetails(expenseReportId, companyId);
        
        // (2-0) 카드번호 마스킹 처리 (마지막 4자리만 표시)
        if (details != null) {
            for (ExpenseDetailDto detail : details) {
                if (detail.getCardNumber() != null && !detail.getCardNumber().trim().isEmpty()) {
                    try {
                        String decryptedCardNumber = encryptionUtil.decrypt(detail.getCardNumber());
                        if (decryptedCardNumber != null && !decryptedCardNumber.isEmpty()) {
                            // 마지막 4자리만 표시 (예: **** 1234)
                            String maskedCardNumber = maskCardNumber(decryptedCardNumber);
                            detail.setCardNumber(maskedCardNumber);
                        }
                    } catch (Exception e) {
                        logger.debug("카드번호 복호화 실패 - detailId: {}", detail.getExpenseDetailId(), e);
                        detail.setCardNumber(null); // 복호화 실패 시 null로 설정
                    }
                }
            }
        }
        
        // (2-1) 급여 카테고리 권한 체크
        if (userId != null) {
            boolean hasSalary = hasSalaryCategory(details);
            
            if (hasSalary) {
                UserDto user = userService.selectUserById(userId);
                boolean isTaxAccountant = user != null && "TAX_ACCOUNTANT".equals(user.getRole());
                boolean isCEO = user != null && "CEO".equals(user.getRole());
                boolean isOwner = report.getDrafterId().equals(userId);
                
                // CEO는 같은 회사의 모든 급여 문서 조회 가능
                if (isCEO) {
                    Long userCompanyId = user.getCompanyId();
                    if (userCompanyId != null && userCompanyId.equals(companyId)) {
                        // CEO는 같은 회사 급여 문서 조회 가능
                    } else {
                        throw new com.innersignature.backend.exception.BusinessException("비밀 문서에 대한 조회 권한이 없습니다.");
                    }
                } else if (!isTaxAccountant && !isOwner) {
                    throw new com.innersignature.backend.exception.BusinessException("비밀 문서에 대한 조회 권한이 없습니다.");
                }
            }
        }
        
        // (3) 결재 라인(담당->전무->대표) 가져오기
        List<ApprovalLineDto> lines = expenseMapper.selectApprovalLines(expenseReportId, companyId);

        // (4) 영수증 목록 가져오기
        List<ReceiptDto> receipts = expenseMapper.selectReceiptsByExpenseReportId(expenseReportId, companyId);

        // (5) 가져온 부품들을 메인 DTO에 조립하기
        report.setDetails(details);
        report.setApprovalLines(lines);
        report.setReceipts(receipts);

        // (6) 권한에 따라 세무처리 정보 필터링
        // USER 역할은 세무처리 완료 상태를 볼 수 없음
        if (userId != null) {
            UserDto user = userService.selectUserById(userId);
            if (user != null && "USER".equals(user.getRole())) {
                report.setTaxProcessed(null);
                report.setTaxProcessedAt(null);
            }
        }

        // (7) 완성된 하나를 리턴
        return report;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void approveExpense(Long expenseId, Long approverId, String signatureData) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 해당 문서의 모든 결재 라인 조회
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseId, companyId);

        // 2. 현재 결재자의 순서 찾기
        ApprovalLineDto currentApproverLine = null;

        for (ApprovalLineDto line : approvalLines) {
            if (line.getApproverId().equals(approverId)) {
                currentApproverLine = line;
                break;
            }
        }

        if (currentApproverLine == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 결재자가 결재 라인에 존재하지 않습니다.");
        }

        // 3. 현재 결재자 승인 처리
        ApprovalLineDto lineDto = new ApprovalLineDto();
        lineDto.setExpenseReportId(expenseId);
        lineDto.setApproverId(approverId);
        lineDto.setSignatureData(signatureData);
        expenseMapper.updateApprovalLine(lineDto, companyId);

        // 5. 승인 처리 후 최신 결재 라인 상태 조회
        List<ApprovalLineDto> updatedApprovalLines = expenseMapper.selectApprovalLines(expenseId, companyId);

        // 6. 모든 결재자가 승인되었는지 확인
        boolean allApproved = true;
        for (ApprovalLineDto line : updatedApprovalLines) {
            if (!"APPROVED".equals(line.getStatus())) {
                allApproved = false;
                break;
            }
        }

        // 7. 모든 결재자가 승인되었으면 문서 상태를 변경
        if (allApproved) {
            // 결의서 정보를 조회하여 가승인 여부에 따라 상태를 분기
            ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseId, companyId);
            
            // 승인이 완료되면 APPROVED 상태로 설정 (지출로 간주)
            String nextStatus = "APPROVED";
            
            expenseMapper.updateExpenseReportStatus(expenseId, nextStatus, companyId);
        }
    }

    /**
     * 결제 반려 처리
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void rejectExpense(Long expenseId, Long approverId, String rejectionReason) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 해당 문서의 모든 결재 라인 조회
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseId, companyId);

        // 2. 현재 결재자의 순서 찾기
        ApprovalLineDto currentApproverLine = null;

        for (ApprovalLineDto line : approvalLines) {
            if (line.getApproverId().equals(approverId)) {
                currentApproverLine = line;
                break;
            }
        }

        if (currentApproverLine == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 결재자가 결재 라인에 존재하지 않습니다.");
        }

        // 3. 현재 결재자 반려 처리
        ApprovalLineDto lineDto = new ApprovalLineDto();
        lineDto.setExpenseReportId(expenseId);
        lineDto.setApproverId(approverId);
        lineDto.setRejectionReason(rejectionReason);
        expenseMapper.rejectApprovalLine(lineDto, companyId);

        // 4. 문서 상태를 REJECTED로 변경
        expenseMapper.updateExpenseReportStatus(expenseId, "REJECTED", companyId);
    }

    /**
     * 결재 취소 처리
     * 서명 완료된 결재 라인을 WAIT 상태로 되돌립니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cancelApproval(Long expenseId, Long approverId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 해당 문서의 모든 결재 라인 조회
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseId, companyId);

        // 2. 현재 결재자의 결재 라인 찾기
        ApprovalLineDto currentApproverLine = null;
        for (ApprovalLineDto line : approvalLines) {
            if (line.getApproverId().equals(approverId)) {
                currentApproverLine = line;
                break;
            }
        }

        if (currentApproverLine == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 결재자가 결재 라인에 존재하지 않습니다.");
        }

        // 3. 현재 결재 라인이 APPROVED 상태인지 확인
        if (!"APPROVED".equals(currentApproverLine.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("결재 완료된 결재 라인만 취소할 수 있습니다.");
        }

        // 4. APPROVED 상태인 문서는 취소 불가
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseId, companyId);
        if (report != null && "APPROVED".equals(report.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("승인 완료된 문서는 결재 취소할 수 없습니다.");
        }

        // 5. 결재 취소 처리 (APPROVED -> WAIT)
        ApprovalLineDto lineDto = new ApprovalLineDto();
        lineDto.setExpenseReportId(expenseId);
        lineDto.setApproverId(approverId);
        expenseMapper.cancelApprovalLine(lineDto, companyId);

        // 6. 취소 후 최신 결재 라인 상태 조회
        List<ApprovalLineDto> updatedApprovalLines = expenseMapper.selectApprovalLines(expenseId, companyId);

        // 7. 모든 결재 라인이 WAIT 상태인지 확인
        boolean allWait = true;
        for (ApprovalLineDto line : updatedApprovalLines) {
            if (!"WAIT".equals(line.getStatus())) {
                allWait = false;
                break;
            }
        }

        // 8. 모든 결재 라인이 WAIT 상태면 문서 상태를 WAIT로 변경
        if (allWait) {
            expenseMapper.updateExpenseReportStatus(expenseId, "WAIT", companyId);
        } else {
            // 일부만 취소된 경우 문서 상태를 WAIT로 변경 (다시 결재 진행 가능하도록)
            expenseMapper.updateExpenseReportStatus(expenseId, "WAIT", companyId);
        }
    }

    /**
     * 반려 취소 처리
     * 반려된 결재 라인을 WAIT 상태로 되돌립니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cancelRejection(Long expenseId, Long approverId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 해당 문서의 모든 결재 라인 조회
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseId, companyId);

        // 2. 현재 결재자의 결재 라인 찾기
        ApprovalLineDto currentApproverLine = null;
        for (ApprovalLineDto line : approvalLines) {
            if (line.getApproverId().equals(approverId)) {
                currentApproverLine = line;
                break;
            }
        }

        if (currentApproverLine == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 결재자가 결재 라인에 존재하지 않습니다.");
        }

        // 3. 현재 결재 라인이 REJECTED 상태인지 확인
        if (!"REJECTED".equals(currentApproverLine.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("반려된 결재 라인만 취소할 수 있습니다.");
        }

        // 4. APPROVED 상태인 문서는 취소 불가
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseId, companyId);
        if (report != null && "APPROVED".equals(report.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("승인 완료된 문서는 반려 취소할 수 없습니다.");
        }

        // 5. 반려 취소 처리 (REJECTED -> WAIT)
        ApprovalLineDto lineDto = new ApprovalLineDto();
        lineDto.setExpenseReportId(expenseId);
        lineDto.setApproverId(approverId);
        expenseMapper.cancelRejectionLine(lineDto, companyId);

        // 6. 문서 상태를 WAIT로 변경 (다시 결재 진행 가능하도록)
        expenseMapper.updateExpenseReportStatus(expenseId, "WAIT", companyId);
    }

    /**
     * 3. 기안서 생성 (저장) 로직
     * 설명: 프론트에서 받은 큰 덩어리 데이터를 쪼개서 DB 테이블 3곳에 차례대로 넣습니다.
     * @return 생성된 지출결의서 ID
     */
    @Transactional(isolation = Isolation.READ_COMMITTED) // 중요! 중간에 에러 나면 저장하던 거 취소하고 싹 다 롤백(되돌리기)함
    public Long createExpense(ExpenseReportDto request, Long currentUserId) {

        // (0) 기본값 설정
        if (request.getReportDate() == null) {
            request.setReportDate(LocalDate.now());
        }

        // (0-1) 작성자 검증: 요청된 drafterId와 현재 사용자 일치 확인
        if (request.getDrafterId() == null) {
            request.setDrafterId(currentUserId);
        } else if (!request.getDrafterId().equals(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("작성자와 로그인 사용자가 일치해야 합니다.");
        }
        
        // (0-2) 역할 검증: TAX_ACCOUNTANT는 기안서 생성 불가
        if (permissionUtil.isTaxAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("TAX_ACCOUNTANT 역할은 결의서를 생성할 수 없습니다.");
        }

        // (0-3) 상세 항목들로부터 총 금액 계산 및 급여 카테고리 확인
        List<ExpenseDetailDto> details = request.getDetails();
        long totalAmount = 0L;
        boolean hasSalary = false;
        if (details != null) {
            for (ExpenseDetailDto detail : details) {
                // 결제수단 필수 검증
                if (detail.getPaymentMethod() == null || detail.getPaymentMethod().trim().isEmpty()) {
                    throw new com.innersignature.backend.exception.BusinessException("결제수단은 필수입니다.");
                }
                
                // 카드 결제인 경우 카드번호 처리
                if ("CARD".equals(detail.getPaymentMethod()) || "COMPANY_CARD".equals(detail.getPaymentMethod()) || "CREDIT_CARD".equals(detail.getPaymentMethod()) || "DEBIT_CARD".equals(detail.getPaymentMethod())) {
                    // 저장된 카드 ID가 있는 경우 해당 카드의 암호화된 카드번호 사용
                    if (detail.getCardId() != null) {
                        try {
                            String encryptedCardNumber = null;
                            if ("COMPANY_CARD".equals(detail.getPaymentMethod())) {
                                CompanyCardDto card = companyCardService.getCardForInternalUse(detail.getCardId(), currentUserId);
                                encryptedCardNumber = card.getCardNumberEncrypted();
                            } else if ("CARD".equals(detail.getPaymentMethod())) {
                                UserCardDto card = userCardService.getCardForInternalUse(detail.getCardId(), currentUserId);
                                encryptedCardNumber = card.getCardNumberEncrypted();
                            }
                            
                            if (encryptedCardNumber != null) {
                                detail.setCardNumber(encryptedCardNumber);
                            } else {
                                throw new com.innersignature.backend.exception.BusinessException("저장된 카드를 찾을 수 없습니다.");
                            }
                        } catch (Exception e) {
                            logger.error("저장된 카드 조회 실패 - paymentMethod: {}, cardId: {}", detail.getPaymentMethod(), detail.getCardId(), e);
                            throw new com.innersignature.backend.exception.BusinessException("저장된 카드를 조회하는 중 오류가 발생했습니다: " + e.getMessage());
                        }
                    } else if (detail.getCardNumber() != null && !detail.getCardNumber().trim().isEmpty()) {
                        // 직접 입력한 카드번호인 경우 암호화
                        try {
                            String encryptedCardNumber = encryptionUtil.encrypt(detail.getCardNumber());
                            detail.setCardNumber(encryptedCardNumber);
                        } catch (Exception e) {
                            logger.error("카드번호 암호화 실패 - paymentMethod: {}, cardNumber: {}", detail.getPaymentMethod(), detail.getCardNumber(), e);
                            throw new com.innersignature.backend.exception.BusinessException("카드번호 암호화에 실패했습니다: " + e.getMessage());
                        }
                    }
                }
                
                // 지급 요청일과 가승인은 결의서 단위이므로 detail에서는 null로 설정
                detail.setPaymentReqDate(null);
                detail.setIsPreApproval(null);
                
                totalAmount += detail.getAmount();
                if ("급여".equals(detail.getCategory())) {
                    hasSalary = true;
                }
            }
        }
        request.setTotalAmount(totalAmount);
        
        // (0-3-1) 가승인이 아닌 경우 영수증 필수 검증 (실제로는 프론트에서 검증하지만 백엔드에서도 체크)
        // 영수증은 별도 API로 업로드되므로 여기서는 검증만 수행

        // (0-4) 급여 카테고리는 CEO, ADMIN 또는 ACCOUNTANT만 사용 가능
        if (hasSalary && !permissionUtil.isAdminOrCEO(currentUserId) && !permissionUtil.isAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("급여 카테고리는 CEO, ADMIN 또는 ACCOUNTANT 권한만 사용할 수 있습니다.");
        }

        // (0-5) 급여인 경우 상태를 바로 APPROVED로 설정 (결재 없이 바로 승인완료)
        if (hasSalary) {
            request.setStatus("APPROVED");
        }

        // (0-6) 예산 체크 (상세 항목별로)
        if (details != null) {
            LocalDate reportDate = request.getReportDate();
            int year = reportDate.getYear();
            int month = reportDate.getMonthValue();
            
            for (ExpenseDetailDto detail : details) {
                String budgetWarning = budgetService.checkBudget(
                        year, month, detail.getCategory(), detail.getAmount());
                if (budgetWarning != null) {
                    logger.warn("예산 경고 - category: {}, amount: {}, warning: {}", 
                            detail.getCategory(), detail.getAmount(), budgetWarning);
                    // 경고는 로그만 남기고 계속 진행 (차단은 checkBudget 내부에서 예외 발생)
                }
            }
        }

        // (1) 메인 문서(제목, 작성자 등) 먼저 저장
        // 이 과정이 끝나야 문서 번호(ID)가 생성됩니다.
        Long companyId = SecurityUtil.getCurrentCompanyId();
        request.setCompanyId(companyId);
        
        // title이 없으면 자동 생성 (예: "지출결의서 - 2026-01-06")
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            String autoTitle = "지출결의서 - " + request.getReportDate();
            request.setTitle(autoTitle);
        }
        
        expenseMapper.insertExpenseReport(request);

        // 방금 DB에 들어가면서 생성된 문서 번호(PK)를 꺼내옵니다.
        Long newId = request.getExpenseReportId();

        // (2) 상세 항목들(식대, 교통비 등) 저장
        // 리스트로 들어왔으니 반복문(for)을 돌면서 하나씩 저장합니다.
        if (details != null) {
            logger.debug("상세 항목 저장 시작 - 항목 수: {}", details.size());
            for (ExpenseDetailDto detail : details) {
                detail.setExpenseReportId(newId); // "이 항목은 방금 만든 그 문서(newId) 꺼야"라고 연결
                detail.setCompanyId(companyId);
                expenseMapper.insertExpenseDetail(detail);
            }
            logger.debug("상세 항목 저장 완료");
        }
        
        // (2-1) 담당 결재자 자동 설정 (급여가 아닌 경우)
        if (!hasSalary) {
            try {
                List<UserDto> approvers = userApproverService.getActiveApproversByUserId(currentUserId, companyId);
                if (approvers != null && !approvers.isEmpty()) {
                    // 담당 결재자가 1명이면 자동 설정, 2명 이상이면 첫 번째 담당 결재자 자동 설정
                    // (실제로는 프론트에서 선택하지만, 백엔드에서도 기본값 설정)
                    if (request.getApprovalLines() == null || request.getApprovalLines().isEmpty()) {
                        // 첫 번째 담당 결재자를 기본 결재자로 설정
                        UserDto firstApprover = approvers.get(0);
                        ApprovalLineDto defaultLine = new ApprovalLineDto();
                        defaultLine.setApproverId(firstApprover.getUserId());
                        defaultLine.setApproverName(firstApprover.getKoreanName());
                        defaultLine.setApproverPosition(firstApprover.getPosition());
                        defaultLine.setStatus("WAIT");
                        request.setApprovalLines(java.util.Collections.singletonList(defaultLine));
                    }
                }
            } catch (Exception e) {
                logger.warn("담당 결재자 자동 설정 실패 - userId: {}", currentUserId, e);
                // 담당 결재자 설정 실패해도 문서 생성은 계속 진행 (프론트에서 수동 선택 가능)
            }
        }

        // (3) 결재 라인(누가 승인해야 하는지) 저장
        // ※ 현재 플로우에서는 프론트에서 별도 API(setApprovalLines)를 통해 결재 라인을 설정하므로,
        //    createExpense에서는 결재 라인을 저장하지 않습니다.
        //    결재 라인은 프론트엔드에서 setApprovalLines API를 호출하여 별도로 설정합니다.
        logger.debug("결재 라인은 setApprovalLines API를 통해 별도로 설정됩니다.");

        // (4) 자동 감사 실행
        try {
            auditService.auditExpenseReport(newId);
        } catch (Exception e) {
            logger.error("자동 감사 실행 실패 - expenseReportId: {}", newId, e);
            // 감사 실패해도 문서 생성은 계속 진행
        }

        // 생성된 문서 ID 반환
        logger.info("지출결의서 생성 완료 - expenseReportId: {}", newId);
        return newId;
    }

    /**
     * 3-1. 기안서 수정 로직
     * 설명: WAIT 상태의 지출결의서만 수정 가능합니다.
     * @return 수정된 지출결의서 ID
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Long updateExpense(Long expenseId, ExpenseReportDto request, Long currentUserId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 기존 문서 조회
        ExpenseReportDto existingReport = expenseMapper.selectExpenseReportById(expenseId, companyId);
        if (existingReport == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }

        // 1-1. 마감된 월인지 확인
        if (existingReport.getReportDate() != null) {
            if (monthlyClosingService.isDateClosed(existingReport.getReportDate())) {
                throw new com.innersignature.backend.exception.BusinessException(
                        String.format("%d년 %d월은 마감되어 있어 수정할 수 없습니다.", 
                                existingReport.getReportDate().getYear(), 
                                existingReport.getReportDate().getMonthValue()));
            }
        }

        // 2. WAIT 상태에서만 수정 가능
        if (!"WAIT".equals(existingReport.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("WAIT 상태의 문서만 수정할 수 있습니다.");
        }

        // 2-1. 세무 수집 체크: 세무 수집된 문서는 수정 요청이 없으면 수정 불가
        if (existingReport.getTaxCollectedAt() != null) {
            if (!Boolean.TRUE.equals(existingReport.getTaxRevisionRequested())) {
                throw new com.innersignature.backend.exception.BusinessException("세무 수집된 문서는 수정할 수 없습니다. 세무사가 수정 요청을 보낸 경우에만 수정 가능합니다.");
            }
        }

        // 3. APPROVED 상태 체크 (이중 체크)
        if ("APPROVED".equals(existingReport.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("승인 완료된 문서는 수정할 수 없습니다.");
        }

        // 4. 작성자 본인만 수정 가능
        if (!existingReport.getDrafterId().equals(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("작성자 본인만 수정할 수 있습니다.");
        }

        // 5. 역할 검증: TAX_ACCOUNTANT는 수정 불가
        if (permissionUtil.isTaxAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("TAX_ACCOUNTANT 역할은 결의서를 수정할 수 없습니다.");
        }

        // 6. 상세 항목들로부터 총 금액 계산 및 급여 카테고리 확인
        List<ExpenseDetailDto> details = request.getDetails();
        long totalAmount = 0L;
        boolean hasSalary = false;
        if (details != null) {
            for (ExpenseDetailDto detail : details) {
                // 결제수단 필수 검증
                if (detail.getPaymentMethod() == null || detail.getPaymentMethod().trim().isEmpty()) {
                    throw new com.innersignature.backend.exception.BusinessException("결제수단은 필수입니다.");
                }
                
                // 카드 결제인 경우 카드번호 처리
                if ("CARD".equals(detail.getPaymentMethod()) || "COMPANY_CARD".equals(detail.getPaymentMethod()) || "CREDIT_CARD".equals(detail.getPaymentMethod()) || "DEBIT_CARD".equals(detail.getPaymentMethod())) {
                    // 저장된 카드 ID가 있는 경우 해당 카드의 암호화된 카드번호 사용
                    if (detail.getCardId() != null) {
                        try {
                            String encryptedCardNumber = null;
                            if ("COMPANY_CARD".equals(detail.getPaymentMethod())) {
                                CompanyCardDto card = companyCardService.getCardForInternalUse(detail.getCardId(), currentUserId);
                                encryptedCardNumber = card.getCardNumberEncrypted();
                            } else if ("CARD".equals(detail.getPaymentMethod())) {
                                UserCardDto card = userCardService.getCardForInternalUse(detail.getCardId(), currentUserId);
                                encryptedCardNumber = card.getCardNumberEncrypted();
                            }
                            
                            if (encryptedCardNumber != null) {
                                detail.setCardNumber(encryptedCardNumber);
                            } else {
                                throw new com.innersignature.backend.exception.BusinessException("저장된 카드를 찾을 수 없습니다.");
                            }
                        } catch (Exception e) {
                            logger.error("저장된 카드 조회 실패 - paymentMethod: {}, cardId: {}", detail.getPaymentMethod(), detail.getCardId(), e);
                            throw new com.innersignature.backend.exception.BusinessException("저장된 카드를 조회하는 중 오류가 발생했습니다: " + e.getMessage());
                        }
                    } else if (detail.getCardNumber() != null && !detail.getCardNumber().trim().isEmpty()) {
                        // 직접 입력한 카드번호인 경우 암호화
                        try {
                            String encryptedCardNumber = encryptionUtil.encrypt(detail.getCardNumber());
                            detail.setCardNumber(encryptedCardNumber);
                        } catch (Exception e) {
                            logger.error("카드번호 암호화 실패 - paymentMethod: {}, cardNumber: {}", detail.getPaymentMethod(), detail.getCardNumber(), e);
                            throw new com.innersignature.backend.exception.BusinessException("카드번호 암호화에 실패했습니다: " + e.getMessage());
                        }
                    }
                }
                
                totalAmount += detail.getAmount();
                if ("급여".equals(detail.getCategory())) {
                    hasSalary = true;
                }
            }
        }
        request.setTotalAmount(totalAmount);

        // 7. 급여 카테고리는 CEO, ADMIN 또는 ACCOUNTANT만 사용 가능
        if (hasSalary && !permissionUtil.isAdminOrCEO(currentUserId) && !permissionUtil.isAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("급여 카테고리는 CEO, ADMIN 또는 ACCOUNTANT 권한만 사용할 수 있습니다.");
        }

        // 8. 메인 문서 수정
        request.setExpenseReportId(expenseId);
        request.setDrafterId(existingReport.getDrafterId()); // 작성자는 변경 불가
        request.setCompanyId(companyId);
        request.setStatus("WAIT"); // 상태는 WAIT로 유지
        expenseMapper.updateExpenseReport(request, companyId);

        // 11. 기존 상세 항목 삭제
        expenseMapper.deleteExpenseDetails(expenseId, companyId);

        // 12. 새로운 상세 항목 저장
        if (details != null) {
            logger.debug("상세 항목 수정 시작 - 항목 수: {}", details.size());
            for (ExpenseDetailDto detail : details) {
                detail.setExpenseReportId(expenseId);
                detail.setCompanyId(companyId);
                // 지급 요청일과 가승인은 결의서 단위이므로 detail에서는 null로 설정
                detail.setPaymentReqDate(null);
                detail.setIsPreApproval(null);
                expenseMapper.insertExpenseDetail(detail);
            }
            logger.debug("상세 항목 수정 완료");
        }

        // 13. 기존 결재 라인 삭제 (WAIT 상태이므로 결재가 시작되지 않았음)
        expenseMapper.deleteApprovalLines(expenseId, companyId);

        // 14. 새로운 결재 라인 저장 (급여가 아닌 경우에만)
        List<ApprovalLineDto> lines = request.getApprovalLines();

        if (!hasSalary && lines != null && !lines.isEmpty()) {
            logger.debug("결재 라인 수정 시작 - 라인 수: {}", lines.size());
            int stepOrder = 1;
            for (ApprovalLineDto line : lines) {
                line.setExpenseReportId(expenseId);
                line.setStepOrder(stepOrder++);
                line.setStatus("WAIT");
                line.setCompanyId(companyId);
                expenseMapper.insertApprovalLine(line);
            }
            logger.debug("결재 라인 수정 완료");
        } else if (hasSalary) {
            logger.debug("급여 문서는 결재 라인이 생성되지 않습니다.");
        }

        // 15. 세무 수정 요청이 있었던 경우, 수정 완료 후 플래그 초기화
        if (existingReport.getTaxRevisionRequested() != null && existingReport.getTaxRevisionRequested()) {
            expenseMapper.updateTaxRevisionRequest(expenseId, false, null, companyId);
            logger.debug("세무 수정 요청 플래그 초기화 - expenseReportId: {}", expenseId);
        }

        logger.info("지출결의서 수정 완료 - expenseReportId: {}", expenseId);
        return expenseId;
    }

    /**
     * 4. 결재 라인 설정 (별도 설정용)
     * 설명: 이미 생성된 지출결의서에 결재 라인을 추가합니다.
     */
    @Transactional
    public void setApprovalLines(Long expenseReportId, List<ApprovalLineDto> approvalLines) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        if (approvalLines == null || approvalLines.isEmpty()) {
            logger.debug("결재 라인이 비어있어 저장하지 않습니다.");
            return;
        }
        
        // stepOrder 설정 및 저장
        int stepOrder = 1;
        for (ApprovalLineDto line : approvalLines) {
            line.setExpenseReportId(expenseReportId);
            line.setStepOrder(stepOrder++);
            if (line.getStatus() == null) {
                line.setStatus("WAIT");
            }
            line.setCompanyId(companyId);
            expenseMapper.insertApprovalLine(line);
        }
        logger.debug("결재 라인 저장 완료 - expenseReportId: {}, 라인 수: {}", expenseReportId, approvalLines.size());
    }

    /**
     * 4-1. 추가 결재 라인 추가 (첫 결재자가 결재 후 추가 결재자 추가)
     * 설명: 첫 결재자가 결재한 후 추가 결재자를 추가합니다.
     */
    @Transactional
    public void addApprovalLine(Long expenseReportId, ApprovalLineDto approvalLine, Long currentUserId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 문서 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }
        
        // 2. 기존 결재 라인 조회
        List<ApprovalLineDto> existingLines = expenseMapper.selectApprovalLines(expenseReportId, companyId);
        if (existingLines == null || existingLines.isEmpty()) {
            throw new com.innersignature.backend.exception.BusinessException("기존 결재 라인이 없습니다.");
        }
        
        // 3. 첫 결재자가 결재했는지 확인
        ApprovalLineDto firstLine = existingLines.get(0);
        if (firstLine.getSignatureData() == null || firstLine.getSignatureData().trim().isEmpty()) {
            throw new com.innersignature.backend.exception.BusinessException("첫 결재자가 아직 결재하지 않았습니다.");
        }
        
        // 4. 첫 결재자가 현재 사용자인지 확인
        if (!firstLine.getApproverId().equals(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("첫 결재자만 추가 결재자를 설정할 수 있습니다.");
        }
        
        // 5. 이미 추가된 결재자인지 확인
        boolean alreadyExists = existingLines.stream()
            .anyMatch(line -> line.getApproverId().equals(approvalLine.getApproverId()));
        if (alreadyExists) {
            throw new com.innersignature.backend.exception.BusinessException("이미 결재 라인에 존재하는 결재자입니다.");
        }
        
        // 6. stepOrder는 기존 최대값 + 1로 설정
        int maxStepOrder = existingLines.stream()
            .mapToInt(ApprovalLineDto::getStepOrder)
            .max()
            .orElse(0);
        
        approvalLine.setExpenseReportId(expenseReportId);
        approvalLine.setStepOrder(maxStepOrder + 1);
        approvalLine.setStatus("WAIT");
        approvalLine.setCompanyId(companyId);
        
        expenseMapper.insertApprovalLine(approvalLine);
        
        // 7. 추가 결재자를 추가했으므로 문서 상태가 APPROVED인 경우 WAIT로 변경
        if ("APPROVED".equals(report.getStatus())) {
            expenseMapper.updateExpenseReportStatus(expenseReportId, "WAIT", companyId);
            logger.info("추가 결재자 추가로 인해 문서 상태를 WAIT로 변경 - expenseReportId: {}", expenseReportId);
        }
        
        logger.info("추가 결재 라인 추가 완료 - expenseReportId: {}, approverId: {}", expenseReportId, approvalLine.getApproverId());
    }


    /**
     * 지출결의서 삭제
     * 작성자 본인, ADMIN 권한, 또는 ACCOUNTANT 권한을 가진 사용자만 삭제 가능
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteExpense(Long expenseReportId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 삭제할 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 문서를 찾을 수 없습니다.");
        }

        // 2. 권한 체크: 작성자 본인, ADMIN, 또는 ACCOUNTANT 권한자만 삭제 가능
        permissionUtil.checkDeletePermission(report, userId);

        // 2-1. 마감된 월인지 확인
        if (report.getReportDate() != null) {
            if (monthlyClosingService.isDateClosed(report.getReportDate())) {
                throw new com.innersignature.backend.exception.BusinessException(
                        String.format("%d년 %d월은 마감되어 있어 삭제할 수 없습니다.", 
                                report.getReportDate().getYear(), 
                                report.getReportDate().getMonthValue()));
            }
        }

        // 2-2. 세무 수집 체크: 세무 수집된 문서는 수정 요청이 없으면 삭제 불가
        if (report.getTaxCollectedAt() != null) {
            if (!Boolean.TRUE.equals(report.getTaxRevisionRequested())) {
                throw new com.innersignature.backend.exception.BusinessException("세무 수집된 문서는 삭제할 수 없습니다. 세무사가 수정 요청을 보낸 경우에만 삭제 가능합니다.");
            }
        }

        // 3. 문서 삭제 (CASCADE DELETE로 관련 데이터도 함께 삭제됨)
        expenseMapper.deleteExpenseReport(expenseReportId, companyId);
    }

    /**
     * 미서명 건 조회
     * 현재 사용자가 서명해야 할 미완료 건 목록을 반환합니다.
     * 권한에 따라 세무처리 정보 필터링
     * 급여 문서 권한 필터링
     */
    public List<ExpenseReportDto> getPendingApprovals(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> list = expenseMapper.selectPendingApprovalsByUserId(userId, companyId);
        
        // 결재함에서는 급여 문서라도,
        // "내가 결재자로 들어간 문서"는 반드시 봐야 하므로 급여 필터링은 하지 않는다.
        // filterSalaryExpenses(list, userId);
        
        // 세무 처리 정보는 일반 USER에게는 숨기고, 권한 가진 사람에겐 보여주도록 유지
        filterTaxProcessingInfo(list, userId);
        
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : list) {
            generateSummaryDescription(report);
        }
        return list;
    }

    /**
     * 내가 결재했던 문서 조회
     * 현재 사용자가 APPROVED/REJECTED 한 문서 이력을 반환합니다.
     * 권한에 따라 세무처리 정보 필터링 및 급여 문서 필터링을 동일하게 적용합니다.
     */
    public List<ExpenseReportDto> getMyApprovedReports(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> list = expenseMapper.selectMyApprovedReportsByUserId(userId, companyId);
        filterSalaryExpenses(list, userId);
        filterTaxProcessingInfo(list, userId);
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : list) {
            generateSummaryDescription(report);
        }
        return list;
    }

    /**
     * 영수증 업로드
     * 작성자 또는 ACCOUNTANT만 영수증을 첨부할 수 있습니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void uploadReceipt(Long expenseReportId, Long userId, MultipartFile file) throws IOException {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 문서를 찾을 수 없습니다.");
        }

        // 2. WAIT 또는 APPROVED 상태인지 확인
        // - WAIT: 작성자가 생성 시 영수증을 첨부할 수 있도록 허용
        // - APPROVED: 승인 완료 후 영수증을 첨부할 수 있도록 허용
        if (!"WAIT".equals(report.getStatus()) && !"APPROVED".equals(report.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("WAIT 또는 APPROVED 상태의 문서만 영수증을 첨부할 수 있습니다.");
        }

        // 3. 권한 체크: 작성자 또는 ACCOUNTANT만 가능
        permissionUtil.checkReceiptPermission(report, userId);

        // 5. 파일 크기 제한 (10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new com.innersignature.backend.exception.BusinessException("파일 크기는 10MB를 초과할 수 없습니다.");
        }

        // 6. 파일 타입 검증 (이미지, PDF)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new com.innersignature.backend.exception.BusinessException("파일명이 없습니다.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        List<String> allowedExtensions = List.of("jpg", "jpeg", "png", "gif", "pdf");
        if (!allowedExtensions.contains(extension)) {
            throw new com.innersignature.backend.exception.BusinessException("지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, pdf만 허용)");
        }

        // 6-1. 파일명 정규화 (경로 순회 취약점 방지)
        String sanitizedFilename = sanitizeFilename(originalFilename);
        
        // 6-2. 실제 MIME 타입 검증
        String detectedMimeType = detectMimeType(file);
        List<String> allowedMimeTypes = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "application/pdf"
        );
        if (!allowedMimeTypes.contains(detectedMimeType)) {
            throw new com.innersignature.backend.exception.BusinessException("지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, pdf만 허용)");
        }

        // 7. 파일 저장 디렉토리 생성 (설정 파일에서 경로 읽기)
        String projectRoot = System.getProperty("user.dir");
        String uploadBaseDir = projectRoot + File.separator + fileUploadBaseDir + File.separator + fileUploadReceiptsDir;
        String uniqueDir = UUID.randomUUID().toString();
        String uploadDir = uploadBaseDir + File.separator + expenseReportId + File.separator + uniqueDir;
        Path uploadPath = Paths.get(uploadDir);

        try {
            // 디렉토리가 없으면 생성
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            // 디렉토리 생성 확인
            if (!Files.exists(uploadPath) || !Files.isDirectory(uploadPath)) {
                throw new IOException("디렉토리 생성에 실패했습니다: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new IOException("디렉토리 생성 중 오류가 발생했습니다: " + uploadPath.toAbsolutePath() + " - " + e.getMessage(), e);
        }

        // 8. 파일명 생성: receipt_{timestamp}_{sanitizedFilename}
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String fileName = "receipt_" + timestamp + "_" + sanitizedFilename;
        Path filePath = uploadPath.resolve(fileName);

        boolean fileSaved = false;
        
        try {
            // 9. 파일 저장
            file.transferTo(filePath.toFile());
            fileSaved = true;
            
            // 10. DB에 영수증 정보 저장 (receipt_tb에 저장)
            String relativePath = fileUploadBaseDir + "/" + fileUploadReceiptsDir + "/" + expenseReportId + "/" + uniqueDir + "/" + fileName;
            ReceiptDto receiptDto = new ReceiptDto();
            receiptDto.setExpenseReportId(expenseReportId);
            receiptDto.setFilePath(relativePath);
            receiptDto.setOriginalFilename(originalFilename);
            receiptDto.setFileSize(file.getSize());
            receiptDto.setUploadedBy(userId);
            receiptDto.setUploadedAt(LocalDateTime.now());
            receiptDto.setCompanyId(companyId);
            expenseMapper.insertReceipt(receiptDto);
            
            SecurityLogger.fileAccess("UPLOAD", userId, expenseReportId, sanitizedFilename);
        } catch (Exception e) {
            // DB 저장 실패 시 파일 삭제
            if (fileSaved && Files.exists(filePath)) {
                try {
                    Files.delete(filePath);
                    logger.warn("DB 저장 실패로 인해 파일 삭제: {}", filePath);
                } catch (IOException deleteEx) {
                    logger.error("파일 삭제 실패: {}", filePath, deleteEx);
                }
            }
            throw e;
        }
    }

    /**
     * 파일명 정규화 (경로 순회 취약점 방지)
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            throw new com.innersignature.backend.exception.BusinessException("파일명이 없습니다.");
        }
        // 경로 구분자 제거 및 위험 문자 제거
        String sanitized = filename.replaceAll("[\\\\/:*?\"<>|]", "_");
        // 상대 경로 방지
        if (sanitized.startsWith("..") || sanitized.contains("../")) {
            throw new com.innersignature.backend.exception.BusinessException("잘못된 파일명입니다.");
        }
        // 파일명 길이 제한
        if (sanitized.length() > 255) {
            int lastDot = sanitized.lastIndexOf(".");
            if (lastDot > 0) {
                String ext = sanitized.substring(lastDot);
                sanitized = sanitized.substring(0, 255 - ext.length()) + ext;
            } else {
                sanitized = sanitized.substring(0, 255);
            }
        }
        return sanitized;
    }

    /**
     * 실제 MIME 타입 감지
     */
    private String detectMimeType(MultipartFile file) throws IOException {
        Tika tika = new Tika();
        try (InputStream inputStream = file.getInputStream()) {
            return tika.detect(inputStream);
        }
    }

    /**
     * 영수증 목록 조회
     */
    public List<ReceiptDto> getReceipts(Long expenseReportId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 문서를 찾을 수 없습니다.");
        }

        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseReportId, companyId);
        if (!hasReceiptViewAccess(report, approvalLines, userId)) {
            throw new com.innersignature.backend.exception.BusinessException("영수증 조회 권한이 없습니다.");
        }

        return expenseMapper.selectReceiptsByExpenseReportId(expenseReportId, companyId);
    }

    /**
     * 영수증 단건 조회
     */
    public ReceiptDto getReceiptById(Long receiptId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        ReceiptDto receipt = expenseMapper.selectReceiptById(receiptId, companyId);
        if (receipt == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 영수증을 찾을 수 없습니다.");
        }

        ExpenseReportDto report = expenseMapper.selectExpenseReportById(receipt.getExpenseReportId(), companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }

        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(report.getExpenseReportId(), companyId);
        if (!hasReceiptViewAccess(report, approvalLines, userId)) {
            throw new com.innersignature.backend.exception.BusinessException("영수증 조회 권한이 없습니다.");
        }

        return receipt;
    }

    /**
     * 영수증 삭제
     * 작성자 또는 ACCOUNTANT만 영수증을 삭제할 수 있습니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteReceipt(Long receiptId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 영수증 정보 및 권한 검증
        ReceiptDto receipt = getReceiptById(receiptId, userId);

        // 2. 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(receipt.getExpenseReportId(), companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }

        // 3. 권한 체크: 작성자, ACCOUNTANT, ADMIN, 결재 라인 포함자
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(report.getExpenseReportId(), companyId);
        if (!hasReceiptAccess(report, approvalLines, userId)) {
            throw new com.innersignature.backend.exception.BusinessException("영수증 삭제 권한이 없습니다.");
        }

        // 5-1. 물리적 파일 경로 가져오기
        String filePath = receipt.getFilePath();
        
        // 5-2. DB 레코드 삭제
        expenseMapper.deleteReceipt(receiptId, companyId);
        
        // 5-3. 물리적 파일 삭제
        if (filePath != null && !filePath.isEmpty()) {
            try {
                String projectRoot = System.getProperty("user.dir");
                Path physicalPath = Paths.get(projectRoot, filePath);
                File physicalFile = physicalPath.toFile();
                
                if (physicalFile.exists() && physicalFile.isFile()) {
                    boolean deleted = physicalFile.delete();
                    if (!deleted) {
                        logger.warn("파일 삭제 실패: {}", physicalPath.toAbsolutePath());
                    }
                }
            } catch (Exception e) {
                logger.error("파일 삭제 중 오류 발생: {}", filePath, e);
                // 파일 삭제 실패해도 DB 레코드는 삭제되었으므로 예외를 던지지 않음
            }
        }

        SecurityLogger.fileAccess("DELETE", userId, report.getExpenseReportId(), "receiptId=" + receiptId);
    }

    /**
     * 영수증 접근 권한 확인
     */
    private boolean hasReceiptAccess(ExpenseReportDto report, List<ApprovalLineDto> approvalLines, Long userId) {
        if (report.getDrafterId().equals(userId)) {
            return true;
        }
        if (permissionUtil.isAccountant(userId) || permissionUtil.isAdminOrCEO(userId)) {
            return true;
        }
        if (approvalLines != null) {
            for (ApprovalLineDto line : approvalLines) {
                if (userId.equals(line.getApproverId())) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * 영수증 조회/다운로드 접근 권한 확인
     */
    private boolean hasReceiptViewAccess(ExpenseReportDto report, List<ApprovalLineDto> approvalLines, Long userId) {
        if (permissionUtil.isTaxAccountant(userId)) {
            return true;
        }
        return hasReceiptAccess(report, approvalLines, userId);
    }
    
    /**
     * 카테고리별 합계/건수 요약 (세무사 전용)
     */
    public List<com.innersignature.backend.dto.CategorySummaryDto> getCategorySummaryForTaxAccountant(
            LocalDate startDate,
            LocalDate endDate,
            List<String> statuses,
            Boolean taxProcessed,
            Long userId) {
        
        if (!permissionUtil.isTaxAccountant(userId)) {
            throw new com.innersignature.backend.exception.BusinessException("TAX_ACCOUNTANT 역할만 접근 가능합니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectCategorySummary(startDate, endDate, statuses, taxProcessed, companyId);
    }

    /**
     * 세무처리 완료 처리
     * TAX_ACCOUNTANT 권한을 가진 사용자만 처리할 수 있으며, APPROVED 상태의 문서만 처리 가능합니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void completeTaxProcessing(Long expenseReportId, Long userId) {
        // 세무처리 완료 기능은 더 이상 사용되지 않습니다.
        throw new com.innersignature.backend.exception.BusinessException("세무처리 완료 기능은 더 이상 사용되지 않습니다.");
    }

    /**
     * 권한에 따라 세무처리 정보 필터링 (헬퍼 메서드)
     */
    /**
     * 상세 항목에 급여 카테고리가 포함되어 있는지 확인
     */
    private boolean hasSalaryCategory(List<ExpenseDetailDto> details) {
        if (details == null || details.isEmpty()) {
            return false;
        }
        for (ExpenseDetailDto detail : details) {
            if ("급여".equals(detail.getCategory())) {
                return true;
            }
        }
        return false;
    }

    /**
     * 카드번호 마스킹 처리 (마지막 4자리만 표시)
     * 예: 1234567812345678 -> **** 5678
     */
    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return null;
        }

        // 공백과 하이픈 제거
        String cleanNumber = cardNumber.replaceAll("[\\s-]", "");

        if (cleanNumber.length() < 4) {
            return "**** " + cleanNumber; // 4자리 미만인 경우
        }

        // 마지막 4자리만 표시
        String lastFour = cleanNumber.substring(cleanNumber.length() - 4);
        return "**** " + lastFour;
    }

    /**
     * 카드번호 포맷팅 (하이픈 추가)
     * 예: 1234567812345678 -> 1234-5678-1234-5678
     */
    private String formatCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "";
        }

        // 공백과 하이픈 제거
        String cleanNumber = cardNumber.replaceAll("[\\s-]", "");

        // 16자리 카드번호인 경우 포맷팅
        if (cleanNumber.length() == 16) {
            return cleanNumber.substring(0, 4) + "-" +
                   cleanNumber.substring(4, 8) + "-" +
                   cleanNumber.substring(8, 12) + "-" +
                   cleanNumber.substring(12, 16);
        }

        // 그 외의 경우는 그대로 반환
        return cleanNumber;
    }

    /**
     * 급여 카테고리 포함 문서에 대한 권한 체크
     * TAX_ACCOUNTANT는 모든 문서 조회 가능
     * CEO는 같은 회사의 모든 급여 문서 조회 가능
     * ADMIN, USER는 본인이 작성한 급여 문서만 조회 가능
     * 최적화: N+1 쿼리 문제 해결을 위해 배치 조회 사용
     */
    private void filterSalaryExpenses(List<ExpenseReportDto> reports, Long userId) {
        if (userId == null || reports == null || reports.isEmpty()) {
            return;
        }
        
        UserDto user = userService.selectUserById(userId);
        if (user == null) {
            return;
        }
        
        // TAX_ACCOUNTANT는 모든 급여 문서 조회 가능
        if ("TAX_ACCOUNTANT".equals(user.getRole())) {
            return;
        }
        
        // CEO는 같은 회사의 모든 문서 조회 가능 (필터링 없음)
        boolean isCEO = "CEO".equals(user.getRole());
        
        // 배치 조회: 모든 expense_report_id의 상세 항목을 한 번에 조회 (N+1 문제 해결)
        List<Long> expenseReportIds = reports.stream()
                .map(ExpenseReportDto::getExpenseReportId)
                .collect(Collectors.toList());
        
        // expense_report_id별로 그룹화하여 빠른 조회를 위한 Map 생성
        Map<Long, List<ExpenseDetailDto>> detailsMap;
        if (expenseReportIds.isEmpty()) {
            detailsMap = Collections.emptyMap();
        } else {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            List<ExpenseDetailDto> allDetails = expenseMapper.selectExpenseDetailsBatch(expenseReportIds, companyId);
            detailsMap = allDetails.stream()
                    .collect(Collectors.groupingBy(ExpenseDetailDto::getExpenseReportId));
        }
        
        if (isCEO) {
            // CEO는 같은 회사의 모든 문서 조회 가능 (필터링 없음)
        } else {
            // 그 외의 경우 (ADMIN, USER), 본인이 작성한 급여 문서만 조회 가능
            reports.removeIf(report -> {
                // 급여 카테고리가 포함된 문서인지 확인 (메모리에서 조회 - 빠름)
                List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
                boolean hasSalary = hasSalaryCategory(details);
                
                // 급여 문서이고, 작성자가 아니면 제거
                return hasSalary && !report.getDrafterId().equals(userId);
            });
        }
    }

    private void filterTaxProcessingInfo(List<ExpenseReportDto> reports, Long userId) {
        if (userId == null || reports == null || reports.isEmpty()) {
            return;
        }
        
        UserDto user = userService.selectUserById(userId);
        if (user != null && "USER".equals(user.getRole())) {
            for (ExpenseReportDto report : reports) {
                report.setTaxProcessed(null);
                report.setTaxProcessedAt(null);
            }
        }
    }

    /**
     * 카드번호 필터링 (암호화된 카드번호를 복호화하여 검색)
     */
    private List<ExpenseReportDto> filterByCardNumber(List<ExpenseReportDto> reports, String searchCardNumber, Long companyId) {
        if (reports == null || reports.isEmpty() || searchCardNumber == null || searchCardNumber.trim().isEmpty()) {
            return reports;
        }
        
        // 배치 조회: 모든 expense_report_id의 상세 항목을 한 번에 조회
        List<Long> expenseReportIds = reports.stream()
                .map(ExpenseReportDto::getExpenseReportId)
                .collect(Collectors.toList());
        
        if (expenseReportIds.isEmpty()) {
            return reports;
        }
        
        List<ExpenseDetailDto> allDetails = expenseMapper.selectExpenseDetailsBatch(expenseReportIds, companyId);
        Map<Long, List<ExpenseDetailDto>> detailsMap = allDetails.stream()
                .collect(Collectors.groupingBy(ExpenseDetailDto::getExpenseReportId));
        
        // 검색할 카드번호 (공백 제거)
        String cleanSearchNumber = searchCardNumber.replaceAll("\\s+", "");
        
        // 각 report의 카드번호 확인
        return reports.stream()
                .filter(report -> {
                    List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
                    
                    for (ExpenseDetailDto detail : details) {
                        if (detail.getCardNumber() != null && !detail.getCardNumber().trim().isEmpty()) {
                            try {
                                // 암호화된 카드번호 복호화
                                String decryptedCardNumber = encryptionUtil.decrypt(detail.getCardNumber());
                                if (decryptedCardNumber != null) {
                                    // 공백 제거 후 비교
                                    String cleanDecrypted = decryptedCardNumber.replaceAll("\\s+", "");
                                    if (cleanDecrypted.contains(cleanSearchNumber)) {
                                        return true; // 매칭되는 카드번호 발견
                                    }
                                }
                            } catch (Exception e) {
                                logger.debug("카드번호 복호화 실패 - detailId: {}", detail.getExpenseDetailId(), e);
                            }
                        }
                    }
                    return false; // 매칭되는 카드번호 없음
                })
                .collect(Collectors.toList());
    }

    /**
     * 적요 요약 정보 생성
     * expense_detail_tb의 description 필드에서 적요를 가져와서
     * 적요가 1개면 첫 번째 적요만, 2개 이상이면 "첫번째 적요 외 n개" 형식으로 생성
     */
    public void generateSummaryDescription(ExpenseReportDto report) {
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

    /**
     * 권한 필터링 후 실제 조회 가능한 전체 개수 계산
     */
    private long calculateFilteredTotalElements(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (userId == null) {
            return expenseMapper.countExpenseList(companyId);
        }
        
        // 전체 목록 조회 (페이지네이션 없이)
        List<ExpenseReportDto> allReports = expenseMapper.selectExpenseList(companyId);
        
        // 권한 필터링 적용
        filterSalaryExpenses(allReports, userId);
        
        return allReports.size();
    }

    /**
     * 필터링 조건 + 권한 필터링 후 실제 조회 가능한 전체 개수 계산
     */
    private long calculateFilteredTotalElements(
            LocalDate startDate,
            LocalDate endDate,
            Long minAmount,
            Long maxAmount,
            List<String> statuses,
            String category,
            Boolean taxProcessed,
            String drafterName,
            Long userId,
            String paymentMethod,
            String cardNumber) {

        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 일반 사용자는 자신이 작성한 글만 조회
        UserDto currentUser = userId != null ? userService.selectUserById(userId) : null;
        boolean isRegularUser = currentUser != null && "USER".equals(currentUser.getRole());
        if (isRegularUser && (drafterName == null || drafterName.trim().isEmpty())) {
            drafterName = currentUser.getKoreanName();
        }
        
        if (userId == null) {
            long count = expenseMapper.countExpenseListWithFilters(
                    startDate, endDate, minAmount, maxAmount,
                    statuses, category, taxProcessed,
                    drafterName, companyId, paymentMethod, null); // cardNumber는 애플리케이션 레벨에서 필터링
            
            // 카드번호 필터링이 있는 경우 전체 데이터를 가져와서 필터링
            if (cardNumber != null && !cardNumber.trim().isEmpty()) {
                List<ExpenseReportDto> allReports = expenseMapper.selectExpenseListWithFilters(
                        0, Integer.MAX_VALUE,
                        startDate, endDate,
                        minAmount, maxAmount,
                        statuses, category, taxProcessed,
                        drafterName, companyId, paymentMethod, null);
                allReports = filterByCardNumber(allReports, cardNumber, companyId);
                return allReports.size();
            }
            
            return count;
        }

        // 필터링된 전체 목록 조회 (페이지네이션 없이, 큰 수로 설정)
        List<ExpenseReportDto> allReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                minAmount, maxAmount,
                statuses, category, taxProcessed,
                drafterName, companyId, paymentMethod, null); // cardNumber는 애플리케이션 레벨에서 필터링

        // 권한 필터링 적용
        filterSalaryExpenses(allReports, userId);
        
        // 카드번호 필터링 적용
        if (cardNumber != null && !cardNumber.trim().isEmpty()) {
            allReports = filterByCardNumber(allReports, cardNumber, companyId);
        }

        return allReports.size();
    }

    /**
     * 대시보드 전체 요약 통계 조회
     */
    public DashboardStatsDto getDashboardStats(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectDashboardStats(startDate, endDate, companyId);
    }

    /**
     * 월별 지출 추이 조회
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
     * 카테고리별 비율 조회 (비율 계산 포함)
     */
    public List<CategoryRatioDto> getCategoryRatio(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<CategoryRatioDto> ratios = expenseMapper.selectCategoryRatio(startDate, endDate, companyId);
        
        // 전체 금액 계산
        long totalAmount = ratios.stream()
                .mapToLong(CategoryRatioDto::getAmount)
                .sum();
        
        // 비율 계산
        if (totalAmount > 0) {
            for (CategoryRatioDto ratio : ratios) {
                double percentage = (double) ratio.getAmount() / totalAmount;
                ratio.setRatio(percentage);
            }
        }
        
        return ratios;
    }

    /**
     * 세무처리 대기 건 조회 (APPROVED 상태이지만 taxProcessed=false)
     */
    public List<ExpenseReportDto> getTaxPendingReports(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> list = expenseMapper.selectTaxPendingReports(startDate, endDate, companyId);
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : list) {
            generateSummaryDescription(report);
        }
        return list;
    }

    /**
     * 세무처리 현황 통계 조회
     */
    public TaxStatusDto getTaxStatus(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectTaxStatus(startDate, endDate, companyId);
    }

    /**
     * 월별 세무처리 집계 조회
     */
    public List<MonthlyTaxSummaryDto> getMonthlyTaxSummary(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectMonthlyTaxSummary(startDate, endDate, companyId);
    }

    /**
     * 세무처리 일괄 완료 처리
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void batchCompleteTaxProcessing(List<Long> expenseReportIds, Long userId) {
        // 세무처리 완료 기능은 더 이상 사용되지 않습니다.
        throw new com.innersignature.backend.exception.BusinessException("세무처리 완료 기능은 더 이상 사용되지 않습니다.");
    }

    /**
     * 기간별 세무 자료 일괄 수집
     * TAX_ACCOUNTANT 권한을 가진 사용자만 처리할 수 있으며, APPROVED 상태의 문서만 수집 가능합니다.
     * 이미 수집된 문서도 포함하여 처리합니다 (중복 수집 허용).
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void collectTaxData(LocalDate startDate, LocalDate endDate, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 권한 체크: TAX_ACCOUNTANT 권한자만 처리 가능
        permissionUtil.checkTaxAccountantPermission(userId);
        
        // 기간 내 APPROVED 상태의 모든 문서 조회 (수집 여부와 관계없이)
        List<ExpenseReportDto> reports = expenseMapper.selectTaxPendingCollection(
            startDate, endDate, companyId);

        if (reports.isEmpty()) {
            throw new com.innersignature.backend.exception.BusinessException("수집할 자료가 없습니다.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (ExpenseReportDto report : reports) {
            // APPROVED 상태인 경우 수집 처리 (이미 수집된 것도 다시 수집 처리)
            if ("APPROVED".equals(report.getStatus())) {
                expenseMapper.updateTaxCollected(
                    report.getExpenseReportId(), 
                    now, 
                    userId, 
                    companyId);
                logger.info("세무 자료 수집 처리 - expenseId: {}, userId: {}", 
                    report.getExpenseReportId(), userId);
            }
        }
    }

    /**
     * 세무 수정 요청
     * TAX_ACCOUNTANT 권한을 가진 사용자만 처리할 수 있습니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void requestTaxRevision(Long expenseReportId, String reason, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 권한 체크: TAX_ACCOUNTANT 권한자만 처리 가능
        permissionUtil.checkTaxAccountantPermission(userId);
        
        // 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }
        
        // 세무 수집된 문서만 수정 요청 가능
        if (report.getTaxCollectedAt() == null) {
            throw new com.innersignature.backend.exception.BusinessException("세무 수집된 문서만 수정 요청할 수 있습니다.");
        }

        // APPROVED 또는 WAIT 상태의 문서만 수정 요청 가능
        // - APPROVED: 처음 수정 요청하는 경우
        // - WAIT: 이전 수정 요청이 처리되어 재요청하는 경우
        if (!"APPROVED".equals(report.getStatus()) && !"WAIT".equals(report.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("승인 완료(APPROVED) 또는 대기(WAIT) 상태의 문서만 수정 요청할 수 있습니다.");
        }
        
        // 이미 수정 요청된 경우에도 재요청 허용 (작성자가 수정 완료 후 다시 요청 가능하도록)

        // 1. 결재 라인 전체 초기화 (모든 서명/반려 정보 제거 후 WAIT 상태로 복원)
        expenseMapper.resetApprovalLinesForReport(expenseReportId, companyId);

        // 2. 문서 상태를 WAIT으로 변경 (다시 결재 프로세스를 타도록)
        expenseMapper.updateExpenseReportStatus(expenseReportId, "WAIT", companyId);

        // 3. 수정 요청 플래그 및 사유 저장
        expenseMapper.updateTaxRevisionRequest(expenseReportId, true, reason, companyId);
        logger.info("세무 수정 요청 처리 - expenseId: {}, userId: {}, reason: {}", 
            expenseReportId, userId, reason);
    }

    /**
     * 세무 수정 요청 목록 (작성자용)
     * 세무사가 수정 요청한 결의서를 작성자 기준으로 조회합니다.
     */
    public List<ExpenseReportDto> getTaxRevisionRequestsForDrafter(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> list = expenseMapper.selectTaxRevisionRequestsByDrafter(userId, companyId);

        // 급여/세무 정보 필터링 및 요약 본문 생성은 다른 목록과 동일하게 처리
        filterSalaryExpenses(list, userId);
        filterTaxProcessingInfo(list, userId);
        for (ExpenseReportDto report : list) {
            generateSummaryDescription(report);
        }

        return list;
    }

    /**
     * 기간별 지출 데이터를 엑셀 파일로 생성 (통합 메소드)
     * @param startDate 시작일 (optional)
     * @param endDate 종료일 (optional)
     * @param userId 현재 사용자 ID (권한 필터링용)
     * @param exportType "basic" 또는 "tax-review"
     * @return 생성된 엑셀 파일
     * @throws IOException 파일 생성 실패 시
     */
    public File exportExpensesToExcel(LocalDate startDate, LocalDate endDate, Long userId, String exportType) throws IOException {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        // 상태 필터링: tax-review는 APPROVED만, basic은 전체
        List<String> statuses = "tax-review".equals(exportType) ? List.of("APPROVED") : null;

        // 기간별 지출결의서 목록 조회 (페이지네이션 없이 전체)
        List<ExpenseReportDto> expenseReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                null, null, statuses, null, null, null,
                companyId, null, null);

        // 권한 필터링 적용
        filterSalaryExpenses(expenseReports, userId);

        // tax-review 전용 정렬
        if ("tax-review".equals(exportType)) {
            expenseReports.sort((a, b) -> {
                LocalDate aDate = a.getReportDate();
                LocalDate bDate = b.getReportDate();
                if (aDate != null && bDate != null) {
                    int dateCompare = aDate.compareTo(bDate);
                    if (dateCompare != 0) return dateCompare;
                }
                return Long.compare(
                    a.getExpenseReportId() != null ? a.getExpenseReportId() : 0L,
                    b.getExpenseReportId() != null ? b.getExpenseReportId() : 0L
                );
            });
        }
        
        // 각 지출결의서의 상세 내역 조회
        List<Long> expenseReportIds = expenseReports.stream()
                .map(ExpenseReportDto::getExpenseReportId)
                .collect(Collectors.toList());
        
        Map<Long, List<ExpenseDetailDto>> detailsMap = new HashMap<>();
        if (!expenseReportIds.isEmpty()) {
            List<ExpenseDetailDto> allDetails = expenseMapper.selectExpenseDetailsBatch(expenseReportIds, companyId);
            detailsMap = allDetails.stream()
                    .collect(Collectors.groupingBy(ExpenseDetailDto::getExpenseReportId));
        }
        
        // 영수증 데이터 조회
        Map<Long, List<ReceiptDto>> receiptsMap = new HashMap<>();
        if (!expenseReportIds.isEmpty()) {
            for (Long reportId : expenseReportIds) {
                List<ReceiptDto> receipts = expenseMapper.selectReceiptsByExpenseReportId(reportId, companyId);
                if (receipts != null && !receipts.isEmpty()) {
                    receiptsMap.put(reportId, receipts);
                }
            }
        }
        
        // 엑셀 파일 생성 분기
        String projectRoot = System.getProperty("user.dir");
        if ("tax-review".equals(exportType)) {
            return createTaxReviewWorkbook(expenseReports, detailsMap, receiptsMap, projectRoot);
        } else {
            return createBasicExpenseWorkbook(expenseReports, detailsMap, projectRoot);
        }
    }
    
    /**
     * SUPERADMIN 전용: 회사별 지출결의서 목록 조회
     * companyId가 null이면 전체 회사의 지출결의서 조회
     */
    public PagedResponse<ExpenseReportDto> getExpenseListForSuperAdmin(
            int page,
            int size,
            LocalDate startDate,
            LocalDate endDate,
            Long minAmount,
            Long maxAmount,
            List<String> statuses,
            String category,
            Boolean taxProcessed,
            String drafterName,
            Long companyId) {
        
        // statuses가 null이거나 비어있으면 null로 설정
        if (statuses != null && statuses.isEmpty()) {
            statuses = null;
        }
        
        // 전체 개수 조회
        long totalElements = expenseMapper.countExpenseListForSuperAdmin(
                startDate, endDate, minAmount, maxAmount,
                statuses, category, taxProcessed,
                drafterName, companyId);
        
        // 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // 페이지네이션 계산
        int offset = (page - 1) * size;
        
        // 데이터 조회
        List<ExpenseReportDto> content = expenseMapper.selectExpenseListForSuperAdmin(
                offset, size,
                startDate, endDate,
                minAmount, maxAmount,
                statuses, category, taxProcessed,
                drafterName, companyId);
        
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : content) {
            generateSummaryDescription(report);
        }
        
        // PagedResponse 객체 생성 및 반환
        return new PagedResponse<>(content, page, size, totalElements, totalPages);
    }

    /**
     * SUPERADMIN 전용: 지출결의서 상세 조회
     * companyId 제약 없이 모든 회사의 문서 조회 가능
     */
    public ExpenseReportDto getExpenseDetailForSuperAdmin(Long expenseReportId) {
        // (1) 메인 문서 정보 가져오기
        ExpenseReportDto report = expenseMapper.selectExpenseReportByIdForSuperAdmin(expenseReportId);
        
        if (report == null) {
            return null;
        }

        // (2) 상세 항목들 가져오기
        List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetailsForSuperAdmin(expenseReportId);
        
        // (3) 결재 라인 가져오기
        List<ApprovalLineDto> lines = expenseMapper.selectApprovalLinesForSuperAdmin(expenseReportId);

        // (4) 영수증 목록 가져오기
        List<ReceiptDto> receipts = expenseMapper.selectReceiptsByExpenseReportIdForSuperAdmin(expenseReportId);

        // (5) 가져온 부품들을 메인 DTO에 조립하기
        report.setDetails(details);
        report.setApprovalLines(lines);
        report.setReceipts(receipts);

        return report;
    }

    /**
     * 기본 지출 엑셀 워크북 생성
     */
    private File createBasicExpenseWorkbook(List<ExpenseReportDto> expenseReports,
                                          Map<Long, List<ExpenseDetailDto>> detailsMap,
                                          String projectRoot) throws IOException {
        // 엑셀 파일 생성
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("지출내역");

        // 헤더 스타일
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        // 데이터 스타일
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);

        // 헤더 행 생성
        Row headerRow = sheet.createRow(0);
        String[] headers = {"문서번호", "작성일", "제목", "작성자", "상태", "총액", "항목", "적요", "금액", "비고"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 데이터 행 생성
        int rowNum = 1;

        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());

            if (details.isEmpty()) {
                // 상세 내역이 없는 경우
                Row row = sheet.createRow(rowNum);
                createDataRow(row, report, null, 0, dataStyle);
                rowNum++;
            } else {
                // 상세 내역이 있는 경우
                for (int i = 0; i < details.size(); i++) {
                    Row row = sheet.createRow(rowNum);
                    createDataRow(row, report, details.get(i), i, dataStyle);
                    rowNum++;
                }
            }
        }

        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }

        // 임시 파일로 저장
        File tempFile = File.createTempFile("expense_export_", ".xlsx");
        try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
            workbook.write(outputStream);
        }
        workbook.close();

        logger.info("기본 지출 엑셀 파일 생성 완료 - 파일명: {}, 건수: {}", tempFile.getName(), expenseReports.size());

        return tempFile;
    }

    /**
     * 세무 검토용 엑셀 워크북 생성 (5개 시트)
     */
    private File createTaxReviewWorkbook(List<ExpenseReportDto> expenseReports,
                                       Map<Long, List<ExpenseDetailDto>> detailsMap,
                                       Map<Long, List<ReceiptDto>> receiptsMap,
                                       String projectRoot) throws IOException {
        // 엑셀 파일 생성
        Workbook workbook = new XSSFWorkbook();

        // Sheet 1: 전체 증빙 내역
        createFullDetailSheet(workbook, expenseReports, detailsMap, receiptsMap, projectRoot);

        // Sheet 2: 증빙 누락 체크리스트
        createMissingReceiptSheet(workbook, expenseReports, receiptsMap);

        // Sheet 3: 부가세 검토 항목
        createVatReviewSheet(workbook, expenseReports, detailsMap);

        // Sheet 4: 카테고리별 집계
        createCategorySummarySheet(workbook, expenseReports, detailsMap);

        // Sheet 5: 더존 Import 형식
        createDaejonImportSheet(workbook, expenseReports, detailsMap);

        // 임시 파일로 저장
        File tempFile = File.createTempFile("tax_review_", ".xlsx");
        try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
            workbook.write(outputStream);
        }
        workbook.close();

        logger.info("세무 검토 자료 생성 완료 - 파일명: {}, 건수: {}", tempFile.getName(), expenseReports.size());
        return tempFile;
    }

    /**
     * 기간별 지출 데이터를 엑셀 파일로 생성 (기존 API 호환성 유지)
     * @param startDate 시작일 (optional)
     * @param endDate 종료일 (optional)
     * @param userId 현재 사용자 ID (권한 필터링용)
     * @return 생성된 엑셀 파일
     * @throws IOException 파일 생성 실패 시
     */
    public File exportExpensesToExcel(LocalDate startDate, LocalDate endDate, Long userId) throws IOException {
        return exportExpensesToExcel(startDate, endDate, userId, "basic");
    }

    /**
     * SUPERADMIN 전용: 엑셀 다운로드
     * companyId가 null이면 전체 회사의 데이터 조회
     */
    public File exportExpensesToExcelForSuperAdmin(
            LocalDate startDate, 
            LocalDate endDate, 
            Long companyId) throws IOException {
        
        // 필터 조건으로 지출결의서 목록 조회
        List<ExpenseReportDto> expenseReports = expenseMapper.selectExpenseListForSuperAdmin(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                null, null, null, null, null, null,
                companyId);
        
        // 각 지출결의서의 상세 내역 조회
        Map<Long, List<ExpenseDetailDto>> detailsMap = new HashMap<>();
        if (!expenseReports.isEmpty()) {
            for (ExpenseReportDto report : expenseReports) {
                List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetailsForSuperAdmin(report.getExpenseReportId());
                detailsMap.put(report.getExpenseReportId(), details);
            }
        }
        
        // 엑셀 파일 생성
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("지출내역");
        
        // 헤더 스타일
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        
        // 데이터 스타일
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);
        
        // 헤더 행 생성
        Row headerRow = sheet.createRow(0);
        String[] headers = {"문서번호", "회사명", "작성일", "제목", "작성자", "상태", "총액", "항목", "적요", "금액", "비고"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 데이터 행 생성
        int rowNum = 1;
        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
            
            if (details.isEmpty()) {
                Row row = sheet.createRow(rowNum++);
                createDataRowForSuperAdmin(row, report, null, 0, dataStyle);
            } else {
                for (int i = 0; i < details.size(); i++) {
                    Row row = sheet.createRow(rowNum++);
                    createDataRowForSuperAdmin(row, report, details.get(i), i, dataStyle);
                }
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
        
        // 임시 파일로 저장
        File tempFile = File.createTempFile("expense_export_superadmin_", ".xlsx");
        try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
            workbook.write(outputStream);
        }
        workbook.close();
        
        logger.info("SUPERADMIN 엑셀 파일 생성 완료 - 파일명: {}, 건수: {}", tempFile.getName(), expenseReports.size());
        
        return tempFile;
    }

    /**
     * SUPERADMIN 전용 엑셀 데이터 행 생성 헬퍼 메서드
     */
    private void createDataRowForSuperAdmin(Row row, ExpenseReportDto report, ExpenseDetailDto detail, int detailIndex, CellStyle dataStyle) {
        int col = 0;
        
        // 문서번호
        Cell cell = row.createCell(col++);
        cell.setCellValue(report.getExpenseReportId() != null ? report.getExpenseReportId() : 0);
        cell.setCellStyle(dataStyle);
        
        // 회사명
        cell = row.createCell(col++);
        cell.setCellValue(report.getCompanyName() != null ? report.getCompanyName() : "");
        cell.setCellStyle(dataStyle);
        
        // 작성일
        cell = row.createCell(col++);
        if (detailIndex == 0) {
            cell.setCellValue(report.getReportDate() != null ? report.getReportDate().toString() : "");
        }
        cell.setCellStyle(dataStyle);
        
        // 제목
        cell = row.createCell(col++);
        if (detailIndex == 0) {
            // 제목 필드 제거로 인해 빈 문자열 사용
            cell.setCellValue("");
        }
        cell.setCellStyle(dataStyle);
        
        // 작성자
        cell = row.createCell(col++);
        if (detailIndex == 0) {
            cell.setCellValue(report.getDrafterName() != null ? report.getDrafterName() : "");
        }
        cell.setCellStyle(dataStyle);
        
        // 상태
        cell = row.createCell(col++);
        if (detailIndex == 0) {
            cell.setCellValue(report.getStatus() != null ? report.getStatus() : "");
        }
        cell.setCellStyle(dataStyle);
        
        // 총액 (첫 번째 행에만 표시)
        cell = row.createCell(col++);
        if (detailIndex == 0) {
            cell.setCellValue(report.getTotalAmount() != null ? report.getTotalAmount().doubleValue() : 0);
        }
        cell.setCellStyle(dataStyle);
        
        // 항목
        cell = row.createCell(col++);
        if (detail != null) {
            cell.setCellValue(detail.getCategory() != null ? detail.getCategory() : "");
        }
        cell.setCellStyle(dataStyle);
        
        // 적요
        cell = row.createCell(col++);
        if (detail != null) {
            cell.setCellValue(detail.getDescription() != null ? detail.getDescription() : "");
        }
        cell.setCellStyle(dataStyle);
        
        // 금액
        cell = row.createCell(col++);
        if (detail != null && detail.getAmount() != null) {
            cell.setCellValue(detail.getAmount().doubleValue());
        }
        cell.setCellStyle(dataStyle);
        
        // 비고
        cell = row.createCell(col++);
        if (detail != null) {
            cell.setCellValue(detail.getNote() != null ? detail.getNote() : "");
        }
        cell.setCellStyle(dataStyle);
    }

    /**
     * 엑셀 데이터 행 생성 헬퍼 메서드
     */
    private void createDataRow(Row row, ExpenseReportDto report, ExpenseDetailDto detail, int detailIndex, CellStyle dataStyle) {
        int colNum = 0;
        
        // 문서번호
        if (detailIndex == 0) {
            Cell cell1 = row.createCell(colNum++);
            cell1.setCellValue(report.getExpenseReportId() != null ? report.getExpenseReportId() : 0);
            cell1.setCellStyle(dataStyle);
            
            // 작성일
            Cell cell2 = row.createCell(colNum++);
            if (report.getReportDate() != null) {
                cell2.setCellValue(report.getReportDate().toString());
            } else {
                cell2.setCellValue("");
            }
            cell2.setCellStyle(dataStyle);
            
            // 제목 (제거됨 - 빈 문자열 사용)
            Cell cell3 = row.createCell(colNum++);
            cell3.setCellValue("");
            cell3.setCellStyle(dataStyle);
            
            // 작성자
            Cell cell4 = row.createCell(colNum++);
            cell4.setCellValue(report.getDrafterName() != null ? report.getDrafterName() : "");
            cell4.setCellStyle(dataStyle);
            
            // 상태
            Cell cell5 = row.createCell(colNum++);
            cell5.setCellValue(report.getStatus() != null ? report.getStatus() : "");
            cell5.setCellStyle(dataStyle);
            
            // 총액
            Cell cell6 = row.createCell(colNum++);
            cell6.setCellValue(report.getTotalAmount() != null ? report.getTotalAmount() : 0);
            cell6.setCellStyle(dataStyle);
        } else {
            // 병합된 셀은 비워둠
            for (int i = 0; i < 6; i++) {
                Cell cell = row.createCell(colNum++);
                cell.setCellValue("");
                cell.setCellStyle(dataStyle);
            }
        }
        
        // 항목
        Cell cell7 = row.createCell(colNum++);
        cell7.setCellValue(detail != null && detail.getCategory() != null ? detail.getCategory() : "");
        cell7.setCellStyle(dataStyle);
        
        // 적요
        Cell cell8 = row.createCell(colNum++);
        cell8.setCellValue(detail != null && detail.getDescription() != null ? detail.getDescription() : "");
        cell8.setCellStyle(dataStyle);
        
        // 금액
        Cell cell9 = row.createCell(colNum++);
        cell9.setCellValue(detail != null && detail.getAmount() != null ? detail.getAmount() : 0);
        cell9.setCellStyle(dataStyle);
        
        // 비고
        Cell cell10 = row.createCell(colNum++);
        cell10.setCellValue(detail != null && detail.getNote() != null ? detail.getNote() : "");
        cell10.setCellStyle(dataStyle);
    }


    /**
     * 전표 생성 및 분개 (회계 전표 형식)
     * APPROVED 상태: 차변(비용) / 대변(현금) - 승인 즉시 지출로 처리
     * @param startDate 시작일 (optional)
     * @param endDate 종료일 (optional)
     * @param userId 현재 사용자 ID (권한 필터링용)
     * @return 생성된 엑셀 파일
     * @throws IOException 파일 생성 실패 시
     */
    public File exportJournalEntriesToExcel(LocalDate startDate, LocalDate endDate, Long userId) throws IOException {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // APPROVED 상태의 지출결의서 조회
        List<String> statuses = List.of("APPROVED");
        List<ExpenseReportDto> expenseReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                null, null, statuses, null, null, null,
                companyId, null, null);
        
        // 권한 필터링 적용
        filterSalaryExpenses(expenseReports, userId);
        
        // 전표는 승인일 순서대로 정렬 (최종 승인일 오름차순, 문서번호 오름차순)
        // 승인일이 null인 경우(이론적으로는 발생하지 않지만) 작성일을 대체로 사용
        expenseReports.sort((a, b) -> {
            // 최종 승인일 비교 (오름차순: 과거 -> 최근)
            LocalDateTime aApprovalDate = a.getFinalApprovalDate();
            LocalDateTime bApprovalDate = b.getFinalApprovalDate();
            
            // 승인일이 null인 경우 작성일을 대체로 사용
            if (aApprovalDate == null && a.getReportDate() != null) {
                aApprovalDate = a.getReportDate().atStartOfDay();
            }
            if (bApprovalDate == null && b.getReportDate() != null) {
                bApprovalDate = b.getReportDate().atStartOfDay();
            }
            
            if (aApprovalDate != null && bApprovalDate != null) {
                int dateCompare = aApprovalDate.compareTo(bApprovalDate);
                if (dateCompare != 0) {
                    return dateCompare;
                }
            } else if (aApprovalDate != null) {
                return -1; // a가 null이 아니면 a가 앞으로
            } else if (bApprovalDate != null) {
                return 1; // b가 null이 아니면 b가 앞으로
            }
            // 같은 날짜면 문서번호 오름차순
            Long aId = a.getExpenseReportId() != null ? a.getExpenseReportId() : 0L;
            Long bId = b.getExpenseReportId() != null ? b.getExpenseReportId() : 0L;
            return Long.compare(aId, bId);
        });
        
        // 각 지출결의서의 상세 내역 조회
        List<Long> expenseReportIds = expenseReports.stream()
                .map(ExpenseReportDto::getExpenseReportId)
                .collect(Collectors.toList());
        
        Map<Long, List<ExpenseDetailDto>> detailsMap = new HashMap<>();
        if (!expenseReportIds.isEmpty()) {
            List<ExpenseDetailDto> allDetails = expenseMapper.selectExpenseDetailsBatch(expenseReportIds, companyId);
            detailsMap = allDetails.stream()
                    .collect(Collectors.groupingBy(ExpenseDetailDto::getExpenseReportId));
        }
        
        // 엑셀 파일 생성
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("전표");
        
        // 헤더 스타일
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        
        // 데이터 스타일
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);
        
        // 숫자 스타일
        CellStyle numberStyle = workbook.createCellStyle();
        numberStyle.cloneStyleFrom(dataStyle);
        DataFormat format = workbook.createDataFormat();
        numberStyle.setDataFormat(format.getFormat("#,##0"));
        
        // 헤더 행 생성
        Row headerRow = sheet.createRow(0);
        String[] headers = {"전표일자", "적요", "차변계정과목", "차변금액", "대변계정과목", "대변금액", "문서번호", "비고"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 데이터 행 생성
        int rowNum = 1;

        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
            int firstRowForReport = rowNum; // 이 문서의 첫 번째 분개 행 번호 저장
            
            if ("APPROVED".equals(report.getStatus())) {
                // APPROVED 상태인 경우 분개 처리:
                // 1. 승인 시점의 분개: 차변(비용) / 대변(현금) - 결재 금액 기준
                //      * 항목별로 차액을 계산하고, 각 항목의 계정과목으로 처리 (회계 원칙 준수)
                
                // 1. APPROVED 시점 분개 생성 (결재 금액 기준)
                if (details.isEmpty()) {
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForApproved(row, report, null, dataStyle, numberStyle);
                } else {
                    for (int i = 0; i < details.size(); i++) {
                        Row row = sheet.createRow(rowNum++);
                        createJournalEntryRowForApproved(row, report, details.get(i), dataStyle, numberStyle);
                    }
                }
                
                // 2. 승인 시점 분개 생성 (결재 금액 기준)
                if (details.isEmpty()) {
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForPaid(row, report, null, dataStyle, numberStyle);
                } else {
                    for (ExpenseDetailDto detail : details) {
                        Row row = sheet.createRow(rowNum++);
                        createJournalEntryRowForPaid(row, report, detail, dataStyle, numberStyle);
                    }
                }
                
                // 3. 미지급금 잔액 정리 및 추가 비용 분개 생성 (항목별 차액 처리)
                if (details.isEmpty()) {
                    // 상세 항목이 없는 경우 문서 레벨 금액으로 처리
                    long totalApprovalAmount = report.getTotalAmount() != null ? report.getTotalAmount() : 0L;
                    long totalActualPaidAmount = report.getActualPaidAmount() != null ? report.getActualPaidAmount() : totalApprovalAmount;
                    long difference = totalApprovalAmount - totalActualPaidAmount;
                    
                    if (difference > 0) {
                        // 실제 지급 금액이 결재 금액보다 작은 경우: 잔액 정리
                        // 상세 항목이 없으므로 기본 계정과목 사용
                        Row row = sheet.createRow(rowNum++);
                        createJournalEntryRowForRemainingBalance(row, report, difference, "기타비용", dataStyle, numberStyle);
                    } else if (difference < 0) {
                        // 실제 지급 금액이 결재 금액보다 큰 경우: 추가 비용
                        Row row = sheet.createRow(rowNum++);
                        createJournalEntryRowForAdditionalExpense(row, report, null, Math.abs(difference), "기타비용", dataStyle, numberStyle);
                    }
                } else {
                    // 상세 항목별로 차액 계산 및 처리
                    // 추가 비용: 계정과목별로 그룹화하여 합산 처리 (회계 원칙 준수)
                    Map<String, Long> additionalExpenseByAccount = new HashMap<>();
                    // 잔액 정리: 계정과목별로 그룹화하여 합산 처리 (회계 원칙 준수)
                    Map<String, Long> remainingBalanceByAccount = new HashMap<>();
                    
                    for (ExpenseDetailDto detail : details) {
                        long approvalAmount = detail.getAmount() != null ? detail.getAmount() : 0L;
                        long actualPaidAmount = detail.getActualPaidAmount() != null ? detail.getActualPaidAmount() : approvalAmount;
                        long itemDifference = approvalAmount - actualPaidAmount;
                        
                        if (itemDifference < 0) {
                            // 실제 지급 금액이 결재 금액보다 큰 경우: 추가 비용
                            // 해당 항목의 계정과목으로 처리 (회계 원칙)
                            String category = detail.getCategory() != null ? detail.getCategory() : "";
                            String merchantName = detail.getMerchantName();
                            String accountCode = mapCategoryToAccountCode(category, merchantName);
                            additionalExpenseByAccount.merge(accountCode, Math.abs(itemDifference), Long::sum);
                        } else if (itemDifference > 0) {
                            // 실제 지급 금액이 결재 금액보다 작은 경우: 잔액 정리
                            // 해당 항목의 계정과목으로 차감 처리 (회계 원칙 - 비용 차감, 수익 증가 금지)
                            String category = detail.getCategory() != null ? detail.getCategory() : "";
                            String merchantName = detail.getMerchantName();
                            String accountCode = mapCategoryToAccountCode(category, merchantName);
                            remainingBalanceByAccount.merge(accountCode, itemDifference, Long::sum);
                        }
                    }
                    
                    // 추가 비용 분개 생성 (계정과목별로)
                    for (Map.Entry<String, Long> entry : additionalExpenseByAccount.entrySet()) {
                        Row row = sheet.createRow(rowNum++);
                        createJournalEntryRowForAdditionalExpense(row, report, null, entry.getValue(), entry.getKey(), dataStyle, numberStyle);
                    }

                    // 잔액 정리 분개 생성 (계정과목별로 - 비용 차감 처리)
                    for (Map.Entry<String, Long> entry : remainingBalanceByAccount.entrySet()) {
                        Row row = sheet.createRow(rowNum++);
                        createJournalEntryRowForRemainingBalance(row, report, entry.getValue(), entry.getKey(), dataStyle, numberStyle);
                    }
                }
            } else if ("APPROVED".equals(report.getStatus())) {
                // APPROVED 상태인 경우: 차변(비용) / 대변(미지급금) - 결재 금액 기준
                if (details.isEmpty()) {
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForApproved(row, report, null, dataStyle, numberStyle);
                } else {
                    for (int i = 0; i < details.size(); i++) {
                        Row row = sheet.createRow(rowNum++);
                        createJournalEntryRowForApproved(row, report, details.get(i), dataStyle, numberStyle);
                    }
                }
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
        
        // 임시 파일로 저장
        File tempFile = File.createTempFile("journal_entry_", ".xlsx");
        try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
            workbook.write(outputStream);
        }
        workbook.close();
        
        logger.info("전표 엑셀 파일 생성 완료 - 파일명: {}, 건수: {}", tempFile.getName(), expenseReports.size());
        
            return tempFile;
    }

    /**
     * 세무사 전용 전표 생성 (세무 회계 원칙에 입각)
     * APPROVED 상태의 문서만 포함하며, 세무 수집 여부와 관계없이 기간 내 모든 APPROVED 문서를 포함합니다.
     * @param startDate 시작일 (optional)
     * @param endDate 종료일 (optional)
     * @param userId 현재 사용자 ID (권한 필터링용)
     * @return 생성된 엑셀 파일
     * @throws IOException 파일 생성 실패 시
     */
    public File exportTaxJournalEntriesToExcel(LocalDate startDate, LocalDate endDate, Long userId) throws IOException {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // APPROVED 상태의 지출결의서만 조회 (세무 수집 여부와 관계없이)
        List<String> statuses = List.of("APPROVED");
        List<ExpenseReportDto> expenseReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                null, null, statuses, null, null, null,
                companyId, null, null);
        
        // 권한 필터링 적용
        filterSalaryExpenses(expenseReports, userId);
        
        // 전표는 작성일 순서대로 정렬 (작성일 오름차순, 문서번호 오름차순)
        expenseReports.sort((a, b) -> {
            LocalDate aDate = a.getReportDate();
            LocalDate bDate = b.getReportDate();
            
            if (aDate != null && bDate != null) {
                int dateCompare = aDate.compareTo(bDate);
                if (dateCompare != 0) {
                    return dateCompare;
                }
            } else if (aDate != null) {
                return -1;
            } else if (bDate != null) {
                return 1;
            }
            // 같은 날짜면 문서번호 오름차순
            Long aId = a.getExpenseReportId() != null ? a.getExpenseReportId() : 0L;
            Long bId = b.getExpenseReportId() != null ? b.getExpenseReportId() : 0L;
            return Long.compare(aId, bId);
        });
        
        // 각 지출결의서의 상세 내역 조회
        List<Long> expenseReportIds = expenseReports.stream()
                .map(ExpenseReportDto::getExpenseReportId)
                .collect(Collectors.toList());
        
        Map<Long, List<ExpenseDetailDto>> detailsMap = new HashMap<>();
        if (!expenseReportIds.isEmpty()) {
            List<ExpenseDetailDto> allDetails = expenseMapper.selectExpenseDetailsBatch(expenseReportIds, companyId);
            detailsMap = allDetails.stream()
                    .collect(Collectors.groupingBy(ExpenseDetailDto::getExpenseReportId));
        }
        
        // 영수증 데이터 조회
        Map<Long, List<ReceiptDto>> receiptsMap = new HashMap<>();
        if (!expenseReportIds.isEmpty()) {
            for (Long reportId : expenseReportIds) {
                List<ReceiptDto> receipts = expenseMapper.selectReceiptsByExpenseReportId(reportId, companyId);
                if (receipts != null && !receipts.isEmpty()) {
                    receiptsMap.put(reportId, receipts);
                }
            }
        }
        
        // 엑셀 파일 생성
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("세무전표");
        
        
        // 헤더 스타일
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        
        // 데이터 스타일
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);
        
        // 숫자 스타일
        CellStyle numberStyle = workbook.createCellStyle();
        numberStyle.cloneStyleFrom(dataStyle);
        DataFormat format = workbook.createDataFormat();
        numberStyle.setDataFormat(format.getFormat("#,##0"));
        
        // 헤더 행 생성
        Row headerRow = sheet.createRow(0);
        String[] headers = {"전표일자", "적요", "차변계정과목", "차변금액", "대변계정과목", "대변금액", "문서번호", "비고"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 데이터 행 생성
        int rowNum = 1;

        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
            
            // APPROVED 상태인 경우 분개 처리:
            // 승인 시점의 분개: 차변(비용) / 대변(현금) - 결재 금액 기준
            
            // 1. APPROVED 시점 분개 생성 (결재 금액 기준)
            if (details.isEmpty()) {
                Row row = sheet.createRow(rowNum++);
                createJournalEntryRowForApproved(row, report, null, dataStyle, numberStyle);
            } else {
                for (int i = 0; i < details.size(); i++) {
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForApproved(row, report, details.get(i), dataStyle, numberStyle);
                }
            }
            
            // 승인 시점 분개 생성 (결재 금액 기준)
            if (details.isEmpty()) {
                Row row = sheet.createRow(rowNum++);
                createJournalEntryRowForPaid(row, report, null, dataStyle, numberStyle);
            } else {
                for (ExpenseDetailDto detail : details) {
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForPaid(row, report, detail, dataStyle, numberStyle);
                }
            }
            
            // 3. 미지급금 잔액 정리 및 추가 비용 분개 생성 (항목별 차액 처리)
            if (details.isEmpty()) {
                // 상세 항목이 없는 경우 문서 레벨 금액으로 처리
                long totalApprovalAmount = report.getTotalAmount() != null ? report.getTotalAmount() : 0L;
                long totalActualPaidAmount = report.getActualPaidAmount() != null ? report.getActualPaidAmount() : totalApprovalAmount;
                long difference = totalApprovalAmount - totalActualPaidAmount;
                
                if (difference > 0) {
                    // 실제 지급 금액이 결재 금액보다 작은 경우: 잔액 정리
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForRemainingBalance(row, report, difference, "기타비용", dataStyle, numberStyle);
                } else if (difference < 0) {
                    // 실제 지급 금액이 결재 금액보다 큰 경우: 추가 비용
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForAdditionalExpense(row, report, null, Math.abs(difference), "기타비용", dataStyle, numberStyle);
                }
            } else {
                // 상세 항목별로 차액 계산 및 처리
                Map<String, Long> additionalExpenseByAccount = new HashMap<>();
                Map<String, Long> remainingBalanceByAccount = new HashMap<>();
                
                for (ExpenseDetailDto detail : details) {
                    long approvalAmount = detail.getAmount() != null ? detail.getAmount() : 0L;
                    long actualPaidAmount = detail.getActualPaidAmount() != null ? detail.getActualPaidAmount() : approvalAmount;
                    long itemDifference = approvalAmount - actualPaidAmount;
                    
                    String category = detail.getCategory() != null ? detail.getCategory() : "";
                    String merchantName = detail.getMerchantName();
                    String accountCode = mapCategoryToAccountCode(category, merchantName);
                    
                    if (itemDifference > 0) {
                        // 잔액 정리
                        remainingBalanceByAccount.merge(accountCode, itemDifference, Long::sum);
                    } else if (itemDifference < 0) {
                        // 추가 비용
                        additionalExpenseByAccount.merge(accountCode, Math.abs(itemDifference), Long::sum);
                    }
                }
                
                // 추가 비용 분개 생성 (계정과목별로)
                for (Map.Entry<String, Long> entry : additionalExpenseByAccount.entrySet()) {
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForAdditionalExpense(row, report, null, entry.getValue(), entry.getKey(), dataStyle, numberStyle);
                }

                // 잔액 정리 분개 생성 (계정과목별로)
                for (Map.Entry<String, Long> entry : remainingBalanceByAccount.entrySet()) {
                    Row row = sheet.createRow(rowNum++);
                    createJournalEntryRowForRemainingBalance(row, report, entry.getValue(), entry.getKey(), dataStyle, numberStyle);
                }
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
        
        // 임시 파일로 저장
        File tempFile = File.createTempFile("tax_journal_entry_", ".xlsx");
        try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
            workbook.write(outputStream);
        }
        workbook.close();
        
        logger.info("세무사 전용 전표 엑셀 파일 생성 완료 - 파일명: {}, 건수: {}", tempFile.getName(), expenseReports.size());
        
        return tempFile;
    }

    /**
     * 부가세 신고 서식 생성
     */
    public File exportTaxReportToExcel(LocalDate startDate, LocalDate endDate) throws IOException {
        return taxReportService.exportTaxReportToExcel(startDate, endDate);
    }

    /**
     * 상세 항목의 부가세 공제 정보 업데이트 (TAX_ACCOUNTANT 전용)
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void updateExpenseDetailTaxInfo(Long expenseDetailId, Boolean isTaxDeductible, String nonDeductibleReason) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 상세 항목 존재 여부 확인
        Long expenseReportId = expenseMapper.selectExpenseReportIdByDetailId(expenseDetailId, companyId);
        if (expenseReportId == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("상세 항목을 찾을 수 없습니다.");
        }
        
        List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetails(expenseReportId, companyId);
        boolean exists = details.stream()
                .anyMatch(d -> d.getExpenseDetailId().equals(expenseDetailId));
        
        if (!exists) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("상세 항목을 찾을 수 없습니다.");
        }
        
        // 업데이트
        expenseMapper.updateExpenseDetailTaxInfo(expenseDetailId, isTaxDeductible, nonDeductibleReason, companyId);
        
        logger.info("부가세 공제 정보 업데이트 완료 - expenseDetailId: {}, isTaxDeductible: {}, reason: {}", 
                expenseDetailId, isTaxDeductible, nonDeductibleReason);
    }
    
    /**
     * APPROVED 시점 분개 행 생성
     * 차변(비용) / 대변(미지급금) - 결재 금액 기준
     */
    private void createJournalEntryRowForApproved(Row row, ExpenseReportDto report, ExpenseDetailDto detail, CellStyle dataStyle, CellStyle numberStyle) {
        int col = 0;
        
        // 전표일자 (최종 승인일, 없으면 작성일)
        Cell cell = row.createCell(col++);
        if (report.getFinalApprovalDate() != null) {
            cell.setCellValue(report.getFinalApprovalDate().toLocalDate().toString());
        } else if (report.getReportDate() != null) {
            cell.setCellValue(report.getReportDate().toString());
        } else {
            cell.setCellValue("");
        }
        cell.setCellStyle(dataStyle);
        
        // 적요 (제목 또는 상세 적요)
        cell = row.createCell(col++);
        String description = detail != null && detail.getDescription() != null && !detail.getDescription().isEmpty()
                ? detail.getDescription()
                : "";
        cell.setCellValue(description);
        cell.setCellStyle(dataStyle);
        
        // 결재 금액 (원래 금액)
        Long approvalAmount = detail != null && detail.getAmount() != null ? detail.getAmount() : 
                             (report.getTotalAmount() != null ? report.getTotalAmount() : 0L);
        
        // 차변 계정과목 (카테고리 기반)
        cell = row.createCell(col++);
        String category = detail != null && detail.getCategory() != null ? detail.getCategory() : "";
        String merchantName = detail != null ? detail.getMerchantName() : null;
        String debitAccount = mapCategoryToAccountCode(category, merchantName);
        cell.setCellValue(debitAccount);
        cell.setCellStyle(dataStyle);
        
        // 차변 금액 (비용 - 결재 금액)
        cell = row.createCell(col++);
        cell.setCellValue(approvalAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 대변 계정과목 (미지급금)
        cell = row.createCell(col++);
        cell.setCellValue("미지급금");
        cell.setCellStyle(dataStyle);
        
        // 대변 금액 (미지급금 - 결재 금액)
        cell = row.createCell(col++);
        cell.setCellValue(approvalAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 문서번호
        cell = row.createCell(col++);
        cell.setCellValue(report.getExpenseReportId() != null ? report.getExpenseReportId() : 0);
        cell.setCellStyle(dataStyle);
        
        // 비고
        cell = row.createCell(col++);
        String note = detail != null && detail.getNote() != null ? detail.getNote() : "";

        // 카드 결제인 경우 전체 카드번호를 복호화하여 비고에 추가
        if (detail != null
                && detail.getPaymentMethod() != null
                && ("CARD".equals(detail.getPaymentMethod())
                    || "COMPANY_CARD".equals(detail.getPaymentMethod())
                    || "CREDIT_CARD".equals(detail.getPaymentMethod())
                    || "DEBIT_CARD".equals(detail.getPaymentMethod()))
                && detail.getCardNumber() != null
                && !detail.getCardNumber().trim().isEmpty()) {
            try {
                String decryptedCardNumber = encryptionUtil.decrypt(detail.getCardNumber());
                if (decryptedCardNumber != null && !decryptedCardNumber.isEmpty()) {
                    String cardInfo = "카드번호: " + decryptedCardNumber;
                    note = (note == null || note.isEmpty()) ? cardInfo : note + " / " + cardInfo;
                }
            } catch (Exception e) {
                logger.error("전표 생성 중 카드번호 복호화 실패 - expenseReportId: {}, detailId: {}",
                        report.getExpenseReportId(), detail.getExpenseDetailId(), e);
            }
        }

        cell.setCellValue(note != null ? note : "");
        cell.setCellStyle(dataStyle);
    }
    
    /**
     * 승인 시점 분개 행 생성
     * 차변(비용) / 대변(결제수단별 계정과목) - 결재 금액 기준
     */
    private void createJournalEntryRowForPaid(Row row, ExpenseReportDto report, ExpenseDetailDto detail, CellStyle dataStyle, CellStyle numberStyle) {
        int col = 0;
        
        // 전표일자 (최종 승인일, 없으면 작성일)
        Cell cell = row.createCell(col++);
        if (report.getFinalApprovalDate() != null) {
            cell.setCellValue(report.getFinalApprovalDate().toLocalDate().toString());
        } else if (report.getReportDate() != null) {
            cell.setCellValue(report.getReportDate().toString());
        } else {
            cell.setCellValue("");
        }
        cell.setCellStyle(dataStyle);
        
        // 적요 (제목 또는 상세 적요)
        cell = row.createCell(col++);
        String description = detail != null && detail.getDescription() != null && !detail.getDescription().isEmpty()
                ? detail.getDescription()
                : "";
        cell.setCellValue(description);
        cell.setCellStyle(dataStyle);
        
        // 결재 금액 (원래 금액)
        Long approvalAmount = detail != null && detail.getAmount() != null ? detail.getAmount() : 
                             (report.getTotalAmount() != null ? report.getTotalAmount() : 0L);
        
        // 실제 지급 금액 (있으면 사용, 없으면 결재 금액과 동일)
        Long actualPaidAmount = detail != null && detail.getActualPaidAmount() != null 
                                ? detail.getActualPaidAmount() 
                                : (report.getActualPaidAmount() != null && detail == null 
                                    ? report.getActualPaidAmount() 
                                    : approvalAmount);
        
        // 차변 계정과목 (미지급금)
        cell = row.createCell(col++);
        cell.setCellValue("미지급금");
        cell.setCellStyle(dataStyle);
        
        // 차변 금액 (미지급금 - 실제 지급 금액)
        cell = row.createCell(col++);
        cell.setCellValue(actualPaidAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 대변 계정과목 (결제수단에 따라 결정)
        cell = row.createCell(col++);
        String paymentMethod = detail != null && detail.getPaymentMethod() != null 
                              ? detail.getPaymentMethod() 
                              : null;
        String creditAccount = mapPaymentMethodToCreditAccount(paymentMethod);
        cell.setCellValue(creditAccount);
        cell.setCellStyle(dataStyle);
        
        // 대변 금액 (현금 - 실제 지급 금액)
        cell = row.createCell(col++);
        cell.setCellValue(actualPaidAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 문서번호
        cell = row.createCell(col++);
        cell.setCellValue(report.getExpenseReportId() != null ? report.getExpenseReportId() : 0);
        cell.setCellStyle(dataStyle);
        
        // 비고
        cell = row.createCell(col++);
        String note = detail != null && detail.getNote() != null ? detail.getNote() : "";

        // 카드 결제인 경우 전체 카드번호를 복호화하여 비고에 추가
        if (detail != null
                && detail.getPaymentMethod() != null
                && ("CARD".equals(detail.getPaymentMethod())
                    || "COMPANY_CARD".equals(detail.getPaymentMethod())
                    || "CREDIT_CARD".equals(detail.getPaymentMethod())
                    || "DEBIT_CARD".equals(detail.getPaymentMethod()))
                && detail.getCardNumber() != null
                && !detail.getCardNumber().trim().isEmpty()) {
            try {
                String decryptedCardNumber = encryptionUtil.decrypt(detail.getCardNumber());
                if (decryptedCardNumber != null && !decryptedCardNumber.isEmpty()) {
                    String cardInfo = "카드번호: " + decryptedCardNumber;
                    note = (note == null || note.isEmpty()) ? cardInfo : note + " / " + cardInfo;
                }
            } catch (Exception e) {
                logger.error("전표 생성 중 카드번호 복호화 실패 - expenseReportId: {}, detailId: {}",
                        report.getExpenseReportId(), detail.getExpenseDetailId(), e);
            }
        }

        cell.setCellValue(note != null ? note : "");
        cell.setCellStyle(dataStyle);
    }
    
    /**
     * 미지급금 잔액 정리 분개 행 생성
     * 차변(미지급금 잔액) / 대변(원래 비용 계정과목) - 결재 금액과 실제 지급 금액의 차액
     * 비용이 줄어야 하므로 수익을 늘리지 않고 원래 비용 계정과목을 차감 처리
     */
    private void createJournalEntryRowForRemainingBalance(Row row, ExpenseReportDto report, Long balanceAmount, String accountCode, CellStyle dataStyle, CellStyle numberStyle) {
        int col = 0;
        
        // 전표일자 (최종 승인일, 없으면 작성일)
        Cell cell = row.createCell(col++);
        if (report.getFinalApprovalDate() != null) {
            cell.setCellValue(report.getFinalApprovalDate().toLocalDate().toString());
        } else if (report.getReportDate() != null) {
            cell.setCellValue(report.getReportDate().toString());
        } else {
            cell.setCellValue("");
        }
        cell.setCellStyle(dataStyle);
        
        // 적요 (" 미지급금 잔액 정리")
        cell = row.createCell(col++);
        String description = "미지급금 잔액 정리";
        cell.setCellValue(description);
        cell.setCellStyle(dataStyle);
        
        // 차변 계정과목 (미지급금)
        cell = row.createCell(col++);
        cell.setCellValue("미지급금");
        cell.setCellStyle(dataStyle);
        
        // 차변 금액 (미지급금 잔액)
        cell = row.createCell(col++);
        cell.setCellValue(balanceAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 대변 계정과목 (원래 비용 계정과목 - 기타수익이 아님)
        cell = row.createCell(col++);
        cell.setCellValue(accountCode != null ? accountCode : "기타비용");
        cell.setCellStyle(dataStyle);
        
        // 대변 금액 (비용 차감)
        cell = row.createCell(col++);
        cell.setCellValue(balanceAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 문서번호
        cell = row.createCell(col++);
        cell.setCellValue(report.getExpenseReportId() != null ? report.getExpenseReportId() : 0);
        cell.setCellStyle(dataStyle);
        
        // 비고
        cell = row.createCell(col++);
        String note = "결재 금액과 실제 지급 금액 차액";
        if (report.getAmountDifferenceReason() != null && !report.getAmountDifferenceReason().trim().isEmpty()) {
            note += " - " + report.getAmountDifferenceReason();
        }
        cell.setCellValue(note);
        cell.setCellStyle(dataStyle);
    }
    
    /**
     * 추가 비용 분개 행 생성 (실제 지급 금액이 결재 금액보다 클 때)
     * 회계 원칙: 차변(해당 항목의 계정과목) / 대변(미지급금)
     * @param row 엑셀 행
     * @param report 지출결의서 정보
     * @param detail 상세 항목 정보 (선택적, 단일 항목일 때 사용)
     * @param additionalAmount 추가 지급 금액
     * @param accountCode 계정과목명
     * @param dataStyle 데이터 스타일
     * @param numberStyle 숫자 스타일
     */
    private void createJournalEntryRowForAdditionalExpense(Row row, ExpenseReportDto report, ExpenseDetailDto detail, Long additionalAmount, String accountCode, CellStyle dataStyle, CellStyle numberStyle) {
        int col = 0;
        
        // 전표일자 (최종 승인일, 없으면 작성일)
        Cell cell = row.createCell(col++);
        if (report.getFinalApprovalDate() != null) {
            cell.setCellValue(report.getFinalApprovalDate().toLocalDate().toString());
        } else if (report.getReportDate() != null) {
            cell.setCellValue(report.getReportDate().toString());
        } else {
            cell.setCellValue("");
        }
        cell.setCellStyle(dataStyle);
        
        // 적요 (제목 또는 상세 적요 + " 추가 지급")
        cell = row.createCell(col++);
        String description = detail != null && detail.getDescription() != null && !detail.getDescription().isEmpty()
                ? detail.getDescription() + " 추가 지급"
                : "추가 지급";
        cell.setCellValue(description);
        cell.setCellStyle(dataStyle);
        
        // 차변 계정과목 (해당 항목의 계정과목)
        cell = row.createCell(col++);
        cell.setCellValue(accountCode);
        cell.setCellStyle(dataStyle);
        
        // 차변 금액 (추가 지급 금액)
        cell = row.createCell(col++);
        cell.setCellValue(additionalAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 대변 계정과목 (미지급금)
        cell = row.createCell(col++);
        cell.setCellValue("미지급금");
        cell.setCellStyle(dataStyle);
        
        // 대변 금액 (추가 지급 금액)
        cell = row.createCell(col++);
        cell.setCellValue(additionalAmount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 문서번호
        cell = row.createCell(col++);
        cell.setCellValue(report.getExpenseReportId() != null ? report.getExpenseReportId() : 0);
        cell.setCellStyle(dataStyle);
        
        // 비고 (차이 사유 포함)
        cell = row.createCell(col++);
        String note = "실제 지급 금액이 결재 금액보다 큰 경우 추가 비용";
        if (report.getAmountDifferenceReason() != null && !report.getAmountDifferenceReason().trim().isEmpty()) {
            note += " - " + report.getAmountDifferenceReason();
        }
        cell.setCellValue(note);
        cell.setCellStyle(dataStyle);
    }
    
    /**
     * 카테고리와 가맹점명을 계정과목 코드로 매핑
     * AccountCodeService를 사용하여 데이터베이스의 매핑 정보를 활용
     * @param category 카테고리
     * @param merchantName 가맹점명 (선택사항)
     * @return 계정과목명
     */
    private String mapCategoryToAccountCode(String category, String merchantName) {
        if (category == null || category.isEmpty()) {
            return "기타비용";
        }
        
        try {
            // AccountCodeService를 통해 데이터베이스의 매핑 정보 조회
            var mapping = accountCodeService.recommendAccountCode(category, merchantName);
            if (mapping != null && mapping.getAccountName() != null && !mapping.getAccountName().isEmpty()) {
                return mapping.getAccountName();
            }
        } catch (Exception e) {
            logger.warn("계정 코드 매핑 조회 실패 - category: {}, merchantName: {}, error: {}", 
                category, merchantName, e.getMessage());
        }
        
        // 매핑 정보가 없거나 오류 발생 시 기본값 반환
        return "기타비용";
    }
    
    /**
     * 결제수단을 대변 계정과목으로 매핑
     * @param paymentMethod 결제수단
     * @return 계정과목명
     */
    private String mapPaymentMethodToCreditAccount(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isEmpty()) {
            return "현금"; // 기본값
        }
        
        // 결제수단별 계정과목 매핑
        switch (paymentMethod.toUpperCase()) {
            case "CASH":
                return "현금";
            case "BANK_TRANSFER":
            case "TRANSFER":
                return "일반예금";
            case "CARD":
            case "CREDIT_CARD":
            case "DEBIT_CARD":
                return "카드대금";
            case "CHECK":
                return "수표";
            default:
                return "현금"; // 기본값
        }
    }
    
    /**
     * 세무 검토용 증빙 리스트 생성 (전체 상세 버전 - 5개 시트)
     * @param startDate 시작일 (optional)
     * @param endDate 종료일 (optional)
     * @param userId 현재 사용자 ID (권한 필터링용)
     * @return 생성된 엑셀 파일
     * @throws IOException 파일 생성 실패 시
     */
    /**
     * 세무 검토용 증빙 리스트 다운로드 (기존 API 호환성 유지)
     * @param startDate 시작일 (optional)
     * @param endDate 종료일 (optional)
     * @param userId 현재 사용자 ID (권한 필터링용)
     * @return 생성된 엑셀 파일
     * @throws IOException 파일 생성 실패 시
     */
    public File exportFullTaxReview(LocalDate startDate, LocalDate endDate, Long userId) throws IOException {
        return exportExpensesToExcel(startDate, endDate, userId, "tax-review");
    }
    
    /**
     * Sheet 1: 전체 증빙 내역 생성
     */
    private void createFullDetailSheet(Workbook workbook, List<ExpenseReportDto> expenseReports,
                                      Map<Long, List<ExpenseDetailDto>> detailsMap,
                                      Map<Long, List<ReceiptDto>> receiptsMap,
                                      String projectRoot) throws IOException {
        Sheet sheet = workbook.createSheet("전체 증빙 내역");
        
        // 스타일 설정
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        
        // 헤더 행
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "문서번호", "작성일", "지급일", "작성자", "부서",
            "카테고리", "거래처", "적요",
            "결재금액", "실지급액", "차액",
            "부가세포함", "공급가액", "부가세", "공제가능", "공제불가사유",
            "계정코드", "계정과목",
            "결제수단", "카드정보",
            "비고", "상태", "수정요청"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 데이터 행 생성
        int rowNum = 1;

        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());

            if (details.isEmpty()) {
                // 상세항목 없을 때
                Row row = sheet.createRow(rowNum++);
                fillFullDetailRow(row, report, null, dataStyle, numberStyle);
            } else {
                // 상세항목별로 각각 한 줄씩
                for (int i = 0; i < details.size(); i++) {
                    ExpenseDetailDto detail = details.get(i);
                    Row row = sheet.createRow(rowNum++);
                    fillFullDetailRow(row, report, detail, dataStyle, numberStyle);
                }
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 1000, 15000));
        }
    }
    
    /**
     * 전체 증빙 내역 행 데이터 채우기
     */
    private void fillFullDetailRow(Row row, ExpenseReportDto report, ExpenseDetailDto detail,
                                   CellStyle dataStyle, CellStyle numberStyle) {
        int col = 0;
        Cell cell;
        
        // 문서번호
        cell = row.createCell(col++);
        cell.setCellValue(report.getExpenseReportId() != null ? report.getExpenseReportId().toString() : "");
        cell.setCellStyle(dataStyle);

        // 작성일
        cell = row.createCell(col++);
        cell.setCellValue(report.getReportDate() != null ? report.getReportDate().toString() : "");
        cell.setCellStyle(dataStyle);

        // 지급일 (paymentReqDate 사용)
        cell = row.createCell(col++);
        cell.setCellValue(report.getPaymentReqDate() != null ? report.getPaymentReqDate().toString() : "");
        cell.setCellStyle(dataStyle);

        // 작성자
        cell = row.createCell(col++);
        cell.setCellValue(report.getDrafterName() != null ? report.getDrafterName() : "");
        cell.setCellStyle(dataStyle);

        // 부서 (없음 - 빈 문자열)
        cell = row.createCell(col++);
        cell.setCellValue("");
        cell.setCellStyle(dataStyle);
        
        if (detail != null) {
            // 상세 항목 정보
            // 카테고리
            cell = row.createCell(col++);
            cell.setCellValue(detail.getCategory() != null ? detail.getCategory() : "");
            cell.setCellStyle(dataStyle);
            
            // 거래처
            cell = row.createCell(col++);
            cell.setCellValue(detail.getMerchantName() != null ? detail.getMerchantName() : "");
            cell.setCellStyle(dataStyle);
            
            // 적요
            cell = row.createCell(col++);
            cell.setCellValue(detail.getDescription() != null ? detail.getDescription() : "");
            cell.setCellStyle(dataStyle);
            
            // 결재금액
            cell = row.createCell(col++);
            cell.setCellValue(detail.getAmount() != null ? detail.getAmount().doubleValue() : 0);
            cell.setCellStyle(numberStyle);
            
            // 실지급액
            cell = row.createCell(col++);
            Long actualPaid = detail.getActualPaidAmount() != null ? detail.getActualPaidAmount() : detail.getAmount();
            cell.setCellValue(actualPaid != null ? actualPaid.doubleValue() : 0);
            cell.setCellStyle(numberStyle);
            
            // 차액
            cell = row.createCell(col++);
            Long diff = (actualPaid != null ? actualPaid : 0L) - (detail.getAmount() != null ? detail.getAmount() : 0L);
            cell.setCellValue(diff.doubleValue());
            cell.setCellStyle(numberStyle);
            
            // 부가세포함 (항상 N으로 표시 - 필드 없음)
            cell = row.createCell(col++);
            cell.setCellValue("N");
            cell.setCellStyle(dataStyle);
            
            // 공급가액, 부가세 (부가세 미포함으로 처리)
            cell = row.createCell(col++);
            cell.setCellValue(detail.getAmount() != null ? detail.getAmount().doubleValue() : 0);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(0);
            cell.setCellStyle(numberStyle);
            
            // 공제가능
            cell = row.createCell(col++);
            cell.setCellValue(detail.getIsTaxDeductible() != null && detail.getIsTaxDeductible() ? "Y" : "N");
            cell.setCellStyle(dataStyle);
            
            // 공제불가사유
            cell = row.createCell(col++);
            cell.setCellValue(detail.getNonDeductibleReason() != null ? detail.getNonDeductibleReason() : "");
            cell.setCellStyle(dataStyle);
            
            // 계정과목 추천
            String accountCode = mapCategoryToAccountCode(detail.getCategory(), detail.getMerchantName());
            cell = row.createCell(col++);
            cell.setCellValue(extractAccountCode(accountCode));
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(accountCode);
            cell.setCellStyle(dataStyle);
            
        } else {
            // 상세 항목 없을 때 - 문서 레벨 정보
            cell = row.createCell(col++);
            cell.setCellValue("");
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue("");
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(report.getTitle() != null ? report.getTitle() : "");
            cell.setCellStyle(dataStyle);
            
            // 결재금액
            cell = row.createCell(col++);
            cell.setCellValue(report.getTotalAmount() != null ? report.getTotalAmount().doubleValue() : 0);
            cell.setCellStyle(numberStyle);
            
            // 실지급액
            cell = row.createCell(col++);
            Long actualPaid = report.getActualPaidAmount() != null ? report.getActualPaidAmount() : report.getTotalAmount();
            cell.setCellValue(actualPaid != null ? actualPaid.doubleValue() : 0);
            cell.setCellStyle(numberStyle);
            
            // 차액
            cell = row.createCell(col++);
            Long diff = (actualPaid != null ? actualPaid : 0L) - (report.getTotalAmount() != null ? report.getTotalAmount() : 0L);
            cell.setCellValue(diff.doubleValue());
            cell.setCellStyle(numberStyle);
            
            // 부가세 관련 (기본값)
            for (int i = 0; i < 6; i++) {
                cell = row.createCell(col++);
                cell.setCellValue(i == 0 ? "N" : "");
                cell.setCellStyle(dataStyle);
            }
        }
        
        // 결제수단 (detail에서 가져오거나 빈 문자열)
        cell = row.createCell(col++);
        cell.setCellValue(detail != null && detail.getPaymentMethod() != null ? detail.getPaymentMethod() : "");
        cell.setCellStyle(dataStyle);

        // 카드정보 (detail에서 가져오거나 빈 문자열)
        cell = row.createCell(col++);
        String cardInfo = "";
        if (detail != null && detail.getCardNumber() != null && !detail.getCardNumber().trim().isEmpty()) {
            try {
                String decryptedCardNumber = encryptionUtil.decrypt(detail.getCardNumber());
                if (decryptedCardNumber != null) {
                    // 카드번호 포맷팅 (하이픈 추가)
                    cardInfo = formatCardNumber(decryptedCardNumber);
                }
            } catch (Exception e) {
                logger.debug("카드정보 표시 중 카드번호 복호화 실패 - expenseReportId: {}, detailId: {}",
                        report.getExpenseReportId(), detail.getExpenseDetailId(), e);
                // 복호화 실패 시 빈 문자열로 표시
                cardInfo = "";
            }
        }
        cell.setCellValue(cardInfo);
        cell.setCellStyle(dataStyle);

        // 비고 (detail의 note 사용)
        cell = row.createCell(col++);
        cell.setCellValue(detail != null && detail.getNote() != null ? detail.getNote() : "");
        cell.setCellStyle(dataStyle);

        // 상태
        cell = row.createCell(col++);
        cell.setCellValue(report.getStatus() != null ? report.getStatus() : "");
        cell.setCellStyle(dataStyle);

        // 수정요청
        cell = row.createCell(col++);
        cell.setCellValue(report.getTaxRevisionRequested() != null && report.getTaxRevisionRequested() ? "Y" : "N");
        cell.setCellStyle(dataStyle);
    }
    
    /**
     * Sheet 2: 증빙 누락 체크리스트 생성
     */
    private void createMissingReceiptSheet(Workbook workbook, List<ExpenseReportDto> expenseReports,
                                          Map<Long, List<ReceiptDto>> receiptsMap) {
        Sheet sheet = workbook.createSheet("증빙 누락 체크리스트");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle warningStyle = createMissingReceiptStyle(workbook);
        
        // 헤더 행
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "문서번호", "작성일", "작성자", "연락처",
            "제목", "금액", "누락사유", "요청일", "처리상태"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 영수증 없는 항목만 필터링
        int rowNum = 1;
        for (ExpenseReportDto report : expenseReports) {
            List<ReceiptDto> receipts = receiptsMap.get(report.getExpenseReportId());
            if (receipts == null || receipts.isEmpty()) {
                Row row = sheet.createRow(rowNum++);
                int col = 0;
                Cell cell;
                
                cell = row.createCell(col++);
                cell.setCellValue(report.getExpenseReportId().toString());
                cell.setCellStyle(warningStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue(report.getReportDate() != null ? report.getReportDate().toString() : "");
                cell.setCellStyle(warningStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue(report.getDrafterName() != null ? report.getDrafterName() : "");
                cell.setCellStyle(warningStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue(""); // 연락처 필드 없음
                cell.setCellStyle(warningStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue(report.getTitle() != null ? report.getTitle() : "");
                cell.setCellStyle(warningStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue(report.getTotalAmount() != null ? report.getTotalAmount().doubleValue() : 0);
                cell.setCellStyle(numberStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue("영수증 미제출");
                cell.setCellStyle(warningStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue("");
                cell.setCellStyle(warningStyle);
                
                cell = row.createCell(col++);
                cell.setCellValue("미요청");
                cell.setCellStyle(warningStyle);
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    /**
     * Sheet 3: 부가세 검토 항목 생성
     */
    private void createVatReviewSheet(Workbook workbook, List<ExpenseReportDto> expenseReports,
                                     Map<Long, List<ExpenseDetailDto>> detailsMap) {
        Sheet sheet = workbook.createSheet("부가세 검토");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        
        // 헤더 행
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "문서번호", "작성일", "지급일", "거래처",
            "총금액", "공급가액", "부가세",
            "공제가능", "공제불가", "불가사유",
            "계정과목", "비고"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 부가세 포함 항목만
        int rowNum = 1;
        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
            
            for (ExpenseDetailDto detail : details) {
                // 모든 항목 포함 (vatIncluded 필드 없음)
                if (true) {
                    Row row = sheet.createRow(rowNum++);
                    int col = 0;
                    Cell cell;
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(report.getExpenseReportId().toString());
                    cell.setCellStyle(dataStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(report.getReportDate() != null ? report.getReportDate().toString() : "");
                    cell.setCellStyle(dataStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(report.getPaymentReqDate() != null ? report.getPaymentReqDate().toString() : "");
                    cell.setCellStyle(dataStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(detail.getMerchantName() != null ? detail.getMerchantName() : "");
                    cell.setCellStyle(dataStyle);
                    
                    long totalAmount = detail.getAmount() != null ? detail.getAmount() : 0L;
                    long supplyValue = Math.round(totalAmount / 1.1);
                    long vat = totalAmount - supplyValue;
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(totalAmount);
                    cell.setCellStyle(numberStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(supplyValue);
                    cell.setCellStyle(numberStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(vat);
                    cell.setCellStyle(numberStyle);
                    
                    boolean isDeductible = detail.getIsTaxDeductible() != null && detail.getIsTaxDeductible();
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(isDeductible ? vat : 0);
                    cell.setCellStyle(numberStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(isDeductible ? 0 : vat);
                    cell.setCellStyle(numberStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue(detail.getNonDeductibleReason() != null ? detail.getNonDeductibleReason() : "");
                    cell.setCellStyle(dataStyle);
                    
                    String accountCode = mapCategoryToAccountCode(detail.getCategory(), detail.getMerchantName());
                    cell = row.createCell(col++);
                    cell.setCellValue(accountCode);
                    cell.setCellStyle(dataStyle);
                    
                    cell = row.createCell(col++);
                    cell.setCellValue("");
                    cell.setCellStyle(dataStyle);
                }
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    /**
     * Sheet 4: 카테고리별 집계 생성
     */
    private void createCategorySummarySheet(Workbook workbook, List<ExpenseReportDto> expenseReports,
                                           Map<Long, List<ExpenseDetailDto>> detailsMap) {
        Sheet sheet = workbook.createSheet("카테고리별 집계");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        
        // 헤더 행
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "카테고리", "건수", "총액",
            "부가세", "공제가능액", "공제불가액",
            "계정코드", "계정과목"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 카테고리별 집계
        Map<String, CategorySummary> summaryMap = new HashMap<>();
        
        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());

            if (details.isEmpty()) {
                String category = "기타";
                summaryMap.computeIfAbsent(category, k -> new CategorySummary())
                         .addReport(report);
            } else {
                for (ExpenseDetailDto detail : details) {
                    String category = detail.getCategory() != null ? detail.getCategory() : "기타";
                    summaryMap.computeIfAbsent(category, k -> new CategorySummary())
                             .addDetail(detail);
                }
            }
        }
        
        // 집계 데이터 출력
        int rowNum = 1;
        for (Map.Entry<String, CategorySummary> entry : summaryMap.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            int col = 0;
            Cell cell;
            CategorySummary summary = entry.getValue();
            
            cell = row.createCell(col++);
            cell.setCellValue(entry.getKey());
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(summary.count);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(summary.totalAmount);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(summary.totalVat);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(summary.deductibleVat);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(summary.nonDeductibleVat);
            cell.setCellStyle(numberStyle);
            
            String accountCode = mapCategoryToAccountCode(entry.getKey(), null);
            cell = row.createCell(col++);
            cell.setCellValue(extractAccountCode(accountCode));
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(accountCode);
            cell.setCellStyle(dataStyle);
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    /**
     * Sheet 5: 더존 Import 형식 생성
     */
    private void createDaejonImportSheet(Workbook workbook, List<ExpenseReportDto> expenseReports,
                                        Map<Long, List<ExpenseDetailDto>> detailsMap) {
        Sheet sheet = workbook.createSheet("더존 Import");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        
        // 헤더 행
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "전표일자", "계정코드", "계정과목", "거래처",
            "적요", "공급가액", "부가세",
            "차변금액", "대변금액", "증빙유형", "비고"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 데이터 행
        int rowNum = 1;
        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
            
            if (details.isEmpty()) {
                Row row = sheet.createRow(rowNum++);
                fillDaejonImportRow(row, report, null, dataStyle, numberStyle);
            } else {
                for (ExpenseDetailDto detail : details) {
                    Row row = sheet.createRow(rowNum++);
                    fillDaejonImportRow(row, report, detail, dataStyle, numberStyle);
                }
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    /**
     * 더존 Import 행 데이터 채우기
     */
    private void fillDaejonImportRow(Row row, ExpenseReportDto report, ExpenseDetailDto detail,
                                     CellStyle dataStyle, CellStyle numberStyle) {
        int col = 0;
        Cell cell;
        
        // 전표일자 (지급 요청일 또는 작성일)
        cell = row.createCell(col++);
        LocalDate journalDate = report.getPaymentReqDate() != null ? report.getPaymentReqDate() : report.getReportDate();
        cell.setCellValue(journalDate != null ? journalDate.toString() : "");
        cell.setCellStyle(dataStyle);
        
        if (detail != null) {
            // 계정과목 (자동 매핑)
            String accountName = mapCategoryToAccountCode(detail.getCategory(), detail.getMerchantName());
            String accountCode = extractAccountCode(accountName);
            
            cell = row.createCell(col++);
            cell.setCellValue(accountCode);
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(accountName);
            cell.setCellStyle(dataStyle);
            
            // 거래처
            cell = row.createCell(col++);
            cell.setCellValue(detail.getMerchantName() != null ? detail.getMerchantName() : "");
            cell.setCellStyle(dataStyle);
            
            // 적요
            cell = row.createCell(col++);
            cell.setCellValue(detail.getDescription() != null ? detail.getDescription() : "");
            cell.setCellStyle(dataStyle);
            
            // 공급가액, 부가세 (부가세 미포함으로 처리)
            long totalAmount = detail.getAmount() != null ? detail.getAmount() : 0L;
            
            cell = row.createCell(col++);
            cell.setCellValue(totalAmount);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(0);
            cell.setCellStyle(numberStyle);
            
            // 차변금액 (비용)
            cell = row.createCell(col++);
            cell.setCellValue(totalAmount);
            cell.setCellStyle(numberStyle);
            
            // 대변금액 (현금/예금)
            cell = row.createCell(col++);
            cell.setCellValue(totalAmount);
            cell.setCellStyle(numberStyle);
            
        } else {
            // 상세 항목 없을 때
            cell = row.createCell(col++);
            cell.setCellValue("5290");
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue("기타비용");
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue("");
            cell.setCellStyle(dataStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(report.getTitle() != null ? report.getTitle() : "");
            cell.setCellStyle(dataStyle);
            
            long totalAmount = report.getTotalAmount() != null ? report.getTotalAmount() : 0L;
            
            cell = row.createCell(col++);
            cell.setCellValue(totalAmount);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(0);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(totalAmount);
            cell.setCellStyle(numberStyle);
            
            cell = row.createCell(col++);
            cell.setCellValue(totalAmount);
            cell.setCellStyle(numberStyle);
        }
        
        // 증빙유형
        cell = row.createCell(col++);
        cell.setCellValue("세금계산서");
        cell.setCellStyle(dataStyle);
        
        // 비고 (detail의 note 사용)
        cell = row.createCell(col++);
        String note = "";
        if (detail != null && detail.getNote() != null) {
            note = detail.getNote();
        } else if (report.getTitle() != null) {
            note = report.getTitle();
        }
        cell.setCellValue(note);
        cell.setCellStyle(dataStyle);
    }
    
    /**
     * 헤더 스타일 생성
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    /**
     * 데이터 스타일 생성
     */
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    /**
     * 숫자 스타일 생성
     */
    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        return style;
    }
    
    /**
     * 증빙 누락 스타일 생성 (주황색 배경)
     */
    private CellStyle createMissingReceiptStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    /**
     * 계정과목명에서 코드 추출
     */
    private String extractAccountCode(String accountName) {
        // 기본 매핑
        if (accountName == null) return "5290";
        
        switch (accountName) {
            case "급여": return "5110";
            case "여비교통비": return "5210";
            case "소모품비": return "5220";
            case "지급수수료": return "5230";
            case "광고선전비": return "5240";
            case "통신비": return "5250";
            case "차량유지비": return "5260";
            case "도서인쇄비": return "5270";
            case "세금과공과": return "5280";
            case "접대비": return "5310";
            case "복리후생비": return "5320";
            default: return "5290"; // 기타비용
        }
    }
    
    /**
     * 카테고리별 집계를 위한 헬퍼 클래스
     */
    private static class CategorySummary {
        int count = 0;
        long totalAmount = 0;
        long totalVat = 0;
        long deductibleVat = 0;
        long nonDeductibleVat = 0;

        void addReport(ExpenseReportDto report) {
            count++;
            totalAmount += report.getTotalAmount() != null ? report.getTotalAmount() : 0;
        }

        void addDetail(ExpenseDetailDto detail) {
            count++;
            long amount = detail.getAmount() != null ? detail.getAmount() : 0;
            totalAmount += amount;

            // 부가세 포함 여부 필드 없음 - 제외
        }
    }
}