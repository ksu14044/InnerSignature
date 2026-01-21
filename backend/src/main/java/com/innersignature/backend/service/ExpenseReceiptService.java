package com.innersignature.backend.service;

import com.innersignature.backend.dto.ReceiptDto;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.ReceiptCompressor;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * 결의서 영수증 관리 서비스
 * 영수증 업로드, 조회, 삭제 기능 담당
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseReceiptService {

    private final ExpenseMapper expenseMapper;
    private final ExpenseReportService expenseReportService;

    private static final String RECEIPT_UPLOAD_DIR = "uploads/receipts/";

    /**
     * 영수증 업로드 (문서 단위 - 더 이상 사용 금지)
     */
    @Transactional
    public void uploadReceipt(Long expenseReportId, Long userId, MultipartFile file) throws IOException {
        // 도메인 정책: 이제는 모든 영수증이 상세 내역 단위로만 업로드되어야 한다.
        throw new RuntimeException("문서 단위 영수증 업로드는 더 이상 지원하지 않습니다. 상세 내역별 영수증 업로드를 사용하세요.");
    }

    /**
     * 상세 내역별 영수증 업로드
     */
    @Transactional
    public void uploadReceiptForDetail(Long expenseDetailId, Long expenseReportId, Long userId, MultipartFile file) throws IOException {
        // 결의서 접근 권한 검증
        expenseReportService.getExpenseDetail(expenseReportId, userId);

        // 파일 검증
        validateReceiptFile(file);

        // 파일을 PDF로 변환하고 압축하여 저장
        String originalFilename = file.getOriginalFilename();
        String fileName = generateUniqueFileName(originalFilename);
        // 확장자를 .pdf로 변경
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            fileName = fileName.substring(0, lastDotIndex) + ".pdf";
        } else {
            fileName = fileName + ".pdf";
        }
        String filePath = saveFile(file, fileName);

        // 데이터베이스 저장
        ReceiptDto receipt = new ReceiptDto();
        receipt.setExpenseReportId(expenseReportId);
        receipt.setExpenseDetailId(expenseDetailId);
        receipt.setOriginalFilename(originalFilename); // 원본 파일명 유지
        receipt.setFilePath(filePath);
        // 압축된 파일 크기 저장
        try {
            receipt.setFileSize(ReceiptCompressor.getCompressedSize(file));
        } catch (IOException e) {
            receipt.setFileSize(file.getSize()); // 실패 시 원본 크기
        }
        receipt.setUploadedBy(userId);

        Long companyId = SecurityUtil.getCurrentCompanyId();
        receipt.setCompanyId(companyId);
        expenseMapper.insertReceipt(receipt);
    }

    /**
     * 영수증 목록 조회 (문서 단위 - 기존 호환성 유지)
     */
    public List<ReceiptDto> getReceipts(Long expenseReportId, Long userId) {
        // 결의서 접근 권한 검증
        expenseReportService.getExpenseDetail(expenseReportId, userId);

        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectReceiptsByExpenseReportId(expenseReportId, companyId);
    }

    /**
     * 상세 내역별 영수증 목록 조회
     */
    public List<ReceiptDto> getReceiptsByDetail(Long expenseDetailId, Long expenseReportId, Long userId) {
        // 결의서 접근 권한 검증
        expenseReportService.getExpenseDetail(expenseReportId, userId);

        Long companyId = SecurityUtil.getCurrentCompanyId();
        return expenseMapper.selectReceiptsByExpenseDetailId(expenseDetailId, companyId);
    }

    /**
     * 영수증 상세 조회
     */
    public ReceiptDto getReceiptById(Long receiptId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        ReceiptDto receipt = expenseMapper.selectReceiptById(receiptId, companyId);
        if (receipt == null) {
            throw new RuntimeException("영수증을 찾을 수 없습니다.");
        }

        // 결의서 접근 권한 검증
        expenseReportService.getExpenseDetail(receipt.getExpenseReportId(), userId);

        return receipt;
    }

    /**
     * 영수증 삭제
     */
    @Transactional
    public void deleteReceipt(Long receiptId, Long userId) {
        ReceiptDto receipt = getReceiptById(receiptId, userId);

        // 파일 시스템에서 삭제
        try {
            Files.deleteIfExists(Paths.get(receipt.getFilePath()));
        } catch (IOException e) {
            // 파일 삭제 실패해도 데이터베이스에서는 삭제 진행
            System.err.println("영수증 파일 삭제 실패: " + e.getMessage());
        }

        // 데이터베이스에서 삭제
        Long companyId = SecurityUtil.getCurrentCompanyId();
        expenseMapper.deleteReceipt(receiptId, companyId);
    }

    /**
     * 영수증 파일 다운로드 (byte[] 반환)
     */
    public byte[] downloadReceipt(Long receiptId, Long userId) throws IOException {
        ReceiptDto receipt = getReceiptById(receiptId, userId);

        Path filePath = Paths.get(receipt.getFilePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("영수증 파일이 존재하지 않습니다.");
        }

        return Files.readAllBytes(filePath);
    }

    // ===== Private Helper Methods =====

    private void validateReceiptFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("파일이 없습니다.");
        }

        // 파일 크기 검증 (10MB 제한)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("파일 크기가 너무 큽니다. (최대 10MB)");
        }

        // 파일 타입 검증
        String contentType = file.getContentType();
        if (contentType == null ||
            (!contentType.startsWith("image/") &&
             !contentType.equals("application/pdf"))) {
            throw new RuntimeException("지원하지 않는 파일 형식입니다. (이미지 또는 PDF만 가능)");
        }

        // 파일명 검증
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new RuntimeException("파일명이 유효하지 않습니다.");
        }
    }

    private String generateUniqueFileName(String originalFileName) {
        String extension = getFileExtension(originalFileName);
        String uniqueId = UUID.randomUUID().toString();
        return uniqueId + (extension.isEmpty() ? "" : "." + extension);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    private String saveFile(MultipartFile file, String fileName) throws IOException {
        // 업로드 디렉토리 생성
        Path uploadDir = Paths.get(RECEIPT_UPLOAD_DIR);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 파일을 PDF로 변환하고 5MB 이하로 압축하여 저장
        byte[] compressedPdf = ReceiptCompressor.compressToPdf(file);
        Path filePath = uploadDir.resolve(fileName);
        Files.write(filePath, compressedPdf);

        return filePath.toString();
    }
}
