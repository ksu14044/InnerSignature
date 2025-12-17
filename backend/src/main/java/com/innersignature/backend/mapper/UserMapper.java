package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.UserDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    // 파라미터가 2개 이상일 때는 @Param을 붙여야 XML에서 인식합니다.
    UserDto login(@Param("username") String username, @Param("password") String password);

    // ADMIN 권한을 가진 활성 사용자들을 조회합니다. (특정 회사의 ADMIN만 조회)
    List<UserDto> findAdminUsers(@Param("companyId") Long companyId);

    // 사용자 등록
    int register(UserDto userDto);

    // 사용자명으로 사용자 조회 (비밀번호 포함)
    UserDto findByUsername(@Param("username") String username);

    // 사용자 ID로 조회
    UserDto selectUserById(Long userId);

    // 역할별 사용자 목록 조회 (특정 회사의 사용자만 조회)
    List<UserDto> selectUsersByRole(@Param("role") String role, @Param("companyId") Long companyId);

    // 전체 사용자 목록 조회
    List<UserDto> selectAllUsers();

    // 사용자 정보 수정
    int updateUser(UserDto userDto);

    // 사용자 삭제 (soft delete)
    int deleteUser(@Param("userId") Long userId);

    // 역할별 사용자 수 조회
    int countUsersByRole(@Param("role") String role);

    // 비밀번호 변경
    int updatePassword(@Param("userId") Long userId, @Param("password") String password);

    // 이메일과 이름으로 사용자 조회 (아이디 찾기용)
    UserDto findByEmailAndKoreanName(@Param("email") String email, @Param("koreanName") String koreanName);

    // 이메일로 사용자 조회
    UserDto findByEmail(@Param("email") String email);

    // 사용자명 존재 여부 확인 (companyId 고려)
    boolean isUsernameExists(@Param("username") String username, @Param("companyId") Long companyId);
    
    // 이메일 존재 여부 확인 (companyId 고려)
    boolean isEmailExists(@Param("email") String email, @Param("companyId") Long companyId);
    
    // 승인 대기 사용자 목록 조회
    List<UserDto> findPendingUsers(@Param("companyId") Long companyId);
    
    // 회사별 사용자 목록 조회
    List<UserDto> selectUsersByCompanyId(@Param("companyId") Long companyId);
}