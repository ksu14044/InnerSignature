package com.innersignature.backend.controller;

import com.innersignature.backend.dto.MonthlyClosingDto;
import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.service.MonthlyClosingService;
import com.innersignature.backend.util.SecurityUtil;
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
@RequestMapping("/api/monthly-closing")
@RequiredArgsConstructor
@Tag(name = "월 마감 관리", description = "월 마감 처리 및 조회 API")
public class MonthlyClosingController {
    
    private static final Logger logger = LoggerFactory.getLogger(MonthlyClosingController.class);
    private final MonthlyClosingService monthlyClosingService;
    
    @Operation(summary = "월 마감 처리", description = "특정 월을 마감 처리합니다. (ADMIN/CEO)")
    @PostMapping("/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<MonthlyClosingDto>> closeMonth(@RequestBody Map<String, Integer> request) {
        try {
            Integer year = request.get("year");
            Integer month = request.get("month");
            Long userId = SecurityUtil.getCurrentUserId();
            
            MonthlyClosingDto closing = monthlyClosingService.closeMonth(year, month, userId);
            logger.info("월 마감 처리 완료 - year: {}, month: {}, userId: {}", year, month, userId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "월 마감이 완료되었습니다.", closing));
        } catch (Exception e) {
            logger.error("월 마감 처리 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "월 마감 해제", description = "마감된 월을 해제합니다. (ADMIN/CEO)")
    @PostMapping("/reopen/{closingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<Void>> reopenMonth(@PathVariable Long closingId) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            monthlyClosingService.reopenMonth(closingId, userId);
            logger.info("월 마감 해제 완료 - closingId: {}, userId: {}", closingId, userId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "월 마감이 해제되었습니다.", null));
        } catch (Exception e) {
            logger.error("월 마감 해제 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "마감 목록 조회", description = "회사별 마감 목록을 조회합니다. (ADMIN/CEO/ACCOUNTANT)")
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<MonthlyClosingDto>>> getClosingList() {
        try {
            List<MonthlyClosingDto> closingList = monthlyClosingService.getClosingList();
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", closingList));
        } catch (Exception e) {
            logger.error("마감 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "월 마감 여부 확인", description = "특정 월이 마감되었는지 확인합니다.")
    @GetMapping("/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT', 'USER')")
    public ResponseEntity<ApiResponse<Boolean>> checkMonthClosed(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        try {
            boolean isClosed = monthlyClosingService.isMonthClosed(year, month);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", isClosed));
        } catch (Exception e) {
            logger.error("월 마감 여부 확인 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

