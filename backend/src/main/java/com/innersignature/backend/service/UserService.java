package com.innersignature.backend.service;

import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.dto.UserCompanyDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final com.innersignature.backend.util.SubscriptionUtil subscriptionUtil;

    /**
     * 사용자 인증 (로그인)
     * @param username 사용자명
     * @param rawPassword 평문 비밀번호
     * @return 인증 성공 시 UserDto, 실패 시 null
     */
    public UserDto authenticate(String username, String rawPassword) {
        // 사용자명으로 사용자 정보 조회 (비밀번호 제외)
        UserDto user = userMapper.findByUsername(username);
        if (user == null) {
            return null;
        }

        // 저장된 암호화된 비밀번호와 입력된 평문 비밀번호 비교
        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return user;
        }

        return null;
    }

    /**
     * 사용자 등록
     * @param userDto 사용자 정보 (비밀번호는 평문)
     * @return 등록 성공 시 1, 실패 시 0
     */
    public int register(UserDto userDto) {
        // 빈 문자열 이메일을 NULL로 변환 (UNIQUE 제약 조건 문제 방지)
        if (userDto.getEmail() != null && userDto.getEmail().trim().isEmpty()) {
            userDto.setEmail(null);
        }
        
        // 이메일 중복 체크 (이메일이 제공된 경우, companyId 고려)
        if (userDto.getEmail() != null && !userDto.getEmail().isEmpty()) {
            if (userMapper.isEmailExists(userDto.getEmail(), userDto.getCompanyId())) {
                throw new BusinessException("이미 사용 중인 이메일입니다.");
            }
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(userDto.getPassword());
        userDto.setPassword(encodedPassword);

        return userMapper.register(userDto);
    }

    /**
     * 사용자명으로 사용자 조회
     * @param username 사용자명
     * @return 사용자 정보 (없으면 null)
     */
    public UserDto findByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    /**
     * 사용자명 존재 여부 확인 (전역 검색)
     * @param username 사용자명
     * @return 존재하면 true, 없으면 false
     */
    public boolean isUsernameExists(String username) {
        return userMapper.isUsernameExists(username, null);
    }

    /**
     * ADMIN 권한을 가진 사용자 목록 조회 (특정 회사의 ADMIN만 조회)
     * @param companyId 회사 ID
     * @return 해당 회사의 ADMIN 사용자 목록
     */
    public List<UserDto> findAdminUsers(Long companyId) {
        return userMapper.findAdminUsers(companyId);
    }

    /**
     * 사용자 ID로 사용자 정보 조회
     * @param userId 사용자 ID
     * @return 사용자 정보 (없으면 null)
     */
    public UserDto selectUserById(Long userId) {
        return userMapper.selectUserById(userId);
    }

    /**
     * 역할별 사용자 목록 조회 (특정 회사의 사용자만 조회)
     * @param role 사용자 역할
     * @param companyId 회사 ID
     * @return 해당 회사의 해당 역할의 사용자 목록
     */
    public List<UserDto> selectUsersByRole(String role, Long companyId) {
        return userMapper.selectUsersByRole(role, companyId);
    }

    /**
     * 전체 사용자 목록 조회
     * @return 전체 사용자 목록
     */
    public List<UserDto> getAllUsers() {
        return userMapper.selectAllUsers();
    }

    /**
     * 회사별 사용자 목록 조회
     * @param companyId 회사 ID
     * @return 해당 회사의 사용자 목록
     */
    public List<UserDto> getUsersByCompanyId(Long companyId) {
        return userMapper.selectUsersByCompanyId(companyId);
    }

    /**
     * 사용자 정보 수정
     * @param userDto 수정할 사용자 정보
     * @param operatorId 작업 수행자 ID
     * @return 수정 성공 시 1, 실패 시 0
     */
    public int updateUser(UserDto userDto, Long operatorId) {
        // 빈 문자열 이메일을 NULL로 변환 (UNIQUE 제약 조건 문제 방지)
        if (userDto.getEmail() != null && userDto.getEmail().trim().isEmpty()) {
            userDto.setEmail(null);
        }
        // 사용자 존재 확인
        UserDto existingUser = userMapper.selectUserById(userDto.getUserId());
        if (existingUser == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }

        // 자기 자신의 role 변경 방지
        if (userDto.getUserId().equals(operatorId) && 
            !existingUser.getRole().equals(userDto.getRole())) {
            throw new BusinessException("자기 자신의 role을 변경할 수 없습니다.");
        }

        // 마지막 SUPERADMIN의 role 변경 방지
        if ("SUPERADMIN".equals(existingUser.getRole()) && 
            !"SUPERADMIN".equals(userDto.getRole())) {
            int superAdminCount = userMapper.countUsersByRole("SUPERADMIN");
            if (superAdminCount <= 1) {
                throw new BusinessException("마지막 SUPERADMIN의 role을 변경할 수 없습니다.");
            }
        }

        // 이메일 중복 체크 (이메일이 변경되고 다른 사용자가 사용 중인 경우)
        if (userDto.getEmail() != null && !userDto.getEmail().isEmpty()) {
            UserDto userWithEmail = userMapper.findByEmail(userDto.getEmail());
            if (userWithEmail != null && !userWithEmail.getUserId().equals(userDto.getUserId())) {
                throw new BusinessException("이미 사용 중인 이메일입니다.");
            }
        }

        return userMapper.updateUser(userDto);
    }

    /**
     * 사용자 삭제 (soft delete)
     * @param userId 삭제할 사용자 ID
     * @param operatorId 작업 수행자 ID
     * @return 삭제 성공 시 1, 실패 시 0
     */
    public int deleteUser(Long userId, Long operatorId) {
        // 사용자 존재 확인
        UserDto existingUser = userMapper.selectUserById(userId);
        if (existingUser == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }

        // 자기 자신 삭제 방지
        if (userId.equals(operatorId)) {
            throw new BusinessException("자기 자신을 삭제할 수 없습니다.");
        }

        // 마지막 SUPERADMIN 삭제 방지
        if ("SUPERADMIN".equals(existingUser.getRole())) {
            int superAdminCount = userMapper.countUsersByRole("SUPERADMIN");
            if (superAdminCount <= 1) {
                throw new BusinessException("마지막 SUPERADMIN을 삭제할 수 없습니다.");
            }
        }

        return userMapper.deleteUser(userId);
    }

    /**
     * 사용자 생성 (SUPERADMIN 전용)
     * @param userDto 생성할 사용자 정보
     * @param operatorId 작업 수행자 ID
     * @return 생성된 사용자 ID
     */
    public Long createUser(UserDto userDto, Long operatorId) {
        // SUPERADMIN role 직접 생성 방지
        if ("SUPERADMIN".equals(userDto.getRole())) {
            throw new BusinessException("SUPERADMIN role은 API로 생성할 수 없습니다.");
        }

        // 사용자명 중복 확인
        if (userMapper.findByUsername(userDto.getUsername()) != null) {
            throw new BusinessException("이미 존재하는 사용자명입니다.");
        }

        // 이메일 중복 체크 (이메일이 제공된 경우, companyId 고려)
        if (userDto.getEmail() != null && !userDto.getEmail().isEmpty()) {
            if (userMapper.isEmailExists(userDto.getEmail(), userDto.getCompanyId())) {
                throw new BusinessException("이미 사용 중인 이메일입니다.");
            }
        }

        // 비밀번호 암호화
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(userDto.getPassword());
            userDto.setPassword(encodedPassword);
        }

        // 기본값 설정
        if (userDto.getRole() == null || userDto.getRole().isEmpty()) {
            userDto.setRole("USER");
        }
        if (userDto.getIsActive() == null) {
            userDto.setIsActive(true);
        }

        int result = userMapper.register(userDto);
        if (result > 0) {
            // 생성된 사용자 ID 조회
            UserDto createdUser = userMapper.findByUsername(userDto.getUsername());
            return createdUser != null ? createdUser.getUserId() : null;
        }
        return null;
    }

    /**
     * 역할별 사용자 수 조회
     * @param role 역할
     * @return 해당 역할의 사용자 수
     */
    public int countUsersByRole(String role) {
        return userMapper.countUsersByRole(role);
    }

    /**
     * 비밀번호 변경
     * @param userId 사용자 ID
     * @param currentPassword 현재 비밀번호 (평문)
     * @param newPassword 새 비밀번호 (평문)
     * @return 변경 성공 시 true, 실패 시 false
     */
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        // 사용자 정보 조회
        UserDto user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호 암호화
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        
        // 비밀번호 변경
        int result = userMapper.updatePassword(userId, encodedNewPassword);
        return result > 0;
    }

    /**
     * 이메일 존재 여부 확인 (companyId 고려)
     * @param email 이메일 주소
     * @param companyId 회사 ID (null이면 전역 검색)
     * @return 존재하면 true, 없으면 false
     */
    public boolean isEmailExists(String email, Long companyId) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return userMapper.isEmailExists(email, companyId);
    }

    /**
     * 이메일과 이름으로 아이디 찾기
     * @param email 이메일 주소
     * @param koreanName 이름
     * @return 사용자 정보 (없으면 null)
     */
    public UserDto findUsernameByEmailAndName(String email, String koreanName) {
        if (email == null || email.isEmpty() || koreanName == null || koreanName.isEmpty()) {
            return null;
        }
        return userMapper.findByEmailAndKoreanName(email, koreanName);
    }

    /**
     * 비밀번호 재설정 요청
     * @param email 이메일 주소
     * @return 사용자 정보 (없으면 null)
     */
    public UserDto requestPasswordReset(String email) {
        if (email == null || email.isEmpty()) {
            return null;
        }
        return userMapper.findByEmail(email);
    }
    
    /**
     * 사용자를 회사에 할당
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @return 할당 성공 시 1, 실패 시 0
     */
    public int assignToCompany(Long userId, Long companyId) {
        UserDto user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }
        
        user.setCompanyId(companyId);
        return userMapper.updateUser(user);
    }
    
    /**
     * 사용자 role 변경 (CEO, ADMIN 전용)
     * @param userId 변경할 사용자 ID
     * @param newRole 새로운 role
     * @param operatorId 작업 수행자 ID (CEO 또는 ADMIN)
     * @return 변경 성공 시 1, 실패 시 0
     */
    public int updateUserRole(Long userId, String newRole, Long operatorId) {
        // 사용자 존재 확인
        UserDto user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }
        
        // 작업 수행자가 CEO 또는 ADMIN인지 확인
        UserDto operator = userMapper.selectUserById(operatorId);
        if (operator == null || (!"CEO".equals(operator.getRole()) && !"ADMIN".equals(operator.getRole()))) {
            throw new BusinessException("CEO 또는 ADMIN 권한이 필요합니다.");
        }
        
        // 작업 수행자가 소속된 회사 목록 조회
        List<UserCompanyDto> operatorCompanies = userMapper.findUserCompanies(operatorId);
        if (operatorCompanies == null || operatorCompanies.isEmpty()) {
            throw new BusinessException("작업 수행자가 소속된 회사가 없습니다.");
        }
        
        // 작업 수행자의 기본 회사 또는 첫 번째 회사 사용
        Long companyId = operatorCompanies.stream()
            .filter(uc -> Boolean.TRUE.equals(uc.getIsPrimary()))
            .map(UserCompanyDto::getCompanyId)
            .findFirst()
            .orElse(operatorCompanies.get(0).getCompanyId());
        
        // 대상 사용자가 해당 회사에 소속되어 있는지 확인
        List<UserCompanyDto> userCompanies = userMapper.findUserCompanies(userId);
        boolean userBelongsToCompany = userCompanies.stream()
            .anyMatch(uc -> uc.getCompanyId().equals(companyId) && "APPROVED".equals(uc.getApprovalStatus()));
        
        if (!userBelongsToCompany) {
            throw new BusinessException("같은 회사의 사용자만 role을 변경할 수 있습니다.");
        }
        
        // role 검증 (USER, ADMIN, ACCOUNTANT, TAX_ACCOUNTANT만 변경 가능, CEO는 변경 불가)
        if (!"USER".equals(newRole) && !"ADMIN".equals(newRole) && !"ACCOUNTANT".equals(newRole) && !"TAX_ACCOUNTANT".equals(newRole)) {
            throw new BusinessException("올바른 role을 선택해주세요. (USER, ADMIN, ACCOUNTANT, TAX_ACCOUNTANT)");
        }
        
        // 자기 자신의 role 변경 방지
        if (userId.equals(operatorId)) {
            throw new BusinessException("자기 자신의 role을 변경할 수 없습니다.");
        }
        
        // user_company_tb에서 기존 position 가져오기
        String existingPosition = userCompanies.stream()
            .filter(uc -> uc.getCompanyId().equals(companyId))
            .map(UserCompanyDto::getPosition)
            .findFirst()
            .orElse(null);
        
        // user_company_tb의 role 업데이트
        UserCompanyDto userCompanyDto = new UserCompanyDto();
        userCompanyDto.setUserId(userId);
        userCompanyDto.setCompanyId(companyId);
        userCompanyDto.setRole(newRole);
        userCompanyDto.setPosition(existingPosition); // 기존 position 유지
        
        int companyResult = userMapper.updateUserCompanyRole(userCompanyDto);
        
        // user_tb의 role도 함께 업데이트
        user.setRole(newRole);
        int userResult = userMapper.updateUser(user);
        
        // 둘 다 성공했는지 확인
        if (companyResult > 0 && userResult > 0) {
            return 1;
        } else {
            throw new BusinessException("role 변경에 실패했습니다.");
        }
    }
    
    /**
     * 승인 대기 사용자 목록 조회
     * @param companyId 회사 ID
     * @return 승인 대기 사용자 목록
     */
    public List<UserDto> findPendingUsers(Long companyId) {
        return userMapper.findPendingUsers(companyId);
    }
    
    /**
     * 사용자 승인
     * @param userId 승인할 사용자 ID
     * @param operatorId 작업 수행자 ID (CEO 또는 ADMIN)
     */
    @Transactional
    public void approveUser(Long userId, Long operatorId) {
        UserDto user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }
        
        UserDto operator = userMapper.selectUserById(operatorId);
        if (operator == null || (!"CEO".equals(operator.getRole()) && !"ADMIN".equals(operator.getRole()))) {
            throw new BusinessException("승인 권한이 없습니다.");
        }
        
        if (user.getCompanyId() == null || !user.getCompanyId().equals(operator.getCompanyId())) {
            throw new BusinessException("같은 회사의 사용자만 승인할 수 있습니다.");
        }
        
        Long companyId = user.getCompanyId();
        
        // 구독 사용자 수 제한 체크
        int currentUserCount = subscriptionUtil.getCurrentUserCount(companyId);
        subscriptionUtil.checkUserLimit(companyId, currentUserCount);
        
        // user_tb의 approval_status 업데이트
        user.setApprovalStatus("APPROVED");
        user.setIsActive(true);
        userMapper.updateUser(user);
        
        // user_company_tb의 approval_status도 업데이트 (알람 목록에서 제거하기 위해 필요)
        int result = userMapper.approveUserCompany(userId, companyId);
        if (result == 0) {
            throw new BusinessException("회사 소속 승인 처리에 실패했습니다.");
        }
    }
    
    /**
     * 사용자 거부
     * @param userId 거부할 사용자 ID
     * @param operatorId 작업 수행자 ID (CEO 또는 ADMIN)
     */
    @Transactional
    public void rejectUser(Long userId, Long operatorId) {
        UserDto user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }
        
        UserDto operator = userMapper.selectUserById(operatorId);
        if (operator == null || (!"CEO".equals(operator.getRole()) && !"ADMIN".equals(operator.getRole()))) {
            throw new BusinessException("거부 권한이 없습니다.");
        }
        
        if (user.getCompanyId() == null || !user.getCompanyId().equals(operator.getCompanyId())) {
            throw new BusinessException("같은 회사의 사용자만 거부할 수 있습니다.");
        }
        
        Long companyId = user.getCompanyId();
        
        // user_tb의 approval_status 업데이트
        user.setApprovalStatus("REJECTED");
        user.setIsActive(false);
        userMapper.updateUser(user);
        
        // user_company_tb의 approval_status도 업데이트 (알람 목록에서 제거하기 위해 필요)
        int result = userMapper.rejectUserCompany(userId, companyId);
        if (result == 0) {
            throw new BusinessException("회사 소속 거부 처리에 실패했습니다.");
        }
    }
    
    /**
     * 사용자가 소속된 회사 목록 조회 (APPROVED만)
     * @param userId 사용자 ID
     * @return 소속된 회사 목록
     */
    public List<UserCompanyDto> getUserCompanies(Long userId) {
        return userMapper.findUserCompanies(userId);
    }
    
    /**
     * 승인 상태별 회사 목록 조회
     * @param userId 사용자 ID
     * @param status 승인 상태 (PENDING, APPROVED, REJECTED)
     * @return 승인 상태별 회사 목록
     */
    public List<UserCompanyDto> getUserCompaniesByStatus(Long userId, String status) {
        return userMapper.findUserCompaniesByStatus(userId, status);
    }
    
    /**
     * 회사에 지원 요청 (PENDING 상태)
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @param role 역할
     * @param position 직급
     * @return 추가 성공 시 1, 실패 시 0
     */
    @Transactional
    public int applyToCompany(Long userId, Long companyId, String role, String position) {
        // 사용자 존재 확인
        UserDto user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }
        
        // 이미 소속된 회사인지 확인
        List<UserCompanyDto> existing = userMapper.findUserCompaniesByStatus(userId, null);
        boolean alreadyExists = existing.stream()
            .anyMatch(uc -> uc.getCompanyId().equals(companyId));
        
        if (alreadyExists) {
            throw new BusinessException("이미 해당 회사에 소속되어 있거나 지원 요청이 있습니다.");
        }
        
        UserCompanyDto userCompanyDto = new UserCompanyDto();
        userCompanyDto.setUserId(userId);
        userCompanyDto.setCompanyId(companyId);
        userCompanyDto.setRole(role != null ? role : "USER");
        userCompanyDto.setPosition(position);
        userCompanyDto.setIsActive(true);
        userCompanyDto.setIsPrimary(false);
        
        return userMapper.applyToCompany(userCompanyDto);
    }
    
    /**
     * 사용자를 회사에 추가 (APPROVED 상태, ADMIN/CEO만 사용)
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @param role 역할
     * @param position 직급
     * @return 추가 성공 시 1, 실패 시 0
     */
    @Transactional
    public int addUserToCompany(Long userId, Long companyId, String role, String position) {
        // 사용자 존재 확인
        UserDto user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }
        
        // 구독 사용자 수 제한 체크
        int currentUserCount = subscriptionUtil.getCurrentUserCount(companyId);
        subscriptionUtil.checkUserLimit(companyId, currentUserCount);
        
        UserCompanyDto userCompanyDto = new UserCompanyDto();
        userCompanyDto.setUserId(userId);
        userCompanyDto.setCompanyId(companyId);
        userCompanyDto.setRole(role != null ? role : "USER");
        userCompanyDto.setPosition(position);
        userCompanyDto.setIsActive(true);
        userCompanyDto.setIsPrimary(false);
        
        return userMapper.addUserToCompany(userCompanyDto);
    }
    
    /**
     * 사용자를 회사에서 제거
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @return 제거 성공 시 1, 실패 시 0
     */
    @Transactional
    public int removeUserFromCompany(Long userId, Long companyId) {
        return userMapper.removeUserFromCompany(userId, companyId);
    }
    
    /**
     * 기본 회사 전환
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @return 전환 성공 시 1, 실패 시 0
     */
    @Transactional
    public int switchPrimaryCompany(Long userId, Long companyId) {
        // 사용자가 해당 회사에 소속되어 있는지 확인
        List<UserCompanyDto> companies = userMapper.findUserCompanies(userId);
        boolean isMember = companies.stream()
            .anyMatch(uc -> uc.getCompanyId().equals(companyId) && "APPROVED".equals(uc.getApprovalStatus()));
        
        if (!isMember) {
            throw new BusinessException("해당 회사에 소속되어 있지 않습니다.");
        }
        
        // 1) user_company_tb의 기본 회사 설정
        int result = userMapper.setPrimaryCompany(userId, companyId);
        // 2) user_tb.company_id 동기화
        userMapper.updateUserCompanyId(userId, companyId);
        
        return result;
    }
    
    /**
     * 회사의 승인 대기 사용자 목록 조회
     * @param companyId 회사 ID
     * @return 승인 대기 사용자 목록
     */
    public List<UserCompanyDto> findPendingCompanyApplications(Long companyId) {
        return userMapper.findPendingCompanyApplications(companyId);
    }
    
    /**
     * 회사 소속 승인
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @param operatorId 작업 수행자 ID (ADMIN/CEO)
     */
    @Transactional
    public void approveUserCompany(Long userId, Long companyId, Long operatorId) {
        // 작업 수행자 권한 확인
        UserDto operator = userMapper.selectUserById(operatorId);
        if (operator == null || (!"CEO".equals(operator.getRole()) && !"ADMIN".equals(operator.getRole()))) {
            throw new BusinessException("승인 권한이 없습니다.");
        }
        
        // 작업 수행자가 해당 회사에 소속되어 있는지 확인
        List<UserCompanyDto> operatorCompanies = userMapper.findUserCompanies(operatorId);
        boolean hasAccess = operatorCompanies.stream()
            .anyMatch(uc -> uc.getCompanyId().equals(companyId));
        
        if (!hasAccess) {
            throw new BusinessException("해당 회사에 대한 권한이 없습니다.");
        }
        
        // 구독 사용자 수 제한 체크
        int currentUserCount = subscriptionUtil.getCurrentUserCount(companyId);
        subscriptionUtil.checkUserLimit(companyId, currentUserCount);
        
        int result = userMapper.approveUserCompany(userId, companyId);
        if (result == 0) {
            throw new BusinessException("승인 처리에 실패했습니다.");
        }
    }
    
    /**
     * 회사 소속 거부
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @param operatorId 작업 수행자 ID (ADMIN/CEO)
     */
    @Transactional
    public void rejectUserCompany(Long userId, Long companyId, Long operatorId) {
        // 작업 수행자 권한 확인
        UserDto operator = userMapper.selectUserById(operatorId);
        if (operator == null || (!"CEO".equals(operator.getRole()) && !"ADMIN".equals(operator.getRole()))) {
            throw new BusinessException("거부 권한이 없습니다.");
        }
        
        // 작업 수행자가 해당 회사에 소속되어 있는지 확인
        List<UserCompanyDto> operatorCompanies = userMapper.findUserCompanies(operatorId);
        boolean hasAccess = operatorCompanies.stream()
            .anyMatch(uc -> uc.getCompanyId().equals(companyId));
        
        if (!hasAccess) {
            throw new BusinessException("해당 회사에 대한 권한이 없습니다.");
        }
        
        int result = userMapper.rejectUserCompany(userId, companyId);
        if (result == 0) {
            throw new BusinessException("거부 처리에 실패했습니다.");
        }
    }
}
