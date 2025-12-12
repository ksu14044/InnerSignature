package com.innersignature.backend.service;

import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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
        // 이메일 중복 체크 (이메일이 제공된 경우)
        if (userDto.getEmail() != null && !userDto.getEmail().isEmpty()) {
            if (userMapper.isEmailExists(userDto.getEmail())) {
                throw new BusinessException("이미 사용 중인 이메일입니다.");
            }
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(userDto.getPassword());
        userDto.setPassword(encodedPassword);

        return userMapper.register(userDto);
    }

    /**
     * 사용자명 존재 여부 확인
     * @param username 사용자명
     * @return 존재하면 true, 없으면 false
     */
    public boolean isUsernameExists(String username) {
        UserDto user = userMapper.findByUsername(username);
        return user != null;
    }

    /**
     * ADMIN 권한을 가진 사용자 목록 조회
     * @return ADMIN 사용자 목록
     */
    public List<UserDto> findAdminUsers() {
        return userMapper.findAdminUsers();
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
     * 역할별 사용자 목록 조회
     * @param role 사용자 역할
     * @return 해당 역할의 사용자 목록
     */
    public List<UserDto> selectUsersByRole(String role) {
        return userMapper.selectUsersByRole(role);
    }

    /**
     * 전체 사용자 목록 조회
     * @return 전체 사용자 목록
     */
    public List<UserDto> getAllUsers() {
        return userMapper.selectAllUsers();
    }

    /**
     * 사용자 정보 수정
     * @param userDto 수정할 사용자 정보
     * @param operatorId 작업 수행자 ID
     * @return 수정 성공 시 1, 실패 시 0
     */
    public int updateUser(UserDto userDto, Long operatorId) {
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

        // 이메일 중복 체크 (이메일이 제공된 경우)
        if (userDto.getEmail() != null && !userDto.getEmail().isEmpty()) {
            if (userMapper.isEmailExists(userDto.getEmail())) {
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
     * 이메일 존재 여부 확인
     * @param email 이메일 주소
     * @return 존재하면 true, 없으면 false
     */
    public boolean isEmailExists(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return userMapper.isEmailExists(email);
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
}
