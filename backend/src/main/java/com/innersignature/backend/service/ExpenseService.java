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
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
        List<ExpenseReportDto> list = expenseMapper.selectExpenseList();
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
        List<ExpenseReportDto> allContent = expenseMapper.selectExpenseList();
        
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
            Long userId) {
        
        // statuses가 null이거나 비어있으면 null로 설정 (필터링 안 함)
        if (statuses != null && statuses.isEmpty()) {
            statuses = null;
        }
        
        // 필터링 조건 + 권한 필터링 후 실제 조회 가능한 전체 개수 계산
        long totalElements = calculateFilteredTotalElements(
                startDate, endDate, minAmount, maxAmount, statuses, category, taxProcessed, isSecret, userId);
        
        // 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // 필터링된 전체 데이터 조회 (페이지네이션 없이)
        List<ExpenseReportDto> allContent = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE, startDate, endDate, minAmount, maxAmount, statuses, category, taxProcessed, isSecret);
        
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
        
        // (1) 메인 문서 정보 가져오기
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId);
        
        // 만약 문서가 없으면 null 리턴 (혹은 에러 처리)
        if (report == null) {
            return null;
        }

        // (2) 상세 항목들(식대, 간식...) 가져오기
        List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetails(expenseReportId);
        
        // (2-1) 급여 카테고리 또는 비밀글 권한 체크
        if (userId != null) {
            boolean hasSalary = hasSalaryCategory(details);
            Boolean isSecret = report.getIsSecret();
            boolean isSecretOrSalary = hasSalary || (isSecret != null && isSecret);
            
            if (isSecretOrSalary) {
                UserDto user = userService.selectUserById(userId);
                boolean isTaxAccountant = user != null && "TAX_ACCOUNTANT".equals(user.getRole());
                boolean isOwner = report.getDrafterId().equals(userId);
                
                if (!isTaxAccountant && !isOwner) {
                    throw new com.innersignature.backend.exception.BusinessException("비밀 문서에 대한 조회 권한이 없습니다.");
                }
            }
        }
        
        // (3) 결재 라인(담당->전무->대표) 가져오기
        List<ApprovalLineDto> lines = expenseMapper.selectApprovalLines(expenseReportId);

        // (4) 영수증 목록 가져오기
        List<ReceiptDto> receipts = expenseMapper.selectReceiptsByExpenseReportId(expenseReportId);

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
        // 1. 해당 문서의 모든 결재 라인 조회
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseId);

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
        expenseMapper.updateApprovalLine(lineDto);

        // 5. 승인 처리 후 최신 결재 라인 상태 조회
        List<ApprovalLineDto> updatedApprovalLines = expenseMapper.selectApprovalLines(expenseId);

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
            expenseMapper.updateExpenseReportStatus(expenseId, "APPROVED");
        }
    }

    /**
     * 결제 반려 처리
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void rejectExpense(Long expenseId, Long approverId, String rejectionReason) {
        // 1. 해당 문서의 모든 결재 라인 조회
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseId);

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
        expenseMapper.rejectApprovalLine(lineDto);

        // 4. 문서 상태를 REJECTED로 변경
        expenseMapper.updateExpenseReportStatus(expenseId, "REJECTED");
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

        // (0-4) 급여 카테고리는 ADMIN 또는 ACCOUNTANT만 사용 가능
        if (hasSalary && !permissionUtil.isAdmin(currentUserId) && !permissionUtil.isAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("급여 카테고리는 ADMIN 또는 ACCOUNTANT 권한만 사용할 수 있습니다.");
        }

        // (0-4-1) 급여 카테고리인 경우 자동으로 비밀글 설정
        Boolean isSecret = request.getIsSecret();
        if (hasSalary) {
            request.setIsSecret(true);
            isSecret = true;
        }

        // (0-4-2) 비밀글은 ADMIN 또는 ACCOUNTANT만 사용 가능
        if (isSecret != null && isSecret && !permissionUtil.isAdmin(currentUserId) && !permissionUtil.isAccountant(currentUserId)) {
            throw new com.innersignature.backend.exception.BusinessException("비밀글은 ADMIN 또는 ACCOUNTANT 권한만 사용할 수 있습니다.");
        }

        // (0-5) 급여이거나 비밀글인 경우 상태를 바로 PAID로 설정 (결재 없이 바로 지급완료)
        if (hasSalary || (isSecret != null && isSecret)) {
            request.setStatus("PAID");
        }

        // (1) 메인 문서(제목, 작성자 등) 먼저 저장
        // 이 과정이 끝나야 문서 번호(ID)가 생성됩니다.
        expenseMapper.insertExpenseReport(request);

        // 방금 DB에 들어가면서 생성된 문서 번호(PK)를 꺼내옵니다.
        Long newId = request.getExpenseReportId();

        // (2) 상세 항목들(식대, 교통비 등) 저장
        // 리스트로 들어왔으니 반복문(for)을 돌면서 하나씩 저장합니다.
        if (details != null) {
            logger.debug("상세 항목 저장 시작 - 항목 수: {}", details.size());
            for (ExpenseDetailDto detail : details) {
                detail.setExpenseReportId(newId); // "이 항목은 방금 만든 그 문서(newId) 꺼야"라고 연결
                expenseMapper.insertExpenseDetail(detail);
            }
            logger.debug("상세 항목 저장 완료");
        }

        // (3) 결재 라인(누가 승인해야 하는지) 저장
        // 급여이거나 비밀글이 아닌 경우에만 결재 라인 생성
        List<ApprovalLineDto> lines = request.getApprovalLines();
        boolean isSecretOrSalary = hasSalary || (isSecret != null && isSecret);

        if (!isSecretOrSalary) {
            // 결제담당자(ACCOUNTANT) 반드시 포함 확인 및 추가
            boolean hasAccountant = false;
            if (lines != null) {
                for (ApprovalLineDto line : lines) {
                    UserDto user = userService.selectUserById(line.getApproverId());
                    if (user != null && "ACCOUNTANT".equals(user.getRole())) {
                        hasAccountant = true;
                        break;
                    }
                }
            }

            // 결제담당자가 없으면 ACCOUNTANT 역할의 첫 번째 사용자 추가
            if (!hasAccountant) {
                List<UserDto> accountants = userService.selectUsersByRole("ACCOUNTANT");
                if (!accountants.isEmpty()) {
                    ApprovalLineDto accountantLine = new ApprovalLineDto();
                    accountantLine.setApproverId(accountants.get(0).getUserId());
                    accountantLine.setStepOrder(lines != null ? lines.size() + 1 : 1);
                    accountantLine.setStatus("WAIT");
                    if (lines == null) {
                        lines = new ArrayList<>();
                    }
                    lines.add(accountantLine);
                }
            }

            if (lines != null) {
                logger.debug("결재 라인 저장 시작 - 라인 수: {}", lines.size());
                for (ApprovalLineDto line : lines) {
                    line.setExpenseReportId(newId); // "이 결재 라인도 그 문서(newId) 꺼야"라고 연결
                    expenseMapper.insertApprovalLine(line);
                }
                logger.debug("결재 라인 저장 완료");
            }
        } else {
            logger.debug("급여 또는 비밀글 문서는 결재 라인이 생성되지 않습니다.");
        }

        // 생성된 문서 ID 반환
        logger.info("지출결의서 생성 완료 - expenseReportId: {}", newId);
        return newId;
    }

    /**
     * 4. 결재 라인 설정 (별도 설정용)
     * 설명: 이미 생성된 지출결의서에 결재 라인을 추가합니다.
     */
    @Transactional
    public void setApprovalLines(Long expenseReportId, List<ApprovalLineDto> approvalLines) {
        if (approvalLines != null && !approvalLines.isEmpty()) {
            int stepOrder = 1;
            for (ApprovalLineDto line : approvalLines) {
                line.setExpenseReportId(expenseReportId);
                line.setStepOrder(stepOrder++);
                line.setStatus("WAIT"); // 상태가 설정되지 않은 경우 기본값 설정
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
        // 1. 변경할 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId);
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
        expenseMapper.updateExpenseReportStatus(expenseReportId, status);
    }

    /**
     * 지출결의서 삭제
     * 작성자 본인, ADMIN 권한, 또는 ACCOUNTANT 권한을 가진 사용자만 삭제 가능
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteExpense(Long expenseReportId, Long userId) {
        // 1. 삭제할 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId);
        if (report == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 문서를 찾을 수 없습니다.");
        }

        // 2. 권한 체크: 작성자 본인, ADMIN, 또는 ACCOUNTANT 권한자만 삭제 가능
        permissionUtil.checkDeletePermission(report, userId);

        // 3. 문서 삭제 (CASCADE DELETE로 관련 데이터도 함께 삭제됨)
        expenseMapper.deleteExpenseReport(expenseReportId);
    }

    /**
     * 미서명 건 조회
     * 현재 사용자가 서명해야 할 미완료 건 목록을 반환합니다.
     * 권한에 따라 세무처리 정보 필터링
     * 급여 문서 권한 필터링
     */
    public List<ExpenseReportDto> getPendingApprovals(Long userId) {
        List<ExpenseReportDto> list = expenseMapper.selectPendingApprovalsByUserId(userId);
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
        // 1. 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId);
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
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId);
        if (report == null) {
            throw new com.innersignature.backend.exception.BusinessException("해당 문서를 찾을 수 없습니다.");
        }

        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(expenseReportId);
        if (!hasReceiptViewAccess(report, approvalLines, userId)) {
            throw new com.innersignature.backend.exception.BusinessException("영수증 조회 권한이 없습니다.");
        }

        return expenseMapper.selectReceiptsByExpenseReportId(expenseReportId);
    }

    /**
     * 영수증 단건 조회
     */
    public ReceiptDto getReceiptById(Long receiptId, Long userId) {
        ReceiptDto receipt = expenseMapper.selectReceiptById(receiptId);
        if (receipt == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 영수증을 찾을 수 없습니다.");
        }

        ExpenseReportDto report = expenseMapper.selectExpenseReportById(receipt.getExpenseReportId());
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }

        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(report.getExpenseReportId());
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
        // 1. 영수증 정보 및 권한 검증
        ReceiptDto receipt = getReceiptById(receiptId, userId);

        // 2. 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(receipt.getExpenseReportId());
        if (report == null) {
            throw new com.innersignature.backend.exception.ResourceNotFoundException("해당 문서를 찾을 수 없습니다.");
        }

        // 3. 권한 체크: 작성자, ACCOUNTANT, ADMIN, 결재 라인 포함자
        List<ApprovalLineDto> approvalLines = expenseMapper.selectApprovalLines(report.getExpenseReportId());
        if (!hasReceiptAccess(report, approvalLines, userId)) {
            throw new com.innersignature.backend.exception.BusinessException("영수증 삭제 권한이 없습니다.");
        }

        // 5-1. 물리적 파일 경로 가져오기
        String filePath = receipt.getFilePath();
        
        // 5-2. DB 레코드 삭제
        expenseMapper.deleteReceipt(receiptId);
        
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
        if (permissionUtil.isAccountant(userId) || permissionUtil.isAdmin(userId)) {
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
        
        return expenseMapper.selectCategorySummary(startDate, endDate, statuses, taxProcessed, isSecret);
    }

    /**
     * 세무처리 완료 처리
     * TAX_ACCOUNTANT 권한을 가진 사용자만 처리할 수 있으며, PAID 상태의 문서만 처리 가능합니다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void completeTaxProcessing(Long expenseReportId, Long userId) {
        // 1. 변경할 문서 정보 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId);
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
        expenseMapper.updateTaxProcessed(expenseReportId, true, LocalDateTime.now());
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
     * TAX_ACCOUNTANT 또는 작성자만 조회 가능
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
        
        // 그 외의 경우, 본인이 작성한 급여/비밀글 문서만 조회 가능
        reports.removeIf(report -> {
            // 비밀글인지 확인
            Boolean isSecret = report.getIsSecret();
            boolean isSecretReport = isSecret != null && isSecret;
            
            // 급여 카테고리가 포함된 문서인지 확인
            List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetails(report.getExpenseReportId());
            boolean hasSalary = hasSalaryCategory(details);
            
            // 급여인 경우 isSecret을 true로 설정
            if (hasSalary) {
                report.setIsSecret(true);
            }
            
            // 비밀글이거나 급여 문서이고, 작성자가 아니면 제거
            return (isSecretReport || hasSalary) && !report.getDrafterId().equals(userId);
        });
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
        if (userId == null) {
            return expenseMapper.countExpenseList();
        }
        
        // 전체 목록 조회 (페이지네이션 없이)
        List<ExpenseReportDto> allReports = expenseMapper.selectExpenseList();
        
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
            Long userId) {
        
        if (userId == null) {
            return expenseMapper.countExpenseListWithFilters(
                    startDate, endDate, minAmount, maxAmount, statuses, category, taxProcessed, isSecret);
        }
        
        // 필터링된 전체 목록 조회 (페이지네이션 없이, 큰 수로 설정)
        List<ExpenseReportDto> allReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE, startDate, endDate, minAmount, maxAmount, statuses, category, taxProcessed, isSecret);
        
        // 권한 필터링 적용
        filterSalaryExpenses(allReports, userId);
        
        return allReports.size();
    }

    /**
     * 대시보드 전체 요약 통계 조회
     */
    public DashboardStatsDto getDashboardStats(LocalDate startDate, LocalDate endDate) {
        return expenseMapper.selectDashboardStats(startDate, endDate);
    }

    /**
     * 월별 지출 추이 조회
     */
    public List<MonthlyTrendDto> getMonthlyTrend(LocalDate startDate, LocalDate endDate) {
        return expenseMapper.selectMonthlyTrend(startDate, endDate);
    }

    /**
     * 상태별 통계 조회
     */
    public List<StatusStatsDto> getStatusStats(LocalDate startDate, LocalDate endDate) {
        return expenseMapper.selectStatusStats(startDate, endDate);
    }

    /**
     * 카테고리별 비율 조회 (비율 계산 포함)
     */
    public List<CategoryRatioDto> getCategoryRatio(LocalDate startDate, LocalDate endDate) {
        List<CategoryRatioDto> ratios = expenseMapper.selectCategoryRatio(startDate, endDate);
        
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
        return expenseMapper.selectTaxPendingReports(startDate, endDate);
    }

    /**
     * 세무처리 현황 통계 조회
     */
    public TaxStatusDto getTaxStatus(LocalDate startDate, LocalDate endDate) {
        return expenseMapper.selectTaxStatus(startDate, endDate);
    }

    /**
     * 월별 세무처리 집계 조회
     */
    public List<MonthlyTaxSummaryDto> getMonthlyTaxSummary(LocalDate startDate, LocalDate endDate) {
        return expenseMapper.selectMonthlyTaxSummary(startDate, endDate);
    }

    /**
     * 세무처리 일괄 완료 처리
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void batchCompleteTaxProcessing(List<Long> expenseReportIds, Long userId) {
        // 권한 체크: TAX_ACCOUNTANT 권한자만 처리 가능
        permissionUtil.checkTaxAccountantPermission(userId);

        for (Long expenseReportId : expenseReportIds) {
            ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId);
            if (report == null) {
                logger.warn("세무처리 일괄 완료: 문서를 찾을 수 없음 - expenseId: {}", expenseReportId);
                continue;
            }

            // PAID 상태이고 아직 세무처리 완료되지 않은 경우만 처리
            if ("PAID".equals(report.getStatus()) && 
                (report.getTaxProcessed() == null || !report.getTaxProcessed())) {
                expenseMapper.updateTaxProcessed(expenseReportId, true, LocalDateTime.now());
                logger.info("세무처리 일괄 완료 처리 - expenseId: {}, userId: {}", expenseReportId, userId);
            }
        }
    }
}