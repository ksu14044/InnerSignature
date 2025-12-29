package com.innersignature.backend.controller;

import com.innersignature.backend.dto.AuditRuleDto;
import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.service.AuditRuleService;
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
@RequestMapping("/api/audit-rules")
@RequiredArgsConstructor
@Tag(name = "감사 규칙 관리", description = "감사 규칙 설정 및 조회 API")
public class AuditRuleController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditRuleController.class);
    private final AuditRuleService auditRuleService;
    
    @Operation(summary = "감사 규칙 생성", description = "새로운 감사 규칙을 생성합니다. (ADMIN/CEO)")
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<AuditRuleDto>> createRule(@RequestBody AuditRuleDto rule) {
        try {
            AuditRuleDto created = auditRuleService.createRule(rule);
            logger.info("감사 규칙 생성 완료 - ruleId: {}", created.getRuleId());
            return ResponseEntity.ok(new ApiResponse<>(true, "감사 규칙이 생성되었습니다.", created));
        } catch (Exception e) {
            logger.error("감사 규칙 생성 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "감사 규칙 수정", description = "기존 감사 규칙을 수정합니다. (ADMIN/CEO)")
    @PutMapping("/{ruleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<AuditRuleDto>> updateRule(
            @PathVariable Long ruleId,
            @RequestBody AuditRuleDto rule) {
        try {
            AuditRuleDto updated = auditRuleService.updateRule(ruleId, rule);
            logger.info("감사 규칙 수정 완료 - ruleId: {}", ruleId);
            return ResponseEntity.ok(new ApiResponse<>(true, "감사 규칙이 수정되었습니다.", updated));
        } catch (Exception e) {
            logger.error("감사 규칙 수정 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "감사 규칙 삭제", description = "감사 규칙을 삭제합니다. (ADMIN/CEO)")
    @DeleteMapping("/{ruleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long ruleId) {
        try {
            auditRuleService.deleteRule(ruleId);
            logger.info("감사 규칙 삭제 완료 - ruleId: {}", ruleId);
            return ResponseEntity.ok(new ApiResponse<>(true, "감사 규칙이 삭제되었습니다.", null));
        } catch (Exception e) {
            logger.error("감사 규칙 삭제 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "감사 규칙 목록 조회", description = "감사 규칙 목록을 조회합니다. (ADMIN/CEO/ACCOUNTANT)")
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<AuditRuleDto>>> getRuleList() {
        try {
            List<AuditRuleDto> ruleList = auditRuleService.getRuleList();
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", ruleList));
        } catch (Exception e) {
            logger.error("감사 규칙 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

