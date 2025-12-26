package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.CompanySearchResultDto;
import com.innersignature.backend.dto.UserCompanyDto;
import com.innersignature.backend.dto.UserDto;
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
            logger.info("회사 생성 시도 - companyName: {}, businessRegNo: {}, userId: {}", 
                request.getCompanyName(), request.getBusinessRegNo(), userId);
            
            CompanyDto company = companyService.createCompany(
                request.getCompanyName(), 
                request.getBusinessRegNo(), 
                request.getRepresentativeName(), 
                userId);
            
            // 회사 생성 후 사용자를 회사에 추가 (user_company_tb에 추가)
            // 기본 회사 설정은 "기본 회사가 아직 없을 때만" 새 회사로 설정
            UserDto user = userService.selectUserById(userId);
            if (user != null) {
                // 새 회사에 사용자 추가
                userService.addUserToCompany(userId, company.getCompanyId(), user.getRole(), user.getPosition());

                // 현재 사용자의 소속 회사 목록 조회 (APPROVED만, isPrimary 포함)
                List<UserCompanyDto> userCompanies = userService.getUserCompanies(userId);

                // 이미 기본 회사가 있는지 확인
                boolean hasPrimary = userCompanies.stream()
                        .anyMatch(uc -> Boolean.TRUE.equals(uc.getIsPrimary()));

                // 기본 회사가 없는 경우에만 새 회사로 기본 회사 설정
                if (!hasPrimary) {
                    userService.switchPrimaryCompany(userId, company.getCompanyId());
                }
                
                // CEO인 경우 결재자로 자동 지정 (자신이 만든 회사)
                if ("CEO".equals(user.getRole())) {
                    userService.updateApproverStatus(userId, company.getCompanyId(), true);
                }
            }
            
            logger.info("회사 생성 완료 - companyId: {}, companyName: {}, userId: {}", 
                company.getCompanyId(), company.getCompanyName(), userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "회사가 등록되었습니다.", company));
        } catch (Exception e) {
            logger.error("회사 생성 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "회사 목록 조회", description = "현재 사용자가 소속된 회사 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyDto>>> getMyCompanies() {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            List<CompanyDto> companies = companyService.findByUserId(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", companies));
        } catch (Exception e) {
            logger.error("회사 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "회사 검색", description = "회사명 또는 사업자등록번호로 회사를 검색합니다. (공개 API, 최소 2자 이상)")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CompanySearchResultDto>>> searchCompanies(
            @RequestParam("name") String companyName) {
        try {
            // 입력 검증
            if (companyName == null || companyName.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "검색어를 입력해주세요.", null));
            }
            
            if (companyName.trim().length() < 2) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "검색어는 최소 2자 이상 입력해주세요.", null));
            }
            
            List<CompanySearchResultDto> results = companyService.searchByName(companyName);
            return ResponseEntity.ok(new ApiResponse<>(true, "검색 완료", results));
        } catch (Exception e) {
            logger.error("회사 검색 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "사업자등록번호 중복 확인", description = "사업자등록번호 중복 여부를 확인합니다. (공개 API)")
    @GetMapping("/check-business-reg-no")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkBusinessRegNoDuplicate(
            @RequestParam("businessRegNo") String businessRegNo) {
        try {
            boolean isDuplicate = companyService.existsByBusinessRegNo(businessRegNo);
            Map<String, Boolean> result = Map.of("isDuplicate", isDuplicate);
            return ResponseEntity.ok(new ApiResponse<>(true, "중복 확인 완료", result));
        } catch (Exception e) {
            logger.error("사업자등록번호 중복 확인 실패", e);
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
    
    @Operation(summary = "회사 전환", description = "사용자가 소속된 다른 회사로 전환합니다. (JWT 토큰 재발급은 UserController에서 처리)")
    @PostMapping("/switch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> switchCompany(@RequestBody CompanySwitchRequest request) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            
            // 사용자가 소속된 회사인지 확인
            List<CompanyDto> myCompanies = companyService.findByUserId(userId);
            boolean isMyCompany = myCompanies.stream()
                .anyMatch(c -> c.getCompanyId().equals(request.getCompanyId()));
            
            if (!isMyCompany) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "해당 회사에 소속되어 있지 않습니다.", null));
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
    
    @Operation(summary = "회사 승인 대기 사용자 목록", description = "회사의 승인 대기 사용자 목록을 조회합니다. (ADMIN/CEO만)")
    @GetMapping("/{companyId}/applications")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<UserCompanyDto>>> getCompanyApplications(@PathVariable Long companyId) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            
            // 작업 수행자가 해당 회사에 소속되어 있는지 확인 (활성화 여부와 관계없이)
            List<UserCompanyDto> myCompanies = userService.getUserCompanies(userId);
            boolean hasAccess = myCompanies.stream()
                .anyMatch(uc -> uc.getCompanyId().equals(companyId));
            
            if (!hasAccess) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "해당 회사에 대한 권한이 없습니다.", null));
            }
            
            List<UserCompanyDto> applications = userService.findPendingCompanyApplications(companyId);
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", applications));
        } catch (Exception e) {
            logger.error("회사 승인 대기 사용자 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Data
    static class CompanyCreateRequest {
        private String companyName;
        private String businessRegNo;
        private String representativeName;
    }
    
    @Data
    static class CompanySwitchRequest {
        private Long companyId;
    }
}

