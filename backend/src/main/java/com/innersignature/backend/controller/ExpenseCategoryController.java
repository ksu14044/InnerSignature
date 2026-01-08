package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.ExpenseCategoryDto;
import com.innersignature.backend.service.ExpenseCategoryService;
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

@Tag(name = "지출 항목 관리", description = "지출 항목(category) 설정 및 조회 API")
@RestController
@RequestMapping("/api/expense-categories")
@RequiredArgsConstructor
public class ExpenseCategoryController {
    
    private static final Logger logger = LoggerFactory.getLogger(ExpenseCategoryController.class);
    private final ExpenseCategoryService expenseCategoryService;
    
    @Operation(summary = "전역 항목 목록 조회", description = "전역 기본값 항목 목록을 조회합니다. (SUPERADMIN)")
    @GetMapping("/global")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<ExpenseCategoryDto>>> getGlobalCategories() {
        try {
            List<ExpenseCategoryDto> categories = expenseCategoryService.getGlobalCategories();
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", categories));
        } catch (Exception e) {
            logger.error("전역 항목 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "회사별 항목 목록 조회", description = "회사별 항목 목록을 조회합니다.")
    @GetMapping("/company")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT', 'TAX_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<ExpenseCategoryDto>>> getCompanyCategories() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            List<ExpenseCategoryDto> categories = expenseCategoryService.getCompanyCategories(companyId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", categories));
        } catch (Exception e) {
            logger.error("회사별 항목 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "병합된 항목 목록 조회", description = "전역 기본값 + 회사별 오버라이드 병합 항목 목록을 조회합니다.")
    @GetMapping("/merged")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'CEO', 'ACCOUNTANT', 'TAX_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<ExpenseCategoryDto>>> getMergedCategories() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            List<ExpenseCategoryDto> categories = expenseCategoryService.getMergedCategories(companyId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", categories));
        } catch (Exception e) {
            logger.error("병합된 항목 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "항목 생성", description = "새로운 항목을 생성합니다. (SUPERADMIN: 전역, ACCOUNTANT/ADMIN/CEO/TAX_ACCOUNTANT: 회사별)")
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'CEO', 'ACCOUNTANT', 'TAX_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<ExpenseCategoryDto>> createCategory(
            @RequestBody ExpenseCategoryDto category) {
        try {
            ExpenseCategoryDto created = expenseCategoryService.createCategory(category);
            logger.info("항목 생성 완료 - categoryId: {}", created.getCategoryId());
            return ResponseEntity.ok(new ApiResponse<>(true, "항목이 생성되었습니다.", created));
        } catch (Exception e) {
            logger.error("항목 생성 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "항목 수정", description = "기존 항목을 수정합니다.")
    @PutMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'CEO', 'ACCOUNTANT', 'TAX_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<ExpenseCategoryDto>> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody ExpenseCategoryDto category) {
        try {
            category.setCategoryId(categoryId);
            ExpenseCategoryDto updated = expenseCategoryService.updateCategory(category);
            logger.info("항목 수정 완료 - categoryId: {}", categoryId);
            return ResponseEntity.ok(new ApiResponse<>(true, "항목이 수정되었습니다.", updated));
        } catch (Exception e) {
            logger.error("항목 수정 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "항목 삭제", description = "항목을 삭제(비활성화)합니다.")
    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'CEO', 'ACCOUNTANT', 'TAX_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long categoryId) {
        try {
            expenseCategoryService.deleteCategory(categoryId);
            logger.info("항목 삭제 완료 - categoryId: {}", categoryId);
            return ResponseEntity.ok(new ApiResponse<>(true, "항목이 삭제되었습니다.", null));
        } catch (Exception e) {
            logger.error("항목 삭제 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "항목 순서 변경", description = "항목의 표시 순서를 변경합니다.")
    @PutMapping("/{categoryId}/order")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'CEO', 'ACCOUNTANT', 'TAX_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> updateDisplayOrder(
            @PathVariable Long categoryId,
            @RequestParam Integer displayOrder) {
        try {
            expenseCategoryService.updateDisplayOrder(categoryId, displayOrder);
            logger.info("항목 순서 변경 완료 - categoryId: {}, displayOrder: {}", categoryId, displayOrder);
            return ResponseEntity.ok(new ApiResponse<>(true, "항목 순서가 변경되었습니다.", null));
        } catch (Exception e) {
            logger.error("항목 순서 변경 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "항목 순서 일괄 변경", description = "드래그 앤 드롭으로 항목 순서를 일괄 변경합니다.")
    @PutMapping("/reorder")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'CEO', 'ACCOUNTANT', 'TAX_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> reorderCategories(
            @RequestBody List<Long> categoryIds) {
        try {
            expenseCategoryService.reorderCategories(categoryIds);
            logger.info("항목 순서 일괄 변경 완료 - 항목 수: {}", categoryIds.size());
            return ResponseEntity.ok(new ApiResponse<>(true, "항목 순서가 변경되었습니다.", null));
        } catch (Exception e) {
            logger.error("항목 순서 일괄 변경 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}


