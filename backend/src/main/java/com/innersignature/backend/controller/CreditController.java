package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.CreditDto;
import com.innersignature.backend.service.CreditService;
import com.innersignature.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
@Tag(name = "크레딧 관리", description = "크레딧 조회 및 관리 API")
public class CreditController {
    
    private static final Logger logger = LoggerFactory.getLogger(CreditController.class);
    private final CreditService creditService;
    
    @Operation(summary = "크레딧 내역 조회", description = "현재 회사의 모든 크레딧 내역을 조회합니다.")
    @GetMapping
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CreditDto>>> getCredits() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null));
            }
            
            List<CreditDto> credits = creditService.findByCompanyId(companyId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", credits));
        } catch (Exception e) {
            logger.error("크레딧 내역 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "사용 가능한 크레딧 조회", description = "현재 회사의 사용 가능한 크레딧 목록을 조회합니다.")
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CreditDto>>> getAvailableCredits() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null));
            }
            
            List<CreditDto> credits = creditService.findAvailableByCompanyId(companyId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", credits));
        } catch (Exception e) {
            logger.error("사용 가능한 크레딧 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "총 사용 가능한 크레딧 금액 조회", description = "현재 회사의 총 사용 가능한 크레딧 금액을 조회합니다.")
    @GetMapping("/total")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTotalAvailableAmount() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null));
            }
            
            Integer totalAmount = creditService.getTotalAvailableAmount(companyId);
            Map<String, Object> result = new HashMap<>();
            result.put("totalAmount", totalAmount);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", result));
        } catch (Exception e) {
            logger.error("총 크레딧 금액 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

