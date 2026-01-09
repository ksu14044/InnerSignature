package com.innersignature.backend.service;

import com.innersignature.backend.dto.UserApproverMappingDto;
import com.innersignature.backend.dto.UserDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.UserApproverMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserApproverService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserApproverService.class);
    private final UserApproverMapper userApproverMapper;
    
    /**
     * 사용자별 담당 결재자 목록 조회
     */
    public List<UserApproverMappingDto> getApproversByUserId(Long userId, Long companyId) {
        return userApproverMapper.findByUserId(userId, companyId);
    }
    
    /**
     * 사용자의 활성화된 담당 결재자 목록 조회 (결재자 정보 포함)
     */
    public List<UserDto> getActiveApproversByUserId(Long userId, Long companyId) {
        return userApproverMapper.findActiveApproversByUserId(userId, companyId);
    }
    
    /**
     * 담당 결재자 매핑 생성
     */
    @Transactional
    public UserApproverMappingDto createMapping(UserApproverMappingDto mapping) {
        Long companyId = SecurityUtil.getCurrentCompanyId();

        // CEO는 자기 자신을 담당 결재자로 설정할 수 있음
        String currentUserRole = SecurityUtil.getCurrentRole();
        if (!"CEO".equals(currentUserRole) && mapping.getUserId().equals(mapping.getApproverId())) {
            throw new BusinessException("자기 자신을 담당 결재자로 설정할 수 없습니다.");
        }
        
        mapping.setCompanyId(companyId);
        if (mapping.getPriority() == null) {
            mapping.setPriority(1);
        }
        if (mapping.getIsActive() == null) {
            mapping.setIsActive(true);
        }
        
        // 중복 확인
        UserApproverMappingDto existing = userApproverMapper.findByUserAndApprover(
            mapping.getUserId(), mapping.getApproverId(), companyId
        );
        
        if (existing != null) {
            // 이미 존재하는 경우
            if (existing.getIsActive() != null && existing.getIsActive()) {
                // 활성화된 매핑이 이미 존재
                throw new BusinessException("이미 등록된 담당 결재자입니다.");
            } else {
                // 비활성화된 매핑이 존재하는 경우 - 재활성화
                existing.setIsActive(true);
                existing.setPriority(mapping.getPriority());
                existing.setCompanyId(companyId);
                int result = userApproverMapper.update(existing);
                if (result > 0) {
                    logger.info("담당 결재자 매핑 재활성화 완료 - mappingId: {}", existing.getMappingId());
                    return userApproverMapper.findByUserAndApprover(
                        mapping.getUserId(), mapping.getApproverId(), companyId
                    );
                } else {
                    throw new BusinessException("담당 결재자 매핑 재활성화에 실패했습니다.");
                }
            }
        } else {
            // 새로운 매핑 생성
            int result = userApproverMapper.insert(mapping);
            if (result > 0) {
                logger.info("담당 결재자 매핑 생성 완료 - mappingId: {}", mapping.getMappingId());
                return userApproverMapper.findByUserAndApprover(
                    mapping.getUserId(), mapping.getApproverId(), companyId
                );
            } else {
                throw new BusinessException("담당 결재자 매핑 생성에 실패했습니다.");
            }
        }
    }
    
    /**
     * 담당 결재자 매핑 수정
     */
    @Transactional
    public UserApproverMappingDto updateMapping(UserApproverMappingDto mapping) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        UserApproverMappingDto existing = userApproverMapper.findByUserAndApprover(
            mapping.getUserId(), mapping.getApproverId(), companyId
        );
        if (existing == null || !existing.getMappingId().equals(mapping.getMappingId())) {
            throw new BusinessException("담당 결재자 매핑을 찾을 수 없습니다.");
        }
        
        mapping.setCompanyId(companyId);
        int result = userApproverMapper.update(mapping);
        if (result > 0) {
            logger.info("담당 결재자 매핑 수정 완료 - mappingId: {}", mapping.getMappingId());
            return userApproverMapper.findByUserAndApprover(
                mapping.getUserId(), mapping.getApproverId(), companyId
            );
        } else {
            throw new BusinessException("담당 결재자 매핑 수정에 실패했습니다.");
        }
    }
    
    /**
     * 담당 결재자 매핑 삭제 (비활성화)
     */
    @Transactional
    public void deleteMapping(Long mappingId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        int result = userApproverMapper.delete(mappingId, companyId);
        if (result == 0) {
            throw new BusinessException("담당 결재자 매핑을 찾을 수 없습니다.");
        }
        logger.info("담당 결재자 매핑 삭제 완료 - mappingId: {}", mappingId);
    }
}


