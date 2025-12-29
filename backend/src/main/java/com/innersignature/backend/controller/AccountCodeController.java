package com.innersignature.backend.controller;

import com.innersignature.backend.dto.AccountCodeMappingDto;
import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.service.AccountCodeService;
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
@RequestMapping("/api/account-codes")
@RequiredArgsConstructor
@Tag(name = "계정 과목 관리", description = "계정 과목 매핑 설정 및 조회 API")
public class AccountCodeController {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountCodeController.class);
    private final AccountCodeService accountCodeService;
    
    @Operation(summary = "계정 과목 매핑 생성", description = "새로운 계정 과목 매핑을 생성합니다. (ADMIN/CEO)")
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<AccountCodeMappingDto>> createMapping(@RequestBody AccountCodeMappingDto mapping) {
        try {
            AccountCodeMappingDto created = accountCodeService.createMapping(mapping);
            logger.info("계정 과목 매핑 생성 완료 - mappingId: {}", created.getMappingId());
            return ResponseEntity.ok(new ApiResponse<>(true, "계정 과목 매핑이 생성되었습니다.", created));
        } catch (Exception e) {
            logger.error("계정 과목 매핑 생성 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "계정 과목 매핑 수정", description = "기존 계정 과목 매핑을 수정합니다. (ADMIN/CEO)")
    @PutMapping("/{mappingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<AccountCodeMappingDto>> updateMapping(
            @PathVariable Long mappingId,
            @RequestBody AccountCodeMappingDto mapping) {
        try {
            AccountCodeMappingDto updated = accountCodeService.updateMapping(mappingId, mapping);
            logger.info("계정 과목 매핑 수정 완료 - mappingId: {}", mappingId);
            return ResponseEntity.ok(new ApiResponse<>(true, "계정 과목 매핑이 수정되었습니다.", updated));
        } catch (Exception e) {
            logger.error("계정 과목 매핑 수정 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "계정 과목 매핑 삭제", description = "계정 과목 매핑을 삭제합니다. (ADMIN/CEO)")
    @DeleteMapping("/{mappingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    public ResponseEntity<ApiResponse<Void>> deleteMapping(@PathVariable Long mappingId) {
        try {
            accountCodeService.deleteMapping(mappingId);
            logger.info("계정 과목 매핑 삭제 완료 - mappingId: {}", mappingId);
            return ResponseEntity.ok(new ApiResponse<>(true, "계정 과목 매핑이 삭제되었습니다.", null));
        } catch (Exception e) {
            logger.error("계정 과목 매핑 삭제 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "계정 과목 매핑 목록 조회", description = "계정 과목 매핑 목록을 조회합니다. (ADMIN/CEO/ACCOUNTANT)")
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<AccountCodeMappingDto>>> getMappingList() {
        try {
            List<AccountCodeMappingDto> mappingList = accountCodeService.getMappingList();
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", mappingList));
        } catch (Exception e) {
            logger.error("계정 과목 매핑 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "계정 과목 추천", description = "카테고리와 가맹점명으로 계정 과목을 추천합니다.")
    @GetMapping("/recommend")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'ACCOUNTANT', 'USER')")
    public ResponseEntity<ApiResponse<AccountCodeMappingDto>> recommendAccountCode(
            @RequestParam String category,
            @RequestParam(required = false) String merchantName) {
        try {
            AccountCodeMappingDto recommendation = accountCodeService.recommendAccountCode(category, merchantName);
            return ResponseEntity.ok(new ApiResponse<>(true, "추천 성공", recommendation));
        } catch (Exception e) {
            logger.error("계정 과목 추천 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

