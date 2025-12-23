package com.innersignature.backend.service;

import com.innersignature.backend.dto.ApprovalLineDto;
import com.innersignature.backend.dto.CategoryRatioDto;
import com.innersignature.backend.dto.DashboardStatsDto;
import com.innersignature.backend.dto.ExpenseDetailDto;
import com.innersignature.backend.dto.ExpenseReportDto;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Service // 스프링이 "이건 비즈니스 로직 담당이야"라고 인식
@RequiredArgsConstructor // final이 붙은 변수의 생성자를 자동으로 만들어줌 (의존성 주입)
public class ExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);
    private final ExpenseMapper expenseMapper; // 아까 만든 Mapper 가져오기
    private final UserService userService; // 사용자 정보 조회용
    private final PermissionUtil permissionUtil; // 권한 체크 유틸리티
    
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
     * @param isSecret 비밀글 여부 (optional, true: 비밀글만, false: 일반글만, null: 전체)
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
            Boolean isSecret,
            String drafterName,
            Long userId) {
        
        // statuses가 null이거나 비어있으면 null로 설정 (필터링 안 함)
        if (statuses != null && statuses.isEmpty()) {
            statuses = null;
        }
        
        // 필터링 조건 + 권한 필터링 후 실제 조회 가능한 전체 개수 계산
        long totalElements = calculateFilteredTotalElements(
                startDate, endDate, minAmount, maxAmount,
                statuses, category, taxProcessed, isSecret,
                drafterName, userId);
        
        // 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // 필터링된 전체 데이터 조회 (페이지네이션 없이)
        Long companyId = SecurityUtil.getCurrentCompanyId();
        List<ExpenseReportDto> allContent = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                minAmount, maxAmount,
                statuses, category, taxProcessed, isSecret,
                drafterName, companyId);
        
        // 급여 문서 권한 필터링
        filterSalaryExpenses(allContent, userId);
        // 권한에 따라 세무처리 정보 필터링
        filterTaxProcessingInfo(allContent, userId);
        
        // 필터링 후 페이지네이션 적용
        int offset = (page - 1) * size;
        int fromIndex = Math.min(offset, allContent.size());
        int toIndex = Math.min(offset + size, allContent.size());
        List<ExpenseReportDto> content = allContent.subList(fromIndex, toIndex);
        
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
        
        // (2-1) 급여 카테고리 또는 비밀글 권한 체크
        if (userId != null) {
            boolean hasSalary = hasSalaryCategory(details);
            Boolean isSecret = report.getIsSecret();
            boolean isSecretOrSalary = hasSalary || (isSecret != null && isSecret);
            
            if (isSecretOrSalary) {
                UserDto user = userService.selectUserById(userId);
                boolean isTaxAccountant = user != null && "TAX_ACCOUNTANT".equals(user.getRole());
                boolean isCEO = user != null && "CEO".equals(user.getRole());
                boolean isOwner = report.getDrafterId().equals(userId);
                
                // CEO는 같은 회사의 모든 비밀글 조회 가능
                if (isCEO) {
                    Long userCompanyId = user.getCompanyId();
                    if (userCompanyId != null && userCompanyId.equals(companyId)) {
                        // CEO는 같은 회사 비밀글 조회 가능
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

        // (5-1) 급여 카테고리인 경우 isSecret을 true로 설정
        boolean hasSalary = hasSalaryCategory(details);
        if (hasSalary) {
            report.setIsSecret(true);
        }

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

        // 7. 모든 결재자가 승인되었으면 문서 상태를 APPROVED로 변경
        if (allApproved) {
            expenseMapper.updateExpenseReportStatus(expenseId, "APPROVED", companyId);
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
                totalAmount += detail.getAmount();
                if ("급여".equals(detail.getCategory())) {
                    hasSalary = true;
                }
            }
        }
        request.setTotalAmount(totalAmount);

        // (0-4) 급여 카테고리는 CEO, ADMIN 또는 ACCOUNTANT만 사용 가능
        if (hasSalary && !permissionUtil.isAdminOrCEO(currentUserId) && !permissionUtil.isAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("급여 카테고리는 CEO, ADMIN 또는 ACCOUNTANT 권한만 사용할 수 있습니다.");
        }

        // (0-4-1) 급여 카테고리인 경우 자동으로 비밀글 설정
        Boolean isSecret = request.getIsSecret();
        if (hasSalary) {
            request.setIsSecret(true);
            isSecret = true;
        }

        // (0-4-2) 비밀글은 CEO, ADMIN 또는 ACCOUNTANT만 사용 가능
        if (isSecret != null && isSecret && !permissionUtil.isAdminOrCEO(currentUserId) && !permissionUtil.isAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("비밀글은 CEO, ADMIN 또는 ACCOUNTANT 권한만 사용할 수 있습니다.");
        }

        // (0-5) 급여이거나 비밀글인 경우 상태를 바로 PAID로 설정 (결재 없이 바로 지급완료)
        if (hasSalary || (isSecret != null && isSecret)) {
            request.setStatus("PAID");
        }

        // (1) 메인 문서(제목, 작성자 등) 먼저 저장
        // 이 과정이 끝나야 문서 번호(ID)가 생성됩니다.
        Long companyId = SecurityUtil.getCurrentCompanyId();
        request.setCompanyId(companyId);
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

        // (3) 결재 라인(누가 승인해야 하는지) 저장
        // 급여이거나 비밀글이 아닌 경우에만 결재 라인 생성
        // ※ 현재 플로우에서는 프론트에서 별도 API(setApprovalLines)를 통해 결재 라인을 설정하므로,
        //    여기서는 request에 결재 라인이 있는 경우에만 처리합니다.
        List<ApprovalLineDto> lines = request.getApprovalLines();
        boolean isSecretOrSalary = hasSalary || (isSecret != null && isSecret);

        if (!isSecretOrSalary && lines != null && !lines.isEmpty()) {
            // 결제담당자(ACCOUNTANT) 반드시 포함 확인 및 추가
            boolean hasAccountant = false;
            for (ApprovalLineDto line : lines) {
                UserDto user = userService.selectUserById(line.getApproverId());
                if (user != null && "ACCOUNTANT".equals(user.getRole())) {
                    hasAccountant = true;
                    break;
                }
            }

            // 결제담당자가 없으면 ACCOUNTANT 역할의 첫 번째 사용자 추가
            if (!hasAccountant) {
                List<UserDto> accountants = userService.selectUsersByRole("ACCOUNTANT", companyId);
                if (!accountants.isEmpty()) {
                    ApprovalLineDto accountantLine = new ApprovalLineDto();
                    accountantLine.setApproverId(accountants.get(0).getUserId());
                    accountantLine.setStepOrder(lines.size() + 1);
                    accountantLine.setStatus("WAIT");
                    lines.add(accountantLine);
                }
            }

            logger.debug("결재 라인 저장 시작 - 라인 수: {}", lines.size());
            for (ApprovalLineDto line : lines) {
                line.setExpenseReportId(newId); // "이 결재 라인도 그 문서(newId) 꺼야"라고 연결
                line.setCompanyId(companyId);
                expenseMapper.insertApprovalLine(line);
            }
            logger.debug("결재 라인 저장 완료");
        } else if (isSecretOrSalary) {
            logger.debug("급여 또는 비밀글 문서는 결재 라인이 생성되지 않습니다.");
        }

        // 생성된 문서 ID 반환
        logger.info("지출결의서 생성 완료 - expenseReportId: {}", newId);
        return newId;
    }

    /**
     * 4. 결재 라인 설정 (별도 설정용)
     * 설명: 이미 생성된 지출결의서에 결재 라인을 추가합니다.
     * ACCOUNTANT는 항상 맨 앞(stepOrder=1)에 배치됩니다.
     */
    @Transactional
    public void setApprovalLines(Long expenseReportId, List<ApprovalLineDto> approvalLines) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        if (approvalLines == null) {
            approvalLines = new ArrayList<>();
        }
        
        // ACCOUNTANT 포함 여부 확인
        boolean hasAccountant = false;
        for (ApprovalLineDto line : approvalLines) {
            UserDto user = userService.selectUserById(line.getApproverId());
            if (user != null && "ACCOUNTANT".equals(user.getRole())) {
                hasAccountant = true;
                break;
            }
        }
        
        // ACCOUNTANT가 없으면 추가
        if (!hasAccountant) {
            List<UserDto> accountants = userService.selectUsersByRole("ACCOUNTANT", companyId);
            if (!accountants.isEmpty()) {
                ApprovalLineDto accountantLine = new ApprovalLineDto();
                accountantLine.setApproverId(accountants.get(0).getUserId());
                accountantLine.setStatus("WAIT");
                approvalLines.add(0, accountantLine); // 맨 앞에 추가
            }
        }
        
        // ACCOUNTANT를 맨 앞에 배치하고 나머지는 원래 순서 유지
        List<ApprovalLineDto> sortedLines = new ArrayList<>();
        ApprovalLineDto accountantLine = null;
        
        // ACCOUNTANT 분리
        for (ApprovalLineDto line : approvalLines) {
            UserDto user = userService.selectUserById(line.getApproverId());
            if (user != null && "ACCOUNTANT".equals(user.getRole())) {
                accountantLine = line;
            } else {
                sortedLines.add(line);
            }
        }
        
        // ACCOUNTANT를 맨 앞에 배치
        if (accountantLine != null) {
            sortedLines.add(0, accountantLine);
        }
        
        // stepOrder 설정 및 저장
        if (!sortedLines.isEmpty()) {
            int stepOrder = 1;
            for (ApprovalLineDto line : sortedLines) {
                line.setExpenseReportId(expenseReportId);
                line.setStepOrder(stepOrder++);
                line.setStatus("WAIT");
                line.setCompanyId(companyId);
                expenseMapper.insertApprovalLine(line);
            }
        }
    }

    /**
     * 지출결의서 상태 변경
     * ACCOUNTANT 권한을 가진 사용자만 상태를 변경할 수 있습니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void updateExpenseStatus(Long expenseReportId, Long userId, String status) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 변경할 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }

        // 2. 권한 체크: ACCOUNTANT 권한자만 상태 변경 가능
        permissionUtil.checkAccountantPermission(userId);

        // 4. 유효한 상태 값인지 확인
        if (!"PAID".equals(status)) {
            throw new com.innersignature.backend.exception.BusinessException("유효하지 않은 상태 값입니다. PAID만 허용됩니다.");
        }

        // 5. 현재 상태가 APPROVED인 경우에만 PAID로 변경 가능
        if (!"APPROVED".equals(report.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("APPROVED 상태의 문서만 PAID로 변경할 수 있습니다.");
        }

        // 6. 상태 변경
        expenseMapper.updateExpenseReportStatus(expenseReportId, status, companyId);
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
        filterSalaryExpenses(list, userId);
        filterTaxProcessingInfo(list, userId);
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

        // 2. PAID 상태인지 확인
        if (!"PAID".equals(report.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("PAID 상태의 문서만 영수증을 첨부할 수 있습니다.");
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

        // 9. 파일 저장
        try {
            file.transferTo(filePath.toFile());
        } catch (IOException e) {
            throw new IOException("파일 저장 중 오류가 발생했습니다: " + filePath.toAbsolutePath() + " - " + e.getMessage(), e);
        }

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
            Boolean isSecret,
            Long userId) {
        
        if (!permissionUtil.isTaxAccountant(userId)) {
            throw new com.innersignature.backend.exception.BusinessException("TAX_ACCOUNTANT 역할만 접근 가능합니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectCategorySummary(startDate, endDate, statuses, taxProcessed, isSecret, companyId);
    }

    /**
     * 세무처리 완료 처리
     * TAX_ACCOUNTANT 권한을 가진 사용자만 처리할 수 있으며, PAID 상태의 문서만 처리 가능합니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void completeTaxProcessing(Long expenseReportId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 1. 변경할 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }

        // 2. 권한 체크: TAX_ACCOUNTANT 권한자만 처리 가능
        permissionUtil.checkTaxAccountantPermission(userId);

        // 3. 현재 상태가 PAID인 경우에만 세무처리 완료 가능
        if (!"PAID".equals(report.getStatus())) {
            throw new com.innersignature.backend.exception.BusinessException("PAID 상태의 문서만 세무처리 완료할 수 있습니다.");
        }

        // 4. 이미 세무처리 완료된 경우 체크
        if (Boolean.TRUE.equals(report.getTaxProcessed())) {
            throw new com.innersignature.backend.exception.BusinessException("이미 세무처리가 완료된 문서입니다.");
        }

        // 5. 세무처리 완료 처리
        expenseMapper.updateTaxProcessed(expenseReportId, true, LocalDateTime.now(), companyId);
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
     * 급여 카테고리 또는 비밀글 포함 문서에 대한 권한 체크
     * TAX_ACCOUNTANT는 모든 문서 조회 가능
     * CEO는 같은 회사의 모든 비밀글 조회 가능
     * ADMIN은 본인이 작성한 비밀글만 조회 가능
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
        
        // TAX_ACCOUNTANT는 모든 급여/비밀글 문서 조회 가능
        if ("TAX_ACCOUNTANT".equals(user.getRole())) {
            return;
        }
        
        // CEO는 같은 회사의 모든 문서 조회 가능 (필터링 없음)
        boolean isCEO = "CEO".equals(user.getRole());
        Long userCompanyId = user.getCompanyId();
        
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
            // 급여 문서에 isSecret 표시만 추가
            for (ExpenseReportDto report : reports) {
                List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
                boolean hasSalary = hasSalaryCategory(details);
                if (hasSalary) {
                    report.setIsSecret(true);
                }
            }
        } else {
            // 그 외의 경우 (ADMIN, USER), 본인이 작성한 급여/비밀글 문서만 조회 가능
            reports.removeIf(report -> {
                // 비밀글인지 확인
                Boolean isSecret = report.getIsSecret();
                boolean isSecretReport = isSecret != null && isSecret;
                
                // 급여 카테고리가 포함된 문서인지 확인 (메모리에서 조회 - 빠름)
                List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), Collections.emptyList());
                boolean hasSalary = hasSalaryCategory(details);
                
                // 급여인 경우 isSecret을 true로 설정
                if (hasSalary) {
                    report.setIsSecret(true);
                }
                
                // 비밀글이거나 급여 문서이고, 작성자가 아니면 제거
                return (isSecretReport || hasSalary) && !report.getDrafterId().equals(userId);
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
            Boolean isSecret,
            String drafterName,
            Long userId) {

        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (userId == null) {
            return expenseMapper.countExpenseListWithFilters(
                    startDate, endDate, minAmount, maxAmount,
                    statuses, category, taxProcessed, isSecret,
                    drafterName, companyId);
        }

        // 필터링된 전체 목록 조회 (페이지네이션 없이, 큰 수로 설정)
        List<ExpenseReportDto> allReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                minAmount, maxAmount,
                statuses, category, taxProcessed, isSecret,
                drafterName, companyId);

        // 권한 필터링 적용
        filterSalaryExpenses(allReports, userId);

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
     * 세무처리 대기 건 조회 (PAID 상태이지만 taxProcessed=false)
     */
    public List<ExpenseReportDto> getTaxPendingReports(LocalDate startDate, LocalDate endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectTaxPendingReports(startDate, endDate, companyId);
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
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 권한 체크: TAX_ACCOUNTANT 권한자만 처리 가능
        permissionUtil.checkTaxAccountantPermission(userId);

        for (Long expenseReportId : expenseReportIds) {
            ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
            if (report == null) {
                logger.warn("세무처리 일괄 완료: 문서를 찾을 수 없음 - expenseId: {}", expenseReportId);
                continue;
            }

            // PAID 상태이고 아직 세무처리 완료되지 않은 경우만 처리
            if ("PAID".equals(report.getStatus()) && 
                (report.getTaxProcessed() == null || !report.getTaxProcessed())) {
                expenseMapper.updateTaxProcessed(expenseReportId, true, LocalDateTime.now(), companyId);
                logger.info("세무처리 일괄 완료 처리 - expenseId: {}, userId: {}", expenseReportId, userId);
            }
        }
    }

    /**
     * 기간별 지출 데이터를 엑셀 파일로 생성
     * @param startDate 시작일 (optional)
     * @param endDate 종료일 (optional)
     * @param userId 현재 사용자 ID (권한 필터링용)
     * @return 생성된 엑셀 파일
     * @throws IOException 파일 생성 실패 시
     */
    public File exportExpensesToExcel(LocalDate startDate, LocalDate endDate, Long userId) throws IOException {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 기간별 지출결의서 목록 조회 (페이지네이션 없이 전체)
        List<ExpenseReportDto> expenseReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                null, null, null, null, null, null, null,
                companyId);
        
        // 권한 필터링 적용
        filterSalaryExpenses(expenseReports, userId);
        
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
                Row row = sheet.createRow(rowNum++);
                createDataRow(row, report, null, 0, dataStyle);
            } else {
                // 상세 내역이 있는 경우
                for (int i = 0; i < details.size(); i++) {
                    Row row = sheet.createRow(rowNum++);
                    createDataRow(row, report, details.get(i), i, dataStyle);
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
        
        logger.info("엑셀 파일 생성 완료 - 파일명: {}, 건수: {}", tempFile.getName(), expenseReports.size());
        
        return tempFile;
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
            Boolean isSecret,
            String drafterName,
            Long companyId) {
        
        // statuses가 null이거나 비어있으면 null로 설정
        if (statuses != null && statuses.isEmpty()) {
            statuses = null;
        }
        
        // 전체 개수 조회
        long totalElements = expenseMapper.countExpenseListForSuperAdmin(
                startDate, endDate, minAmount, maxAmount,
                statuses, category, taxProcessed, isSecret,
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
                statuses, category, taxProcessed, isSecret,
                drafterName, companyId);
        
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

        // (6) 급여 카테고리인 경우 isSecret을 true로 설정
        boolean hasSalary = hasSalaryCategory(details);
        if (hasSalary) {
            report.setIsSecret(true);
        }

        return report;
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
                null, null, null, null, null, null, null,
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
            cell.setCellValue(report.getTitle() != null ? report.getTitle() : "");
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
            
            // 제목
            Cell cell3 = row.createCell(colNum++);
            cell3.setCellValue(report.getTitle() != null ? report.getTitle() : "");
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
}