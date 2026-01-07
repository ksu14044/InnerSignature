package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.dto.UserCompanyDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.security.JwtBlacklistService;
import com.innersignature.backend.service.CompanyService;
import com.innersignature.backend.service.EmailService;
import com.innersignature.backend.service.PasswordResetService;
import com.innersignature.backend.service.UserService;
import com.innersignature.backend.service.UserSignatureService;
import com.innersignature.backend.dto.UserSignatureDto;
import com.innersignature.backend.util.JwtUtil;
import com.innersignature.backend.util.SecurityLogger;
import com.innersignature.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "User", description = "사용자 인증 및 계정 관리 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final CompanyService companyService;
    private final JwtUtil jwtUtil;
    private final JwtBlacklistService jwtBlacklistService;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;
    private final UserSignatureService userSignatureService;

    @Operation(summary = "로그인", description = "JWT와 Refresh 토큰을 발급합니다.")
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
        logger.info("로그인 시도 - username: {}", request.getUsername());
        UserDto user = userService.authenticate(request.getUsername(), request.getPassword());

        if (user != null) {
            // 승인 상태 체크
            if (!"APPROVED".equals(user.getApprovalStatus())) {
                logger.warn("로그인 실패 - 승인 대기 중 - username: {}", request.getUsername());
                SecurityLogger.loginFailure(request.getUsername());
                return new ApiResponse<>(false, "관리자 승인 대기 중입니다.", null);
            }
            
            if (user.getIsActive() == null || !user.getIsActive()) {
                logger.warn("로그인 실패 - 비활성화된 계정 - username: {}", request.getUsername());
                SecurityLogger.loginFailure(request.getUsername());
                return new ApiResponse<>(false, "비활성화된 계정입니다.", null);
            }
            
            // 기본 회사 정보 조회 (회사별 role 가져오기)
            List<UserCompanyDto> userCompanies = userService.getUserCompanies(user.getUserId());
            UserCompanyDto primaryCompany = userCompanies.stream()
                .filter(uc -> Boolean.TRUE.equals(uc.getIsPrimary()) && "APPROVED".equals(uc.getApprovalStatus()))
                .findFirst()
                .orElse(null);
            
            String companyRole = user.getRole(); // 기본값은 전역 role
            Long companyId = user.getCompanyId(); // 기본값은 user_tb의 companyId
            
            if (primaryCompany != null) {
                companyRole = primaryCompany.getRole(); // 기본 회사의 role 사용
                companyId = primaryCompany.getCompanyId(); // 기본 회사의 ID 사용
            }
            
            // JWT 토큰 생성 (회사별 role과 companyId 포함)
            String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), companyRole, companyId);
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getUsername(), companyRole, companyId);
            
            // 비밀번호는 보안상 프론트로 보내지 않는 게 좋습니다.
            user.setPassword(null);
            // 회사별 role과 companyId로 업데이트 (프론트엔드에서 권한 체크에 사용)
            user.setRole(companyRole);
            user.setCompanyId(companyId);
            
            // 토큰과 사용자 정보 반환
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("user", user);
            responseData.put("token", token);
            responseData.put("refreshToken", refreshToken);
            
            logger.info("로그인 성공 - userId: {}, role: {}, companyId: {}", user.getUserId(), user.getRole(), user.getCompanyId());
            SecurityLogger.loginSuccess(user.getUserId(), user.getUsername(), user.getRole());
            return new ApiResponse<>(true, "로그인 성공", responseData);
        } else {
            logger.warn("로그인 실패 - username: {}", request.getUsername());
            SecurityLogger.loginFailure(request.getUsername());
            return new ApiResponse<>(false, "아이디 또는 비밀번호가 틀렸습니다.", null);
        }
    }

    @Operation(summary = "회원가입", description = "신규 사용자를 등록합니다.")
    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("회원가입 시도 - username: {}, koreanName: {}, role: {}", request.getUsername(), request.getKoreanName(), request.getRole());
        
        // role 검증 (ADMIN 제거, CEO만 허용)
        if (request.getRole() == null || (!request.getRole().equals("USER") && 
            !request.getRole().equals("TAX_ACCOUNTANT") &&
            !request.getRole().equals("CEO"))) {
            logger.warn("회원가입 실패 - 잘못된 역할: {}", request.getRole());
            return new ApiResponse<>(false, "올바른 역할을 선택해주세요. (USER, TAX_ACCOUNTANT, CEO)", null);
        }
        
        // USER, TAX_ACCOUNTANT는 companyId 필수
        if ((request.getRole().equals("USER") || request.getRole().equals("TAX_ACCOUNTANT")) && request.getCompanyId() == null) {
            logger.warn("회원가입 실패 - USER/TAX_ACCOUNTANT는 companyId 필수: {}", request.getUsername());
            return new ApiResponse<>(false, "회사를 선택해주세요.", null);
        }
        
        // CEO는 companyId NULL 허용 (나중에 회사 등록 시 할당)
        
        // 중복 사용자명 체크 (전역)
        if (userService.isUsernameExists(request.getUsername())) {
            logger.warn("회원가입 실패 - 중복된 사용자명: {}", request.getUsername());
            return new ApiResponse<>(false, "이미 존재하는 사용자명입니다.", null);
        }

        UserDto newUser = new UserDto();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(request.getPassword()); // 평문 비밀번호, UserService에서 암호화됨
        newUser.setKoreanName(request.getKoreanName());
        newUser.setEmail(request.getEmail());
        newUser.setPosition(request.getPosition());
        newUser.setRole(request.getRole());
        newUser.setCompanyId(request.getCompanyId()); // CEO일 때는 NULL
        
        // USER, TAX_ACCOUNTANT는 승인 대기 상태로 생성
        if (request.getRole().equals("USER") || request.getRole().equals("TAX_ACCOUNTANT")) {
            newUser.setApprovalStatus("PENDING");
            newUser.setIsActive(false); // 승인 전까지 비활성화
        } else {
            // CEO는 즉시 승인
            newUser.setApprovalStatus("APPROVED");
            newUser.setIsActive(true);
        }

        int result = userService.register(newUser);
        if (result > 0) {
            // 회원가입 성공 후 user_company_tb에도 추가
            if (request.getCompanyId() != null) {
                try {
                    // 생성된 사용자 정보 조회
                    UserDto createdUser = userService.findByUsername(request.getUsername());
                    
                    if (createdUser != null) {
                        // user_company_tb에 추가 (PENDING 상태로)
                        userService.applyToCompany(
                            createdUser.getUserId(), 
                            request.getCompanyId(), 
                            request.getRole(), 
                            request.getPosition()
                        );
                        // CEO는 즉시 승인 처리 (addUserToCompany를 APPROVED 상태로 직접 호출)
                        if ("CEO".equals(request.getRole())) {
                            // applyToCompany로 추가된 것을 삭제하고 APPROVED 상태로 다시 추가
                            userService.removeUserFromCompany(createdUser.getUserId(), request.getCompanyId());
                            userService.addUserToCompany(
                                createdUser.getUserId(), 
                                request.getCompanyId(), 
                                request.getRole(), 
                                request.getPosition()
                            );
                            // 기본 회사로 설정
                            userService.switchPrimaryCompany(createdUser.getUserId(), request.getCompanyId());
                            // CEO를 결재자로 자동 지정
                            userService.updateApproverStatus(createdUser.getUserId(), request.getCompanyId(), true);
                        }
                    }
                } catch (Exception e) {
                    logger.warn("회원가입 후 user_company_tb 추가 실패 (무시됨): {}", e.getMessage());
                    // user_company_tb 추가 실패해도 회원가입은 성공으로 처리
                }
            }
            
            String message = (request.getRole().equals("USER") || request.getRole().equals("TAX_ACCOUNTANT")) 
                ? "회원가입 신청이 완료되었습니다. 관리자 승인 후 사용 가능합니다." 
                : "회원가입이 완료되었습니다.";
            logger.info("회원가입 완료 - username: {}, role: {}", request.getUsername(), request.getRole());
            return new ApiResponse<>(true, message, null);
        } else {
            logger.error("회원가입 실패 - username: {}", request.getUsername());
            return new ApiResponse<>(false, "회원가입에 실패했습니다.", null);
        }
    }

    /**
     * 결재자 목록 조회 API (ADMIN, CEO) - Deprecated
     * 주소: GET /api/users/admins
     * @deprecated 결재자 지정 기능으로 대체되었습니다. GET /api/users/approvers를 사용하세요.
     */
    @Deprecated
    @Operation(summary = "결재자 목록 조회 (Deprecated)", description = "현재 회사의 ADMIN 및 CEO 역할 사용자 목록을 조회합니다. 결재자 지정 기능으로 대체되었습니다.")
    @GetMapping("/users/admins")
    public ApiResponse<List<UserDto>> getAdminUsers() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            if (companyId == null) {
                return new ApiResponse<>(false, "회사 정보가 없습니다.", null);
            }
            // 기존 로직 유지 (하위 호환성)
            List<UserDto> adminUsers = userService.findAdminUsers(companyId);
            return new ApiResponse<>(true, "결재자 목록 조회 성공", adminUsers);
        } catch (Exception e) {
            throw new RuntimeException("결재자 조회 중 오류 발생: " + e.getMessage(), e);
        }
    }
    
    /**
     * 결재자 지정/해제 API
     * 주소: PUT /api/users/{userId}/company/{companyId}/approver
     */
    @Operation(summary = "결재자 지정/해제", description = "특정 사용자를 결재자로 지정하거나 해제합니다. (CEO/ADMIN 전용)")
    @PutMapping("/users/{userId}/company/{companyId}/approver")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<Void> updateApproverStatus(
            @PathVariable Long userId,
            @PathVariable Long companyId,
            @RequestParam Boolean isApprover) {
        try {
            Long operatorId = SecurityUtil.getCurrentUserId();
            Long operatorCompanyId = SecurityUtil.getCurrentCompanyId();
            
            // 회사 접근 권한 체크
            if (operatorCompanyId == null || !operatorCompanyId.equals(companyId)) {
                return new ApiResponse<>(false, "해당 회사에 대한 권한이 없습니다.", null);
            }
            
            userService.updateApproverStatus(userId, companyId, isApprover);
            logger.info("결재자 지정 변경 - operatorId: {}, userId: {}, companyId: {}, isApprover: {}", 
                       operatorId, userId, companyId, isApprover);
            return new ApiResponse<>(true, 
                isApprover ? "결재자로 지정되었습니다." : "결재자 지정이 해제되었습니다.", null);
        } catch (Exception e) {
            logger.error("결재자 지정 변경 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    /**
     * 결재자 목록 조회 API
     * 주소: GET /api/users/approvers
     */
    @Operation(summary = "결재자 목록 조회", description = "현재 회사에서 결재자로 지정된 사용자 목록을 조회합니다.")
    @GetMapping("/users/approvers")
    public ApiResponse<List<UserDto>> getApprovers() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            if (companyId == null) {
                return new ApiResponse<>(false, "회사 정보가 없습니다.", null);
            }
            List<UserDto> approvers = userService.findApprovers(companyId);
            logger.info("결재자 목록 조회 완료 - companyId: {}, count: {}", companyId, approvers.size());
            return new ApiResponse<>(true, "결재자 목록 조회 성공", approvers);
        } catch (Exception e) {
            logger.error("결재자 목록 조회 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    /**
     * username 중복 체크 API
     * 주소: GET /api/users/check-username
     */
    @Operation(summary = "username 중복 체크", description = "username이 이미 사용 중인지 확인합니다.")
    @GetMapping("/users/check-username")
    public ApiResponse<Map<String, Object>> checkUsername(@RequestParam String username) {
        try {
            boolean exists = userService.isUsernameExists(username);
            Map<String, Object> result = new HashMap<>();
            result.put("exists", exists);
            result.put("available", !exists);
            return new ApiResponse<>(true, exists ? "이미 사용 중인 username입니다." : "사용 가능한 username입니다.", result);
        } catch (Exception e) {
            logger.error("username 중복 체크 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * email 중복 체크 API
     * 주소: GET /api/users/check-email
     */
    @Operation(summary = "email 중복 체크", description = "email이 이미 사용 중인지 확인합니다.")
    @GetMapping("/users/check-email")
    public ApiResponse<Map<String, Object>> checkEmail(@RequestParam String email) {
        try {
            boolean exists = userService.isEmailExists(email, null); // 전역 체크
            Map<String, Object> result = new HashMap<>();
            result.put("exists", exists);
            result.put("available", !exists);
            return new ApiResponse<>(true, exists ? "이미 사용 중인 이메일입니다." : "사용 가능한 이메일입니다.", result);
        } catch (Exception e) {
            logger.error("email 중복 체크 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 전체 사용자 목록 조회 API (SUPERADMIN 전용)
     * 주소: GET /api/users
     */
    @Operation(summary = "전체 사용자 목록 조회", description = "SUPERADMIN 전용 전체 사용자 목록 조회")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @GetMapping("/users")
    public ApiResponse<List<UserDto>> getAllUsers() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("전체 사용자 목록 조회 요청 - userId: {}", currentUserId);
        List<UserDto> users = userService.getAllUsers();
        // 비밀번호 제거
        users.forEach(user -> user.setPassword(null));
        logger.info("전체 사용자 목록 조회 완료 - count: {}", users.size());
        return new ApiResponse<>(true, "전체 사용자 목록 조회 성공", users);
    }

    /**
     * 사용자 생성 API (SUPERADMIN 전용)
     * 주소: POST /api/users
     */
    @Operation(summary = "사용자 생성", description = "SUPERADMIN 전용 사용자 생성")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @PostMapping("/users")
    public ApiResponse<Long> createUser(@Valid @RequestBody UserCreateRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("사용자 생성 요청 - operatorId: {}, username: {}", currentUserId, request.getUsername());

        UserDto newUser = new UserDto();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(request.getPassword());
        newUser.setKoreanName(request.getKoreanName());
        newUser.setEmail(request.getEmail());
        newUser.setPosition(request.getPosition());
        newUser.setRole(request.getRole() != null ? request.getRole() : "USER");
        newUser.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Long createdUserId = userService.createUser(newUser, currentUserId);
        if (createdUserId != null) {
            SecurityLogger.userManagement("CREATE", currentUserId, createdUserId, 
                String.format("username=%s, role=%s", request.getUsername(), newUser.getRole()));
            SecurityLogger.superAdminAction("CREATE_USER", currentUserId, "USER", createdUserId, 
                String.format("username=%s, role=%s", request.getUsername(), newUser.getRole()));
            logger.info("사용자 생성 완료 - userId: {}", createdUserId);
            return new ApiResponse<>(true, "사용자 생성 완료", createdUserId);
        } else {
            logger.error("사용자 생성 실패 - username: {}", request.getUsername());
            return new ApiResponse<>(false, "사용자 생성에 실패했습니다.", null);
        }
    }

    /**
     * 사용자 정보 수정 API (SUPERADMIN 전용)
     * 주소: PUT /api/users/{userId}
     * SUPERADMIN은 직급, 권한, 상태만 수정 가능 (이름과 이메일은 수정 불가)
     */
    @Operation(summary = "사용자 정보 수정 (SUPERADMIN)", description = "직급/권한/활성화 상태를 수정합니다. 이름/이메일은 유지됩니다.")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @PutMapping("/users/{userId}")
    public ApiResponse<Void> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("사용자 정보 수정 요청 - operatorId: {}, targetUserId: {}", currentUserId, userId);

        // 기존 사용자 정보 조회 (이름과 이메일은 기존 값 유지)
        UserDto existingUser = userService.selectUserById(userId);
        if (existingUser == null) {
            logger.error("사용자 정보 조회 실패 - userId: {}", userId);
            return new ApiResponse<>(false, "사용자를 찾을 수 없습니다.", null);
        }

        UserDto userDto = new UserDto();
        userDto.setUserId(userId);
        // 이름과 이메일은 기존 값 유지 (SUPERADMIN은 수정 불가)
        userDto.setKoreanName(existingUser.getKoreanName());
        userDto.setEmail(existingUser.getEmail());
        // 직급, 권한, 상태만 수정 가능
        userDto.setPosition(request.getPosition());
        userDto.setRole(request.getRole());
        userDto.setIsActive(request.getIsActive());

        int result = userService.updateUser(userDto, currentUserId);
        if (result > 0) {
            SecurityLogger.userManagement("UPDATE", currentUserId, userId, 
                String.format("role=%s, isActive=%s", request.getRole(), request.getIsActive()));
            SecurityLogger.superAdminAction("UPDATE_USER", currentUserId, "USER", userId, 
                String.format("role=%s, isActive=%s", request.getRole(), request.getIsActive()));
            logger.info("사용자 정보 수정 완료 - userId: {}", userId);
            return new ApiResponse<>(true, "사용자 정보 수정 완료", null);
        } else {
            logger.error("사용자 정보 수정 실패 - userId: {}", userId);
            return new ApiResponse<>(false, "사용자 정보 수정에 실패했습니다.", null);
        }
    }

    /**
     * 사용자 삭제 API (SUPERADMIN 전용, soft delete)
     * 주소: DELETE /api/users/{userId}
     */
    @Operation(summary = "사용자 삭제 (SUPERADMIN)", description = "소프트 삭제로 사용자 비활성 처리합니다.")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @DeleteMapping("/users/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("사용자 삭제 요청 - operatorId: {}, targetUserId: {}", currentUserId, userId);

        int result = userService.deleteUser(userId, currentUserId);
        if (result > 0) {
            SecurityLogger.userManagement("DELETE", currentUserId, userId, "soft delete");
            SecurityLogger.superAdminAction("DELETE_USER", currentUserId, "USER", userId, "soft delete");
            logger.info("사용자 삭제 완료 - userId: {}", userId);
            return new ApiResponse<>(true, "사용자 삭제 완료", null);
        } else {
            logger.error("사용자 삭제 실패 - userId: {}", userId);
            return new ApiResponse<>(false, "사용자 삭제에 실패했습니다.", null);
        }
    }

    /**
     * 현재 로그인한 사용자 정보 조회 API
     * 주소: GET /api/users/me
     */
    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    @GetMapping("/users/me")
    public ApiResponse<UserDto> getCurrentUser() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Long currentCompanyId = SecurityUtil.getCurrentCompanyId(); // JWT 토큰에서 현재 활성 회사 ID 가져오기
        logger.info("현재 사용자 정보 조회 요청 - userId: {}, companyId: {}", currentUserId, currentCompanyId);
        UserDto user = userService.selectUserById(currentUserId);
        if (user != null) {
            user.setPassword(null); // 비밀번호 제거
            
            // 현재 활성 회사의 role 조회
            List<UserCompanyDto> userCompanies = userService.getUserCompanies(currentUserId);
            UserCompanyDto currentCompany = null;
            if (currentCompanyId != null) {
                currentCompany = userCompanies.stream()
                    .filter(uc -> uc.getCompanyId().equals(currentCompanyId) && "APPROVED".equals(uc.getApprovalStatus()))
                    .findFirst()
                    .orElse(null);
            }
            
            if (currentCompany != null) {
                // 회사별 role과 companyId 설정
                user.setRole(currentCompany.getRole());
                user.setCompanyId(currentCompanyId);
            } else {
                // 기본 회사 정보 사용
                UserCompanyDto primaryCompany = userCompanies.stream()
                    .filter(uc -> Boolean.TRUE.equals(uc.getIsPrimary()) && "APPROVED".equals(uc.getApprovalStatus()))
                    .findFirst()
                    .orElse(null);
                if (primaryCompany != null) {
                    user.setRole(primaryCompany.getRole());
                    user.setCompanyId(primaryCompany.getCompanyId());
                }
            }
            
            logger.info("현재 사용자 정보 조회 완료 - userId: {}, companyId: {}, role: {}", currentUserId, user.getCompanyId(), user.getRole());
            return new ApiResponse<>(true, "현재 사용자 정보 조회 성공", user);
        } else {
            logger.error("현재 사용자 정보 조회 실패 - userId: {}", currentUserId);
            return new ApiResponse<>(false, "사용자 정보를 찾을 수 없습니다.", null);
        }
    }

    /**
     * 현재 로그인한 사용자 정보 수정 API
     * 주소: PUT /api/users/me
     */
    @Operation(summary = "내 정보 수정", description = "현재 로그인한 사용자의 이름/이메일/직급을 수정합니다.")
    @PutMapping("/users/me")
    public ApiResponse<Void> updateCurrentUser(@Valid @RequestBody MyProfileUpdateRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("현재 사용자 정보 수정 요청 - userId: {}", currentUserId);

        // 기존 사용자 정보 조회
        UserDto existingUser = userService.selectUserById(currentUserId);
        if (existingUser == null) {
            logger.error("현재 사용자 정보 조회 실패 - userId: {}", currentUserId);
            return new ApiResponse<>(false, "사용자 정보를 찾을 수 없습니다.", null);
        }

        UserDto userDto = new UserDto();
        userDto.setUserId(currentUserId);
        userDto.setKoreanName(request.getKoreanName());
        userDto.setEmail(request.getEmail());
        userDto.setPosition(request.getPosition());
        userDto.setRole(existingUser.getRole()); // 기존 role 유지
        userDto.setIsActive(existingUser.getIsActive()); // 기존 isActive 유지
        userDto.setCompanyId(existingUser.getCompanyId()); // 기존 companyId 유지
        userDto.setApprovalStatus(existingUser.getApprovalStatus()); // 기존 approvalStatus 유지
        // role과 isActive는 수정 불가 (보안상 이유)

        int result = userService.updateUser(userDto, currentUserId);
        if (result > 0) {
            logger.info("현재 사용자 정보 수정 완료 - userId: {}", currentUserId);
            return new ApiResponse<>(true, "사용자 정보 수정 완료", null);
        } else {
            logger.error("현재 사용자 정보 수정 실패 - userId: {}", currentUserId);
            return new ApiResponse<>(false, "사용자 정보 수정에 실패했습니다.", null);
        }
    }

    /**
     * 현재 로그인한 사용자 비밀번호 변경 API
     * 주소: PUT /api/users/me/password
     */
    @Operation(summary = "비밀번호 변경", description = "현재 비밀번호 검증 후 새 비밀번호로 변경합니다.")
    @PutMapping("/users/me/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("비밀번호 변경 요청 - userId: {}", currentUserId);

        try {
            boolean success = userService.changePassword(
                currentUserId,
                request.getCurrentPassword(),
                request.getNewPassword()
            );
            
            if (success) {
                logger.info("비밀번호 변경 완료 - userId: {}", currentUserId);
                return new ApiResponse<>(true, "비밀번호가 변경되었습니다.", null);
            } else {
                logger.error("비밀번호 변경 실패 - userId: {}", currentUserId);
                return new ApiResponse<>(false, "비밀번호 변경에 실패했습니다.", null);
            }
        } catch (BusinessException e) {
            logger.warn("비밀번호 변경 실패 - userId: {}, reason: {}", currentUserId, e.getMessage());
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 토큰 재발급 API
     * 주소: POST /api/refresh-token
     */
    @Operation(summary = "토큰 재발급", description = "Refresh 토큰으로 Access/Refresh 토큰을 재발급합니다.")
    @PostMapping("/refresh-token")
    public ApiResponse<Map<String, Object>> refreshToken(@RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (refreshToken == null || refreshToken.isEmpty()) {
            return new ApiResponse<>(false, "리프레시 토큰이 필요합니다.", null);
        }

        if (jwtBlacklistService.isBlacklisted(refreshToken) || !jwtUtil.validateRefreshToken(refreshToken)) {
            return new ApiResponse<>(false, "유효하지 않은 리프레시 토큰입니다.", null);
        }

        var claims = jwtUtil.parseToken(refreshToken);
        Long userId = Long.parseLong(claims.getSubject());
        String username = claims.get("username", String.class);
        Long companyId = claims.get("companyId", Long.class);

        // 토큰의 companyId에 해당하는 회사에서의 role을 DB에서 조회
        String role = null;
        if (companyId != null) {
            List<UserCompanyDto> userCompanies = userService.getUserCompanies(userId);
            UserCompanyDto currentCompany = userCompanies.stream()
                .filter(uc -> uc.getCompanyId().equals(companyId) && "APPROVED".equals(uc.getApprovalStatus()))
                .findFirst()
                .orElse(null);
            
            if (currentCompany != null) {
                role = currentCompany.getRole(); // 해당 회사에서의 role 사용
            }
        }
        
        // role을 찾지 못한 경우 (회사 탈퇴 등) fallback
        if (role == null) {
            role = claims.get("role", String.class); // 기존 role 사용 (하위 호환성)
            logger.warn("토큰 재발급 시 회사별 role을 찾지 못함 - userId: {}, companyId: {}, fallback role 사용: {}", 
                userId, companyId, role);
        }

        // 리프레시 토큰 회전: 기존 토큰 블랙리스트 처리
        jwtBlacklistService.blacklist(refreshToken);

        String newAccessToken = jwtUtil.generateToken(userId, username, role, companyId);
        String newRefreshToken = jwtUtil.generateRefreshToken(userId, username, role, companyId);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", newAccessToken);
        responseData.put("refreshToken", newRefreshToken);

        logger.info("토큰 재발급 완료 - userId: {}, companyId: {}, role: {}", userId, companyId, role);
        return new ApiResponse<>(true, "토큰이 재발급되었습니다.", responseData);
    }

    /**
     * 로그아웃 (토큰 블랙리스트 처리)
     * 주소: POST /api/logout
     */
    @Operation(summary = "로그아웃", description = "Access/Refresh 토큰을 블랙리스트 처리하여 로그아웃합니다.")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                    @RequestBody(required = false) RefreshTokenRequest request) {
        // 접근 토큰 블랙리스트
        String accessToken = extractBearerToken(authHeader);
        Long userIdForLog = null;
        if (accessToken != null && jwtUtil.validateToken(accessToken)) {
            jwtBlacklistService.blacklist(accessToken);
            try {
                userIdForLog = Long.parseLong(jwtUtil.parseToken(accessToken).getSubject());
            } catch (Exception ignored) {}
        }

        // 리프레시 토큰 블랙리스트
        if (request != null && request.getRefreshToken() != null && jwtUtil.validateRefreshToken(request.getRefreshToken())) {
            jwtBlacklistService.blacklist(request.getRefreshToken());
        }

        if (userIdForLog != null) {
            SecurityLogger.logout(userIdForLog);
        }

        return new ApiResponse<>(true, "로그아웃되었습니다.", null);
    }

    private String extractBearerToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * 아이디 찾기 API
     * 주소: POST /api/find-username
     */
    @Operation(summary = "아이디 찾기", description = "이메일/이름으로 사용자 아이디를 조회합니다.")
    @PostMapping("/find-username")
    public ApiResponse<Map<String, String>> findUsername(@Valid @RequestBody FindUsernameRequest request) {
        logger.info("아이디 찾기 요청 - email: {}", request.getEmail());

        try {
            UserDto user = userService.findUsernameByEmailAndName(request.getEmail(), request.getKoreanName());
            if (user != null) {
                Map<String, String> responseData = new HashMap<>();
                responseData.put("username", user.getUsername());
                responseData.put("message", "아이디를 찾았습니다.");
                
                logger.info("아이디 찾기 성공 - email: {}, username: {}", request.getEmail(), user.getUsername());
                return new ApiResponse<>(true, "아이디를 찾았습니다.", responseData);
            } else {
                logger.warn("아이디 찾기 실패 - 일치하는 사용자 없음 - email: {}", request.getEmail());
                return new ApiResponse<>(false, "입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.", null);
            }
        } catch (Exception e) {
            logger.error("아이디 찾기 중 오류 발생 - email: {}, error: {}", request.getEmail(), e.getMessage());
            return new ApiResponse<>(false, "아이디 찾기 중 오류가 발생했습니다.", null);
        }
    }

    /**
     * 비밀번호 재설정 요청 API
     * 주소: POST /api/request-password-reset
     */
    @Operation(summary = "비밀번호 재설정 요청", description = "비밀번호 재설정 이메일을 발송합니다.")
    @PostMapping("/request-password-reset")
    public ApiResponse<Map<String, String>> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        logger.info("비밀번호 재설정 요청 - email: {}", request.getEmail());

        try {
            UserDto user = userService.requestPasswordReset(request.getEmail());
            if (user != null) {
                // 재설정 토큰 생성
                String token = passwordResetService.generateResetToken(user.getUserId());
                
                // 이메일로 재설정 링크 발송
                emailService.sendPasswordResetEmail(user.getEmail(), user.getKoreanName(), token);
                
                Map<String, String> responseData = new HashMap<>();
                responseData.put("message", "등록된 이메일로 비밀번호 재설정 링크를 발송했습니다.");
                
                logger.info("비밀번호 재설정 요청 성공 - email: {}", request.getEmail());
                return new ApiResponse<>(true, "등록된 이메일로 비밀번호 재설정 링크를 발송했습니다.", responseData);
            } else {
                logger.warn("비밀번호 재설정 요청 실패 - 사용자 없음 - email: {}", request.getEmail());
                // 보안상 이유로 사용자가 없어도 성공 메시지 반환
                Map<String, String> responseData = new HashMap<>();
                responseData.put("message", "등록된 이메일로 비밀번호 재설정 링크를 발송했습니다.");
                return new ApiResponse<>(true, "등록된 이메일로 비밀번호 재설정 링크를 발송했습니다.", responseData);
            }
        } catch (Exception e) {
            logger.error("비밀번호 재설정 요청 중 오류 발생 - email: {}, error: {}", request.getEmail(), e.getMessage());
            return new ApiResponse<>(false, "비밀번호 재설정 요청 중 오류가 발생했습니다.", null);
        }
    }

    /**
     * 비밀번호 재설정 API
     * 주소: POST /api/reset-password
     */
    @Operation(summary = "비밀번호 재설정", description = "토큰 검증 후 새 비밀번호를 설정합니다.")
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("비밀번호 재설정 시도 - token: {}", request.getToken() != null ? "provided" : "null");

        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            logger.info("비밀번호 재설정 성공");
            return new ApiResponse<>(true, "비밀번호가 재설정되었습니다.", null);
        } catch (BusinessException e) {
            logger.warn("비밀번호 재설정 실패 - reason: {}", e.getMessage());
            return new ApiResponse<>(false, e.getMessage(), null);
        } catch (Exception e) {
            logger.error("비밀번호 재설정 중 오류 발생 - error: {}", e.getMessage());
            return new ApiResponse<>(false, "비밀번호 재설정 중 오류가 발생했습니다.", null);
        }
    }

    // 로그인 요청용 DTO (내부 클래스)
    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }

    // 회원가입 요청용 DTO (내부 클래스)
    @Data
    static class RegisterRequest {
        @jakarta.validation.constraints.NotBlank(message = "아이디는 필수입니다.")
        @jakarta.validation.constraints.Size(min = 3, max = 50, message = "아이디는 3자 이상 50자 이하여야 합니다.")
        private String username;
        
        private String password; // 비밀번호 검증 규칙 없음 (테스트 편의)
        
        @jakarta.validation.constraints.NotBlank(message = "이름은 필수입니다.")
        @jakarta.validation.constraints.Size(max = 50, message = "이름은 50자 이하여야 합니다.")
        private String koreanName;
        
        @jakarta.validation.constraints.Email(message = "올바른 이메일 형식이 아닙니다.")
        @jakarta.validation.constraints.Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
        private String email;
        
        @jakarta.validation.constraints.Size(max = 50, message = "직급은 50자 이하여야 합니다.")
        private String position;
        
        @jakarta.validation.constraints.NotBlank(message = "역할은 필수입니다.")
        private String role; // USER, ADMIN, TAX_ACCOUNTANT
        
        private Long companyId; // USER, TAX_ACCOUNTANT일 때 필수, ADMIN일 때는 NULL 허용
    }

    @Data
    static class RefreshTokenRequest {
        private String refreshToken;
    }

    @Data
    static class UserCreateRequest {
        @jakarta.validation.constraints.NotBlank(message = "아이디는 필수입니다.")
        @jakarta.validation.constraints.Size(min = 3, max = 50, message = "아이디는 3자 이상 50자 이하여야 합니다.")
        private String username;

        private String password;

        @jakarta.validation.constraints.NotBlank(message = "이름은 필수입니다.")
        @jakarta.validation.constraints.Size(max = 50, message = "이름은 50자 이하여야 합니다.")
        private String koreanName;

        @jakarta.validation.constraints.Email(message = "올바른 이메일 형식이 아닙니다.")
        @jakarta.validation.constraints.Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
        private String email;

        @jakarta.validation.constraints.Size(max = 50, message = "직급은 50자 이하여야 합니다.")
        private String position;

        private String role; // USER, ADMIN, ACCOUNTANT, TAX_ACCOUNTANT (SUPERADMIN 불가)

        private Boolean isActive;
    }

    @Data
    static class UserUpdateRequest {
        // 이름과 이메일 필드 제거 (SUPERADMIN은 수정 불가)
        
        @jakarta.validation.constraints.Size(max = 50, message = "직급은 50자 이하여야 합니다.")
        private String position;

        private String role;

        private Boolean isActive;
    }

    @Data
    static class MyProfileUpdateRequest {
        @jakarta.validation.constraints.NotBlank(message = "이름은 필수입니다.")
        @jakarta.validation.constraints.Size(max = 50, message = "이름은 50자 이하여야 합니다.")
        private String koreanName;

        @jakarta.validation.constraints.Email(message = "올바른 이메일 형식이 아닙니다.")
        @jakarta.validation.constraints.Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
        private String email;

        @jakarta.validation.constraints.Size(max = 50, message = "직급은 50자 이하여야 합니다.")
        private String position;
    }

    @Data
    static class PasswordChangeRequest {
        @jakarta.validation.constraints.NotBlank(message = "현재 비밀번호는 필수입니다.")
        private String currentPassword;

        @jakarta.validation.constraints.NotBlank(message = "새 비밀번호는 필수입니다.")
        @jakarta.validation.constraints.Size(min = 1, message = "새 비밀번호를 입력해주세요.")
        private String newPassword;
    }

    @Data
    static class FindUsernameRequest {
        @jakarta.validation.constraints.NotBlank(message = "이메일은 필수입니다.")
        @jakarta.validation.constraints.Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @jakarta.validation.constraints.NotBlank(message = "이름은 필수입니다.")
        private String koreanName;
    }

    @Data
    static class PasswordResetRequest {
        @jakarta.validation.constraints.NotBlank(message = "이메일은 필수입니다.")
        @jakarta.validation.constraints.Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;
    }

    @Data
    static class ResetPasswordRequest {
        @jakarta.validation.constraints.NotBlank(message = "토큰은 필수입니다.")
        private String token;

        @jakarta.validation.constraints.NotBlank(message = "새 비밀번호는 필수입니다.")
        @jakarta.validation.constraints.Size(min = 1, message = "새 비밀번호를 입력해주세요.")
        private String newPassword;
    }
    
    @Operation(summary = "사용자 role 변경", description = "CEO 또는 ADMIN이 직원의 role을 변경합니다.")
    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<String> updateUserRole(
            @PathVariable Long userId,
            @RequestBody UpdateRoleRequest request) {
        try {
            Long operatorId = SecurityUtil.getCurrentUserId();
            logger.info("사용자 role 변경 시도 - userId: {}, newRole: {}, operatorId: {}", 
                userId, request.getRole(), operatorId);
            
            int result = userService.updateUserRole(userId, request.getRole(), operatorId);
            if (result > 0) {
                logger.info("사용자 role 변경 완료 - userId: {}, newRole: {}", userId, request.getRole());
                return new ApiResponse<>(true, "role이 변경되었습니다.", null);
            } else {
                logger.error("사용자 role 변경 실패 - userId: {}", userId);
                return new ApiResponse<>(false, "role 변경에 실패했습니다.", null);
            }
        } catch (Exception e) {
            logger.error("사용자 role 변경 중 오류 발생 - userId: {}", userId, e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "사용자 승인/거부", description = "CEO 또는 ADMIN이 회원가입 신청을 승인/거부합니다.")
    @PostMapping("/users/{userId}/approval")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<String> approveUser(
            @PathVariable Long userId,
            @RequestBody ApprovalRequest request) {
        try {
            Long operatorId = SecurityUtil.getCurrentUserId();
            logger.info("사용자 승인/거부 시도 - userId: {}, action: {}, operatorId: {}", 
                userId, request.getAction(), operatorId);
            
            if ("APPROVE".equals(request.getAction())) {
                userService.approveUser(userId, operatorId);
                logger.info("사용자 승인 완료 - userId: {}", userId);
                return new ApiResponse<>(true, "사용자가 승인되었습니다.", null);
            } else if ("REJECT".equals(request.getAction())) {
                userService.rejectUser(userId, operatorId);
                logger.info("사용자 거부 완료 - userId: {}", userId);
                return new ApiResponse<>(true, "사용자가 거부되었습니다.", null);
            } else {
                return new ApiResponse<>(false, "올바른 액션을 선택해주세요. (APPROVE, REJECT)", null);
            }
        } catch (Exception e) {
            logger.error("사용자 승인/거부 중 오류 발생 - userId: {}", userId, e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "승인 대기 사용자 목록", description = "CEO 또는 ADMIN이 승인 대기 중인 사용자 목록을 조회합니다.")
    @GetMapping("/users/pending")
    public ApiResponse<List<UserDto>> getPendingUsers() {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            Long tempCompanyId = SecurityUtil.getCurrentCompanyId();
            
            final Long companyId;
            if (tempCompanyId == null) {
                // companyId가 없는 경우, 사용자 정보에서 companyId 가져오기
                UserDto currentUser = userService.selectUserById(userId);
                if (currentUser != null && currentUser.getCompanyId() != null) {
                    companyId = currentUser.getCompanyId();
                } else {
                    // companyId가 없으면 빈 리스트 반환 (에러가 아닌 빈 결과로 처리)
                    return new ApiResponse<>(true, "조회 성공", new java.util.ArrayList<>());
                }
            } else {
                companyId = tempCompanyId;
            }
            
            // 회사별 역할 확인 (user_company_tb 기준)
            List<UserCompanyDto> userCompanies = userService.getUserCompanies(userId);
            boolean hasPermission = userCompanies.stream()
                .anyMatch(uc -> uc.getCompanyId().equals(companyId) 
                    && "APPROVED".equals(uc.getApprovalStatus())
                    && ("CEO".equals(uc.getRole()) || "ADMIN".equals(uc.getRole())));
            
            if (!hasPermission) {
                return new ApiResponse<>(false, "CEO 또는 ADMIN 권한이 필요합니다.", null);
            }
            
            List<UserDto> pendingUsers = userService.findPendingUsers(companyId);
            // 비밀번호 제거
            pendingUsers.forEach(user -> user.setPassword(null));
            return new ApiResponse<>(true, "조회 성공", pendingUsers);
        } catch (Exception e) {
            logger.error("승인 대기 사용자 목록 조회 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    /**
     * 회사별 사용자 목록 조회 API (CEO, ADMIN 전용)
     * 주소: GET /api/users/company
     */
    @Operation(summary = "회사별 사용자 목록 조회", description = "CEO 또는 ADMIN이 자기 회사의 직원 목록을 조회합니다.")
    @GetMapping("/users/company")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<List<UserDto>> getCompanyUsers() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            if (companyId == null) {
                // ADMIN이 회사를 선택하지 않은 경우, 사용자 정보에서 companyId 가져오기
                Long userId = SecurityUtil.getCurrentUserId();
                UserDto currentUser = userService.selectUserById(userId);
                if (currentUser != null && currentUser.getCompanyId() != null) {
                    companyId = currentUser.getCompanyId();
                } else {
                    return new ApiResponse<>(false, "회사 정보가 없습니다.", null);
                }
            }
            List<UserDto> users = userService.getUsersByCompanyId(companyId);
            // 비밀번호 제거
            users.forEach(user -> user.setPassword(null));
            logger.info("회사별 사용자 목록 조회 완료 - companyId: {}, count: {}", companyId, users.size());
            return new ApiResponse<>(true, "회사별 사용자 목록 조회 성공", users);
        } catch (Exception e) {
            logger.error("회사별 사용자 목록 조회 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    /**
     * 특정 회사별 사용자 목록 조회 API (CEO, ADMIN 전용)
     * 주소: GET /api/users/company/{companyId}
     */
    @Operation(summary = "특정 회사별 사용자 목록 조회", description = "CEO 또는 ADMIN이 특정 회사의 직원 목록을 조회합니다.")
    @GetMapping("/users/company/{companyId}")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<List<UserDto>> getCompanyUsersById(@PathVariable Long companyId) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            
            // 작업 수행자가 해당 회사에 소속되어 있는지 확인 (활성화 여부와 관계없이)
            List<UserCompanyDto> myCompanies = userService.getUserCompanies(userId);
            boolean hasAccess = myCompanies.stream()
                .anyMatch(uc -> uc.getCompanyId().equals(companyId));
            
            if (!hasAccess) {
                return new ApiResponse<>(false, "해당 회사에 대한 권한이 없습니다.", null);
            }
            
            List<UserDto> users = userService.getUsersByCompanyId(companyId);
            users.forEach(user -> user.setPassword(null));
            logger.info("회사별 사용자 목록 조회 완료 - companyId: {}, count: {}", companyId, users.size());
            return new ApiResponse<>(true, "회사별 사용자 목록 조회 성공", users);
        } catch (Exception e) {
            logger.error("회사별 사용자 목록 조회 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "회사 전환", description = "사용자가 소속된 다른 회사로 전환합니다. (JWT 토큰 재발급)")
    @PostMapping("/users/switch-company")
    public ApiResponse<Map<String, Object>> switchCompany(@RequestBody CompanySwitchRequest request) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            logger.info("회사 전환 시도 - userId: {}, companyId: {}", userId, request.getCompanyId());
            
            // 사용자가 해당 회사에 소속되어 있는지 확인
            List<UserCompanyDto> companies = userService.getUserCompanies(userId);
            boolean isMember = companies.stream()
                .anyMatch(uc -> uc.getCompanyId().equals(request.getCompanyId()));
            
            if (!isMember) {
                return new ApiResponse<>(false, "해당 회사에 소속되어 있지 않습니다.", null);
            }
            
            // 기본 회사 설정
            userService.switchPrimaryCompany(userId, request.getCompanyId());
            
            // 사용자 정보 조회 (회사별 역할 가져오기)
            UserCompanyDto userCompany = companies.stream()
                .filter(uc -> uc.getCompanyId().equals(request.getCompanyId()))
                .findFirst()
                .orElse(null);
            
            if (userCompany == null) {
                return new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null);
            }
            
            // 사용자 기본 정보 조회 (username 가져오기)
            UserDto user = userService.selectUserById(userId);
            if (user == null) {
                return new ApiResponse<>(false, "사용자 정보를 찾을 수 없습니다.", null);
            }
            
            // JWT 토큰 재발급 (회사별 role 사용)
            String token = jwtUtil.generateToken(
                userId, 
                user.getUsername(), 
                userCompany.getRole(), // 회사별 role 사용
                request.getCompanyId()
            );
            String refreshToken = jwtUtil.generateRefreshToken(
                userId, 
                user.getUsername(), 
                userCompany.getRole(), // 회사별 role 사용
                request.getCompanyId()
            );
            
            // 사용자 정보 조회 (이미 위에서 조회함)
            user.setPassword(null);
            // JWT 토큰의 companyId를 설정 (현재 활성 회사)
            user.setCompanyId(request.getCompanyId());
            // 회사별 role로 업데이트 (프론트엔드에서 권한 체크에 사용)
            user.setRole(userCompany.getRole());
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("user", user);
            responseData.put("token", token);
            responseData.put("refreshToken", refreshToken);
            
            logger.info("회사 전환 완료 - userId: {}, companyId: {}", userId, request.getCompanyId());
            return new ApiResponse<>(true, "회사 전환이 완료되었습니다.", responseData);
        } catch (Exception e) {
            logger.error("회사 전환 중 오류 발생", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "회사 지원 요청", description = "현재 사용자가 회사에 지원 요청을 합니다.")
    @PostMapping("/users/companies/apply")
    public ApiResponse<String> applyToCompany(@Valid @RequestBody CompanyApplyRequest request) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            logger.info("회사 지원 요청 - userId: {}, companyId: {}, role: {}", userId, request.getCompanyId(), request.getRole());
            
            int result = userService.applyToCompany(userId, request.getCompanyId(), request.getRole(), request.getPosition());
            if (result > 0) {
                logger.info("회사 지원 요청 완료 - userId: {}, companyId: {}", userId, request.getCompanyId());
                return new ApiResponse<>(true, "회사 지원 요청이 완료되었습니다. 관리자 승인을 기다려주세요.", null);
            } else {
                return new ApiResponse<>(false, "회사 지원 요청에 실패했습니다.", null);
            }
        } catch (Exception e) {
            logger.error("회사 지원 요청 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "소속 회사 목록 조회", description = "현재 사용자가 소속된 회사 목록을 조회합니다. (APPROVED만)")
    @GetMapping("/users/companies")
    public ApiResponse<List<UserCompanyDto>> getUserCompanies() {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            List<UserCompanyDto> companies = userService.getUserCompanies(userId);
            return new ApiResponse<>(true, "조회 성공", companies);
        } catch (Exception e) {
            logger.error("소속 회사 목록 조회 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "승인 대기 회사 목록 조회", description = "현재 사용자의 승인 대기 회사 목록을 조회합니다.")
    @GetMapping("/users/companies/pending")
    public ApiResponse<List<UserCompanyDto>> getPendingCompanies() {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            List<UserCompanyDto> companies = userService.getUserCompaniesByStatus(userId, "PENDING");
            return new ApiResponse<>(true, "조회 성공", companies);
        } catch (Exception e) {
            logger.error("승인 대기 회사 목록 조회 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "기본 회사 설정", description = "현재 사용자의 기본 회사를 설정합니다.")
    @PutMapping("/users/companies/{companyId}/primary")
    public ApiResponse<String> setPrimaryCompany(@PathVariable Long companyId) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            logger.info("기본 회사 설정 - userId: {}, companyId: {}", userId, companyId);
            
            int result = userService.switchPrimaryCompany(userId, companyId);
            if (result > 0) {
                logger.info("기본 회사 설정 완료 - userId: {}, companyId: {}", userId, companyId);
                return new ApiResponse<>(true, "기본 회사가 설정되었습니다.", null);
            } else {
                return new ApiResponse<>(false, "기본 회사 설정에 실패했습니다.", null);
            }
        } catch (Exception e) {
            logger.error("기본 회사 설정 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "회사 탈퇴", description = "현재 사용자가 회사에서 탈퇴합니다.")
    @DeleteMapping("/users/companies/{companyId}")
    public ApiResponse<String> removeUserFromCompany(@PathVariable Long companyId) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            logger.info("회사 탈퇴 - userId: {}, companyId: {}", userId, companyId);
            
            int result = userService.removeUserFromCompany(userId, companyId);
            if (result > 0) {
                logger.info("회사 탈퇴 완료 - userId: {}, companyId: {}", userId, companyId);
                return new ApiResponse<>(true, "회사에서 탈퇴했습니다.", null);
            } else {
                return new ApiResponse<>(false, "회사 탈퇴에 실패했습니다.", null);
            }
        } catch (Exception e) {
            logger.error("회사 탈퇴 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "사용자를 회사에 추가", description = "ADMIN/CEO가 사용자를 회사에 직접 추가합니다.")
    @PostMapping("/users/{userId}/companies")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<String> addUserToCompany(
            @PathVariable Long userId,
            @Valid @RequestBody AddUserToCompanyRequest request) {
        try {
            Long operatorId = SecurityUtil.getCurrentUserId();
            logger.info("사용자 회사 추가 - operatorId: {}, userId: {}, companyId: {}", operatorId, userId, request.getCompanyId());
            
            int result = userService.addUserToCompany(userId, request.getCompanyId(), request.getRole(), request.getPosition());
            if (result > 0) {
                logger.info("사용자 회사 추가 완료 - userId: {}, companyId: {}", userId, request.getCompanyId());
                return new ApiResponse<>(true, "사용자가 회사에 추가되었습니다.", null);
            } else {
                return new ApiResponse<>(false, "사용자 회사 추가에 실패했습니다.", null);
            }
        } catch (Exception e) {
            logger.error("사용자 회사 추가 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "회사 지원 요청 승인", description = "ADMIN/CEO가 회사 지원 요청을 승인합니다.")
    @PutMapping("/users/{userId}/companies/{companyId}/approve")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<String> approveUserCompany(
            @PathVariable Long userId,
            @PathVariable Long companyId) {
        try {
            Long operatorId = SecurityUtil.getCurrentUserId();
            logger.info("회사 소속 승인 - operatorId: {}, userId: {}, companyId: {}", operatorId, userId, companyId);
            
            userService.approveUserCompany(userId, companyId, operatorId);
            logger.info("회사 소속 승인 완료 - userId: {}, companyId: {}", userId, companyId);
            return new ApiResponse<>(true, "회사 소속이 승인되었습니다.", null);
        } catch (Exception e) {
            logger.error("회사 소속 승인 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Operation(summary = "회사 지원 요청 거부", description = "ADMIN/CEO가 회사 지원 요청을 거부합니다.")
    @PutMapping("/users/{userId}/companies/{companyId}/reject")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ApiResponse<String> rejectUserCompany(
            @PathVariable Long userId,
            @PathVariable Long companyId) {
        try {
            Long operatorId = SecurityUtil.getCurrentUserId();
            logger.info("회사 소속 거부 - operatorId: {}, userId: {}, companyId: {}", operatorId, userId, companyId);
            
            userService.rejectUserCompany(userId, companyId, operatorId);
            logger.info("회사 소속 거부 완료 - userId: {}, companyId: {}", userId, companyId);
            return new ApiResponse<>(true, "회사 소속이 거부되었습니다.", null);
        } catch (Exception e) {
            logger.error("회사 소속 거부 실패", e);
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    @Data
    static class UpdateRoleRequest {
        @jakarta.validation.constraints.NotBlank(message = "role은 필수입니다.")
        private String role;
    }
    
    @Data
    static class ApprovalRequest {
        @jakarta.validation.constraints.NotBlank(message = "action은 필수입니다.")
        private String action; // APPROVE or REJECT
    }
    
    @Data
    static class CompanySwitchRequest {
        @jakarta.validation.constraints.NotNull(message = "companyId는 필수입니다.")
        private Long companyId;
        
        @jakarta.validation.constraints.NotBlank(message = "현재 토큰은 필수입니다.")
        private String currentToken;
    }
    
    @Data
    static class CompanyApplyRequest {
        @jakarta.validation.constraints.NotNull(message = "companyId는 필수입니다.")
        private Long companyId;
        
        private String role;
        private String position;
    }
    
    @Data
    static class AddUserToCompanyRequest {
        @jakarta.validation.constraints.NotNull(message = "companyId는 필수입니다.")
        private Long companyId;
        
        private String role;
        private String position;
    }
    
    // ========== 서명/도장 관리 API ==========
    
    /**
     * 내 서명/도장 목록 조회
     * GET /api/users/me/signatures
     */
    @Operation(summary = "내 서명/도장 목록 조회", description = "현재 로그인한 사용자의 서명/도장 목록을 조회합니다.")
    @GetMapping("/users/me/signatures")
    public ApiResponse<List<UserSignatureDto>> getMySignatures() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            return new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null);
        }
        logger.info("내 서명/도장 목록 조회 요청 - userId: {}, companyId: {}", currentUserId, companyId);
        List<UserSignatureDto> signatures = userSignatureService.getSignatures(currentUserId, companyId);
        return new ApiResponse<>(true, "서명/도장 목록 조회 성공", signatures);
    }
    
    /**
     * 서명/도장 생성
     * POST /api/users/me/signatures
     */
    @Operation(summary = "서명/도장 생성", description = "새로운 서명/도장을 생성합니다.")
    @PostMapping("/users/me/signatures")
    public ApiResponse<UserSignatureDto> createSignature(@Valid @RequestBody UserSignatureDto signatureDto) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            return new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null);
        }
        logger.info("서명/도장 생성 요청 - userId: {}, companyId: {}, signatureName: {}", 
            currentUserId, companyId, signatureDto.getSignatureName());
        try {
            UserSignatureDto createdSignature = userSignatureService.createSignature(signatureDto, currentUserId, companyId);
            logger.info("서명/도장 생성 완료 - signatureId: {}", createdSignature.getSignatureId());
            return new ApiResponse<>(true, "서명/도장이 생성되었습니다.", createdSignature);
        } catch (BusinessException e) {
            logger.warn("서명/도장 생성 실패 - userId: {}, reason: {}", currentUserId, e.getMessage());
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    /**
     * 서명/도장 수정
     * PUT /api/users/me/signatures/{signatureId}
     */
    @Operation(summary = "서명/도장 수정", description = "서명/도장을 수정합니다.")
    @PutMapping("/users/me/signatures/{signatureId}")
    public ApiResponse<UserSignatureDto> updateSignature(
            @PathVariable Long signatureId,
            @Valid @RequestBody UserSignatureDto signatureDto) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            return new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null);
        }
        logger.info("서명/도장 수정 요청 - signatureId: {}, userId: {}", signatureId, currentUserId);
        try {
            UserSignatureDto updatedSignature = userSignatureService.updateSignature(signatureId, signatureDto, currentUserId, companyId);
            logger.info("서명/도장 수정 완료 - signatureId: {}", signatureId);
            return new ApiResponse<>(true, "서명/도장이 수정되었습니다.", updatedSignature);
        } catch (BusinessException | com.innersignature.backend.exception.ResourceNotFoundException e) {
            logger.warn("서명/도장 수정 실패 - signatureId: {}, reason: {}", signatureId, e.getMessage());
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    /**
     * 서명/도장 삭제
     * DELETE /api/users/me/signatures/{signatureId}
     */
    @Operation(summary = "서명/도장 삭제", description = "서명/도장을 삭제합니다.")
    @DeleteMapping("/users/me/signatures/{signatureId}")
    public ApiResponse<Void> deleteSignature(@PathVariable Long signatureId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            return new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null);
        }
        logger.info("서명/도장 삭제 요청 - signatureId: {}, userId: {}", signatureId, currentUserId);
        try {
            userSignatureService.deleteSignature(signatureId, currentUserId, companyId);
            logger.info("서명/도장 삭제 완료 - signatureId: {}", signatureId);
            return new ApiResponse<>(true, "서명/도장이 삭제되었습니다.", null);
        } catch (BusinessException | com.innersignature.backend.exception.ResourceNotFoundException e) {
            logger.warn("서명/도장 삭제 실패 - signatureId: {}, reason: {}", signatureId, e.getMessage());
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
    
    /**
     * 기본 서명/도장 설정
     * PUT /api/users/me/signatures/{signatureId}/set-default
     */
    @Operation(summary = "기본 서명/도장 설정", description = "서명/도장을 기본으로 설정합니다.")
    @PutMapping("/users/me/signatures/{signatureId}/set-default")
    public ApiResponse<UserSignatureDto> setDefaultSignature(@PathVariable Long signatureId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            return new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null);
        }
        logger.info("기본 서명/도장 설정 요청 - signatureId: {}, userId: {}", signatureId, currentUserId);
        try {
            UserSignatureDto updatedSignature = userSignatureService.setDefaultSignature(signatureId, currentUserId, companyId);
            logger.info("기본 서명/도장 설정 완료 - signatureId: {}", signatureId);
            return new ApiResponse<>(true, "기본 서명/도장이 설정되었습니다.", updatedSignature);
        } catch (BusinessException | com.innersignature.backend.exception.ResourceNotFoundException e) {
            logger.warn("기본 서명/도장 설정 실패 - signatureId: {}, reason: {}", signatureId, e.getMessage());
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
}