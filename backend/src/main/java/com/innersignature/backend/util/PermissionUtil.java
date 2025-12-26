package com.innersignature.backend.util;

import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.dto.UserCompanyDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 권한 체크를 위한 유틸리티 클래스
 */
@Component
@RequiredArgsConstructor
public class PermissionUtil {
    
    private final UserService userService;
    
    /**
     * 사용자가 문서의 작성자인지 확인
     * 
     * @param report 문서 정보
     * @param userId 확인할 사용자 ID
     * @return 작성자이면 true, 아니면 false
     */
    public boolean isOwner(ExpenseReportDto report, Long userId) {
        return report.getDrafterId().equals(userId);
    }
    
    /**
     * 사용자가 ADMIN 역할인지 확인 (현재 회사 기준)
     * 
     * @param userId 확인할 사용자 ID
     * @return ADMIN이면 true, 아니면 false
     */
    public boolean isAdmin(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId != null) {
            return hasRoleInCompany(userId, companyId, "ADMIN");
        }
        // companyId가 없는 경우 (SUPERADMIN 등) user_tb의 role 확인
        UserDto user = getUserOrThrow(userId);
        return "ADMIN".equals(user.getRole());
    }
    
    /**
     * 사용자가 CEO 역할인지 확인 (현재 회사 기준)
     * 
     * @param userId 확인할 사용자 ID
     * @return CEO이면 true, 아니면 false
     */
    public boolean isCEO(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId != null) {
            return hasRoleInCompany(userId, companyId, "CEO");
        }
        // companyId가 없는 경우 (SUPERADMIN 등) user_tb의 role 확인
        UserDto user = getUserOrThrow(userId);
        return "CEO".equals(user.getRole());
    }
    
    /**
     * 사용자가 ADMIN 또는 CEO 역할인지 확인 (현재 회사 기준)
     * CEO는 ADMIN의 모든 권한을 가지고 있음
     * 
     * @param userId 확인할 사용자 ID
     * @return ADMIN 또는 CEO이면 true, 아니면 false
     */
    public boolean isAdminOrCEO(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId != null) {
            return hasRoleInCompany(userId, companyId, "ADMIN") || hasRoleInCompany(userId, companyId, "CEO");
        }
        // companyId가 없는 경우 (SUPERADMIN 등) user_tb의 role 확인
        UserDto user = getUserOrThrow(userId);
        String role = user.getRole();
        return "ADMIN".equals(role) || "CEO".equals(role);
    }
    
    /**
     * 사용자가 ACCOUNTANT 역할인지 확인 (현재 회사 기준)
     * 
     * @param userId 확인할 사용자 ID
     * @return ACCOUNTANT이면 true, 아니면 false
     */
    public boolean isAccountant(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId != null) {
            return hasRoleInCompany(userId, companyId, "ACCOUNTANT");
        }
        // companyId가 없는 경우 (SUPERADMIN 등) user_tb의 role 확인
        UserDto user = getUserOrThrow(userId);
        return "ACCOUNTANT".equals(user.getRole());
    }
    
    /**
     * 사용자가 TAX_ACCOUNTANT 역할인지 확인 (현재 회사 기준)
     *
     * @param userId 확인할 사용자 ID
     * @return TAX_ACCOUNTANT이면 true, 아니면 false
     */
    public boolean isTaxAccountant(Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId != null) {
            return hasRoleInCompany(userId, companyId, "TAX_ACCOUNTANT");
        }
        // companyId가 없는 경우 (SUPERADMIN 등) user_tb의 role 확인
        UserDto user = getUserOrThrow(userId);
        return "TAX_ACCOUNTANT".equals(user.getRole());
    }
    
    /**
     * 사용자가 SUPERADMIN 역할인지 확인
     *
     * @param userId 확인할 사용자 ID
     * @return SUPERADMIN이면 true, 아니면 false
     */
    public boolean isSuperAdmin(Long userId) {
        UserDto user = getUserOrThrow(userId);
        return "SUPERADMIN".equals(user.getRole());
    }
    
    /**
     * 문서 삭제 권한 확인
     * 작성자 본인, ADMIN, CEO, 또는 ACCOUNTANT만 삭제 가능
     * 
     * @param report 문서 정보
     * @param userId 확인할 사용자 ID
     * @throws BusinessException 권한이 없는 경우
     */
    public void checkDeletePermission(ExpenseReportDto report, Long userId) {
        boolean isOwner = isOwner(report, userId);
        boolean isAdminOrCEO = isAdminOrCEO(userId);
        boolean isAccountant = isAccountant(userId);
        
        if (!isOwner && !isAdminOrCEO && !isAccountant) {
            throw new BusinessException("삭제 권한이 없습니다. 작성자 본인, ADMIN, CEO 또는 ACCOUNTANT만 삭제할 수 있습니다.");
        }
    }
    
    /**
     * 영수증 업로드/삭제 권한 확인
     * 작성자 본인 또는 ACCOUNTANT만 가능
     * 
     * @param report 문서 정보
     * @param userId 확인할 사용자 ID
     * @throws BusinessException 권한이 없는 경우
     */
    public void checkReceiptPermission(ExpenseReportDto report, Long userId) {
        boolean isOwner = isOwner(report, userId);
        boolean isAccountant = isAccountant(userId);
        
        if (!isOwner && !isAccountant) {
            throw new BusinessException("영수증 권한이 없습니다. 작성자 본인 또는 ACCOUNTANT만 가능합니다.");
        }
    }
    
    /**
     * ACCOUNTANT 권한 확인
     * 
     * @param userId 확인할 사용자 ID
     * @throws BusinessException ACCOUNTANT가 아닌 경우
     */
    public void checkAccountantPermission(Long userId) {
        if (!isAccountant(userId)) {
            throw new BusinessException("ACCOUNTANT 권한이 필요합니다.");
        }
    }
    
    /**
     * TAX_ACCOUNTANT 권한 확인
     * 
     * @param userId 확인할 사용자 ID
     * @throws BusinessException TAX_ACCOUNTANT가 아닌 경우
     */
    public void checkTaxAccountantPermission(Long userId) {
        if (!isTaxAccountant(userId)) {
            throw new BusinessException("TAX_ACCOUNTANT 권한이 필요합니다.");
        }
    }
    
    /**
     * 사용자가 해당 회사에 소속되어 있는지 확인
     * 
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @return 소속되어 있으면 true, 아니면 false
     */
    public boolean checkUserCompanyAccess(Long userId, Long companyId) {
        if (userId == null || companyId == null) {
            return false;
        }
        
        java.util.List<UserCompanyDto> companies = userService.getUserCompanies(userId);
        return companies.stream()
            .anyMatch(uc -> uc.getCompanyId().equals(companyId) && "APPROVED".equals(uc.getApprovalStatus()));
    }
    
    /**
     * 사용자가 해당 회사에 소속되어 있는지 확인하고, 없으면 예외를 던짐
     * 
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @throws BusinessException 소속되어 있지 않은 경우
     */
    public void checkUserCompanyAccessOrThrow(Long userId, Long companyId) {
        if (!checkUserCompanyAccess(userId, companyId)) {
            throw new BusinessException("해당 회사에 대한 접근 권한이 없습니다.");
        }
    }
    
    /**
     * 사용자가 해당 회사에서 특정 역할을 가지고 있는지 확인
     * 
     * @param userId 사용자 ID
     * @param companyId 회사 ID
     * @param role 확인할 역할
     * @return 해당 역할을 가지고 있으면 true, 아니면 false
     */
    public boolean hasRoleInCompany(Long userId, Long companyId, String role) {
        if (userId == null || companyId == null || role == null) {
            return false;
        }
        
        java.util.List<UserCompanyDto> companies = userService.getUserCompanies(userId);
        return companies.stream()
            .anyMatch(uc -> uc.getCompanyId().equals(companyId) 
                && "APPROVED".equals(uc.getApprovalStatus())
                && role.equals(uc.getRole()));
    }
    
    /**
     * 사용자 정보를 조회하거나 예외를 던짐
     * 
     * @param userId 사용자 ID
     * @return 사용자 정보
     * @throws BusinessException 사용자를 찾을 수 없는 경우
     */
    private UserDto getUserOrThrow(Long userId) {
        UserDto user = userService.selectUserById(userId);
        if (user == null) {
            throw new BusinessException("사용자를 찾을 수 없습니다.");
        }
        return user;
    }
}

