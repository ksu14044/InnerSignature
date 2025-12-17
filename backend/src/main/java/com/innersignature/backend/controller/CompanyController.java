package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.CompanySearchResultDto;
import com.innersignature.backend.service.CompanyService;
import com.innersignature.backend.service.UserService;
import com.innersignature.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "회사 관리", description = "회사 등록 및 조회 API")
public class CompanyController {
    
    private static final Logger logger = LoggerFactory.getLogger(CompanyController.class);
    private final CompanyService companyService;
    private final UserService userService;
    
    @Operation(summary = "회사 생성", description = "CEO 또는 ADMIN이 새 회사를 등록합니다.")
    @PostMapping
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<CompanyDto>> createCompany(@RequestBody CompanyCreateRequest request) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            logger.info("회사 생성 시도 - companyName: {}, userId: {}", request.getCompanyName(), userId);
            
            CompanyDto company = companyService.createCompany(request.getCompanyName(), userId);
            
            // 회사 생성 후 사용자의 company_id 할당
            userService.assignToCompany(userId, company.getCompanyId());
            
            logger.info("회사 생성 완료 - companyId: {}, companyName: {}, userId: {}", 
                company.getCompanyId(), company.getCompanyName(), userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "회사가 등록되었습니다.", company));
        } catch (Exception e) {
            logger.error("회사 생성 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "회사 목록 조회", description = "현재 CEO 또는 ADMIN이 등록한 회사 목록을 조회합니다.")
    @GetMapping
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CompanyDto>>> getMyCompanies() {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            List<CompanyDto> companies = companyService.findByCreatedBy(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", companies));
        } catch (Exception e) {
            logger.error("회사 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "회사 검색", description = "회사명으로 회사를 검색합니다. (공개 API)")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CompanySearchResultDto>>> searchCompanies(
            @RequestParam("name") String companyName) {
        try {
            List<CompanySearchResultDto> results = companyService.searchByName(companyName);
            return ResponseEntity.ok(new ApiResponse<>(true, "검색 완료", results));
        } catch (Exception e) {
            logger.error("회사 검색 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "회사 조회", description = "회사 ID로 회사 정보를 조회합니다.")
    @GetMapping("/{companyId}")
    public ResponseEntity<ApiResponse<CompanyDto>> getCompany(@PathVariable Long companyId) {
        try {
            CompanyDto company = companyService.findById(companyId);
            if (company == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "회사를 찾을 수 없습니다.", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", company));
        } catch (Exception e) {
            logger.error("회사 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "회사 전환", description = "CEO 또는 ADMIN이 다른 회사로 전환합니다. (JWT 토큰 재발급)")
    @PostMapping("/switch")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> switchCompany(@RequestBody CompanySwitchRequest request) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            
            // 사용자가 등록한 회사인지 확인
            List<CompanyDto> myCompanies = companyService.findByCreatedBy(userId);
            boolean isMyCompany = myCompanies.stream()
                .anyMatch(c -> c.getCompanyId().equals(request.getCompanyId()));
            
            if (!isMyCompany) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "해당 회사에 대한 권한이 없습니다.", null));
            }
            
            // 회사 정보 조회
            CompanyDto company = companyService.findById(request.getCompanyId());
            if (company == null || !company.getIsActive()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "회사를 찾을 수 없습니다.", null));
            }
            
            // JWT 토큰 재발급은 UserController에서 처리
            // 여기서는 회사 정보만 반환
            
            Map<String, Object> responseData = Map.of(
                "companyId", company.getCompanyId(),
                "companyName", company.getCompanyName(),
                "companyCode", company.getCompanyCode()
            );
            
            logger.info("회사 전환 완료 - userId: {}, companyId: {}", userId, request.getCompanyId());
            return ResponseEntity.ok(new ApiResponse<>(true, "회사 전환이 완료되었습니다.", responseData));
        } catch (Exception e) {
            logger.error("회사 전환 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Data
    static class CompanyCreateRequest {
        private String companyName;
    }
    
    @Data
    static class CompanySwitchRequest {
        private Long companyId;
    }
}

