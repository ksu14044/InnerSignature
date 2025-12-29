package com.innersignature.backend.controller;

import com.innersignature.backend.dto.BudgetDto;
import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
@Tag(name = "예산 관리", description = "예산 설정 및 조회 API")
public class BudgetController {
    
    private static final Logger logger = LoggerFactory.getLogger(BudgetController.class);
    private final BudgetService budgetService;
    
    @Operation(summary = "예산 생성", description = "새로운 예산을 생성합니다. (ADMIN/CEO)")
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<BudgetDto>> createBudget(@RequestBody BudgetDto budget) {
        try {
            BudgetDto created = budgetService.createBudget(budget);
            logger.info("예산 생성 완료 - budgetId: {}", created.getBudgetId());
            return ResponseEntity.ok(new ApiResponse<>(true, "예산이 생성되었습니다.", created));
        } catch (Exception e) {
            logger.error("예산 생성 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "예산 수정", description = "기존 예산을 수정합니다. (ADMIN/CEO)")
    @PutMapping("/{budgetId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<BudgetDto>> updateBudget(
            @PathVariable Long budgetId,
            @RequestBody BudgetDto budget) {
        try {
            BudgetDto updated = budgetService.updateBudget(budgetId, budget);
            logger.info("예산 수정 완료 - budgetId: {}", budgetId);
            return ResponseEntity.ok(new ApiResponse<>(true, "예산이 수정되었습니다.", updated));
        } catch (Exception e) {
            logger.error("예산 수정 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "예산 삭제", description = "예산을 삭제합니다. (ADMIN/CEO)")
    @DeleteMapping("/{budgetId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable Long budgetId) {
        try {
            budgetService.deleteBudget(budgetId);
            logger.info("예산 삭제 완료 - budgetId: {}", budgetId);
            return ResponseEntity.ok(new ApiResponse<>(true, "예산이 삭제되었습니다.", null));
        } catch (Exception e) {
            logger.error("예산 삭제 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "예산 목록 조회", description = "예산 목록을 조회합니다. (ADMIN/CEO/ACCOUNTANT)")
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getBudgetList(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            List<BudgetDto> budgetList = budgetService.getBudgetList(year, month);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", budgetList));
        } catch (Exception e) {
            logger.error("예산 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

