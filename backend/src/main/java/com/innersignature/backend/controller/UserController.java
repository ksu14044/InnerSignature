package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.security.JwtBlacklistService;
import com.innersignature.backend.service.EmailService;
import com.innersignature.backend.service.PasswordResetService;
import com.innersignature.backend.service.UserService;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final JwtBlacklistService jwtBlacklistService;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
        logger.info("로그인 시도 - username: {}", request.getUsername());
        UserDto user = userService.authenticate(request.getUsername(), request.getPassword());

        if (user != null) {
            // JWT 토큰 생성
            String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getUsername(), user.getRole());
            
            // 비밀번호는 보안상 프론트로 보내지 않는 게 좋습니다.
            user.setPassword(null);
            
            // 토큰과 사용자 정보 반환
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("user", user);
            responseData.put("token", token);
            responseData.put("refreshToken", refreshToken);
            
            logger.info("로그인 성공 - userId: {}, role: {}", user.getUserId(), user.getRole());
            SecurityLogger.loginSuccess(user.getUserId(), user.getUsername(), user.getRole());
            return new ApiResponse<>(true, "로그인 성공", responseData);
        } else {
            logger.warn("로그인 실패 - username: {}", request.getUsername());
            SecurityLogger.loginFailure(request.getUsername());
            return new ApiResponse<>(false, "아이디 또는 비밀번호가 틀렸습니다.", null);
        }
    }

    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("회원가입 시도 - username: {}, koreanName: {}", request.getUsername(), request.getKoreanName());
        
        // 중복 사용자명 체크
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
        newUser.setRole("USER"); // 기본 역할은 USER

        int result = userService.register(newUser);
        if (result > 0) {
            logger.info("회원가입 완료 - username: {}", request.getUsername());
            return new ApiResponse<>(true, "회원가입이 완료되었습니다.", null);
        } else {
            logger.error("회원가입 실패 - username: {}", request.getUsername());
            return new ApiResponse<>(false, "회원가입에 실패했습니다.", null);
        }
    }

    /**
     * ADMIN 사용자 목록 조회 API
     * 주소: GET /api/users/admins
     */
    @GetMapping("/users/admins")
    public ApiResponse<List<UserDto>> getAdminUsers() {
        try {
            List<UserDto> adminUsers = userService.findAdminUsers();
            return new ApiResponse<>(true, "ADMIN 사용자 목록 조회 성공", adminUsers);
        } catch (Exception e) {
            // printStackTrace 대신 예외를 던져서 전역 예외 핸들러에서 처리
            throw new RuntimeException("ADMIN 사용자 조회 중 오류 발생: " + e.getMessage(), e);
        }
    }

    /**
     * 전체 사용자 목록 조회 API (SUPERADMIN 전용)
     * 주소: GET /api/users
     */
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
    @PreAuthorize("hasRole('SUPERADMIN')")
    @DeleteMapping("/users/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("사용자 삭제 요청 - operatorId: {}, targetUserId: {}", currentUserId, userId);

        int result = userService.deleteUser(userId, currentUserId);
        if (result > 0) {
            SecurityLogger.userManagement("DELETE", currentUserId, userId, "soft delete");
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
    @GetMapping("/users/me")
    public ApiResponse<UserDto> getCurrentUser() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("현재 사용자 정보 조회 요청 - userId: {}", currentUserId);
        UserDto user = userService.selectUserById(currentUserId);
        if (user != null) {
            user.setPassword(null); // 비밀번호 제거
            logger.info("현재 사용자 정보 조회 완료 - userId: {}", currentUserId);
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
        String role = claims.get("role", String.class);

        // 리프레시 토큰 회전: 기존 토큰 블랙리스트 처리
        jwtBlacklistService.blacklist(refreshToken);

        String newAccessToken = jwtUtil.generateToken(userId, username, role);
        String newRefreshToken = jwtUtil.generateRefreshToken(userId, username, role);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", newAccessToken);
        responseData.put("refreshToken", newRefreshToken);

        return new ApiResponse<>(true, "토큰이 재발급되었습니다.", responseData);
    }

    /**
     * 로그아웃 (토큰 블랙리스트 처리)
     * 주소: POST /api/logout
     */
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
}