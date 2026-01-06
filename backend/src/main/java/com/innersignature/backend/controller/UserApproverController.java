package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.UserApproverMappingDto;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.service.UserApproverService;
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

@Tag(name = "담당 결재자 관리", description = "사용자별 담당 결재자 설정 및 조회 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserApproverController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserApproverController.class);
    private final UserApproverService userApproverService;
    
    @Operation(summary = "담당 결재자 목록 조회", description = "특정 사용자의 담당 결재자 목록을 조회합니다.")
    @GetMapping("/{userId}/approvers")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<UserApproverMappingDto>>> getApprovers(
            @PathVariable Long userId) {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            List<UserApproverMappingDto> approvers = userApproverService.getApproversByUserId(userId, companyId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", approvers));
        } catch (Exception e) {
            logger.error("담당 결재자 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "활성화된 담당 결재자 목록 조회", description = "특정 사용자의 활성화된 담당 결재자 목록을 조회합니다.")
    @GetMapping("/{userId}/approvers/active")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getActiveApprovers(
            @PathVariable Long userId) {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            List<UserDto> approvers = userApproverService.getActiveApproversByUserId(userId, companyId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", approvers));
        } catch (Exception e) {
            logger.error("활성화된 담당 결재자 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "담당 결재자 추가", description = "사용자에게 담당 결재자를 추가합니다.")
    @PostMapping("/{userId}/approvers")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<UserApproverMappingDto>> createMapping(
            @PathVariable Long userId,
            @RequestBody UserApproverMappingDto mapping) {
        try {
            mapping.setUserId(userId);
            UserApproverMappingDto created = userApproverService.createMapping(mapping);
            logger.info("담당 결재자 추가 완료 - userId: {}, approverId: {}", userId, mapping.getApproverId());
            return ResponseEntity.ok(new ApiResponse<>(true, "담당 결재자가 추가되었습니다.", created));
        } catch (Exception e) {
            logger.error("담당 결재자 추가 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "담당 결재자 수정", description = "담당 결재자 매핑을 수정합니다.")
    @PutMapping("/{userId}/approvers/{mappingId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<UserApproverMappingDto>> updateMapping(
            @PathVariable Long userId,
            @PathVariable Long mappingId,
            @RequestBody UserApproverMappingDto mapping) {
        try {
            mapping.setUserId(userId);
            mapping.setMappingId(mappingId);
            UserApproverMappingDto updated = userApproverService.updateMapping(mapping);
            logger.info("담당 결재자 수정 완료 - mappingId: {}", mappingId);
            return ResponseEntity.ok(new ApiResponse<>(true, "담당 결재자가 수정되었습니다.", updated));
        } catch (Exception e) {
            logger.error("담당 결재자 수정 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "담당 결재자 삭제", description = "담당 결재자 매핑을 삭제(비활성화)합니다.")
    @DeleteMapping("/{userId}/approvers/{mappingId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'CEO', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> deleteMapping(
            @PathVariable Long userId,
            @PathVariable Long mappingId) {
        try {
            userApproverService.deleteMapping(mappingId);
            logger.info("담당 결재자 삭제 완료 - mappingId: {}", mappingId);
            return ResponseEntity.ok(new ApiResponse<>(true, "담당 결재자가 삭제되었습니다.", null));
        } catch (Exception e) {
            logger.error("담당 결재자 삭제 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}


