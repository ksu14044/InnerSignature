package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.service.MissingReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missing-receipts")
@RequiredArgsConstructor
@Tag(name = "증빙 누락 관리", description = "증빙 누락 건 조회 및 알림 API")
public class MissingReceiptController {
    
    private static final Logger logger = LoggerFactory.getLogger(MissingReceiptController.class);
    private final MissingReceiptService missingReceiptService;
    
    @Operation(summary = "증빙 누락 건 조회", description = "일정 기간 내에 결의서가 작성되지 않은 건을 조회합니다. (ACCOUNTANT)")
    @GetMapping("/list")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<ExpenseReportDto>>> getMissingReceipts(
            @RequestParam(defaultValue = "3") int days) {
        try {
            List<ExpenseReportDto> missingReceipts = missingReceiptService.getMissingReceipts(days);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", missingReceipts));
        } catch (Exception e) {
            logger.error("증빙 누락 건 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "사용자별 증빙 누락 건 조회", description = "사용자별로 그룹화된 증빙 누락 건을 조회합니다. (ACCOUNTANT)")
    @GetMapping("/by-user")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Map<Long, List<ExpenseReportDto>>>> getMissingReceiptsByUser(
            @RequestParam(defaultValue = "3") int days) {
        try {
            Map<Long, List<ExpenseReportDto>> result = missingReceiptService.getMissingReceiptsByUser(days);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", result));
        } catch (Exception e) {
            logger.error("사용자별 증빙 누락 건 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

