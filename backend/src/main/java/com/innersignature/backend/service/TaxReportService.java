package com.innersignature.backend.service;

import com.innersignature.backend.dto.ExpenseDetailDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaxReportService {
    
    private static final Logger logger = LoggerFactory.getLogger(TaxReportService.class);
    private final ExpenseMapper expenseMapper;
    
    /**
     * 부가세 신고 서식 생성 (신용카드 매출전표 등 수취명세서)
     */
    public File exportTaxReportToExcel(LocalDate startDate, LocalDate endDate) throws IOException {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // PAID 상태이고 세무처리 완료된 문서만 조회
        List<String> statuses = List.of("PAID");
        List<ExpenseReportDto> expenseReports = expenseMapper.selectExpenseListWithFilters(
                0, Integer.MAX_VALUE,
                startDate, endDate,
                null, null, statuses, null, true, null, // taxProcessed = true, drafterName = null
                companyId, null, null); // paymentMethod = null, cardNumber = null
        
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
        Sheet sheet = workbook.createSheet("신용카드매출전표수취명세서");
        
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
        
        // 헤더 행 생성 (법정 서식에 맞춤)
        Row headerRow = sheet.createRow(0);
        String[] headers = {"결의서ID", "거래일자", "가맹점명", "사업자등록번호", "승인번호", "금액", "부가세액", "카테고리", "비고"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 데이터 행 생성
        int rowNum = 1;
        for (ExpenseReportDto report : expenseReports) {
            List<ExpenseDetailDto> details = detailsMap.getOrDefault(report.getExpenseReportId(), List.of());
            
            if (details.isEmpty()) {
                // 상세 내역이 없는 경우
                Row row = sheet.createRow(rowNum++);
                createTaxReportRow(row, report, null, dataStyle, numberStyle);
            } else {
                // 상세 내역이 있는 경우
                for (ExpenseDetailDto detail : details) {
                    Row row = sheet.createRow(rowNum++);
                    createTaxReportRow(row, report, detail, dataStyle, numberStyle);
                }
            }
        }
        
        // 열 너비 자동 조정
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            // 결의서ID 열은 좀 더 넓게 설정
            if (i == 0) {
                sheet.setColumnWidth(i, 3000); // 결의서ID는 넓게
            } else {
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }
        }
        
        // 임시 파일로 저장
        File tempFile = File.createTempFile("tax_report_", ".xlsx");
        try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
            workbook.write(outputStream);
        }
        workbook.close();
        
        logger.info("부가세 신고 서식 엑셀 파일 생성 완료 - 파일명: {}, 건수: {}", tempFile.getName(), expenseReports.size());
        
        return tempFile;
    }
    
    /**
     * 부가세 신고 서식 행 생성
     */
    private void createTaxReportRow(Row row, ExpenseReportDto report, ExpenseDetailDto detail,
                                    CellStyle dataStyle, CellStyle numberStyle) {
        int col = 0;

        // 결의서 ID
        Cell cell = row.createCell(col++);
        cell.setCellValue(report.getExpenseReportId().toString());
        cell.setCellStyle(dataStyle);

        // 거래일자
        cell = row.createCell(col++);
        if (report.getReportDate() != null) {
            cell.setCellValue(report.getReportDate().toString());
        } else {
            cell.setCellValue("");
        }
        cell.setCellStyle(dataStyle);
        
        // 가맹점명 (적요 또는 상세 항목의 첫 번째 description)
        cell = row.createCell(col++);
        String merchantName = "";
        if (detail != null && detail.getDescription() != null && !detail.getDescription().isEmpty()) {
            merchantName = detail.getDescription();
        } else if (detail != null && detail.getMerchantName() != null && !detail.getMerchantName().isEmpty()) {
            merchantName = detail.getMerchantName();
        }
        cell.setCellValue(merchantName);
        cell.setCellStyle(dataStyle);
        
        // 사업자등록번호 (없으면 빈 값)
        cell = row.createCell(col++);
        cell.setCellValue("");
        cell.setCellStyle(dataStyle);
        
        // 승인번호 (없으면 빈 값)
        cell = row.createCell(col++);
        cell.setCellValue("");
        cell.setCellStyle(dataStyle);
        
        // 금액
        cell = row.createCell(col++);
        Long amount = detail != null && detail.getAmount() != null ? detail.getAmount() : 
                     (report.getTotalAmount() != null ? report.getTotalAmount() : 0L);
        cell.setCellValue(amount.doubleValue());
        cell.setCellStyle(numberStyle);
        
        // 부가세액 (금액의 10%, 소수점 버림)
        cell = row.createCell(col++);
        long vatAmount = (long) (amount / 11.0); // 부가세 포함 금액에서 부가세 계산
        cell.setCellValue(vatAmount);
        cell.setCellStyle(numberStyle);
        
        // 카테고리
        cell = row.createCell(col++);
        String category = detail != null && detail.getCategory() != null ? detail.getCategory() : "";
        cell.setCellValue(category);
        cell.setCellStyle(dataStyle);
        
        // 비고
        cell = row.createCell(col++);
        String note = detail != null && detail.getNote() != null ? detail.getNote() : "";
        cell.setCellValue(note);
        cell.setCellStyle(dataStyle);
    }
}

