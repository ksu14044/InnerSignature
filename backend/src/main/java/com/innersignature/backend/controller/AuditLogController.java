package com.innersignature.backend.controller;

import com.innersignature.backend.dto.AuditLogDto;
import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.PagedResponse;
import com.innersignature.backend.service.AuditService;
import com.innersignature.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "감사 로그 관리", description = "감사 로그 조회 및 처리 API")
public class AuditLogController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditLogController.class);
    private final AuditService auditService;
    
    @Operation(summary = "감사 로그 목록 조회", description = "감사 로그 목록을 조회합니다. (ADMIN/CEO/ACCOUNTANT)")
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Boolean isResolved,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<AuditLogDto> logs = auditService.getAuditLogs(severity, isResolved, startDate, endDate, page, size);
            long totalElements = auditService.countAuditLogs(severity, isResolved, startDate, endDate);
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            PagedResponse<AuditLogDto> pagedResponse = new PagedResponse<>(logs, page, size, totalElements, totalPages);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", pagedResponse));
        } catch (Exception e) {
            logger.error("감사 로그 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "감사 로그 해결 처리", description = "감사 로그를 해결 처리합니다. (ADMIN/CEO/ACCOUNTANT)")
    @PostMapping("/resolve/{auditLogId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> resolveAuditLog(@PathVariable Long auditLogId) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            auditService.resolveAuditLog(auditLogId, userId);
            logger.info("감사 로그 해결 처리 완료 - auditLogId: {}, userId: {}", auditLogId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "감사 로그가 해결 처리되었습니다.", null));
        } catch (Exception e) {
            logger.error("감사 로그 해결 처리 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

