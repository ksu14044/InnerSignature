package com.innersignature.backend.service;

import com.innersignature.backend.dto.UserSignatureDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.UserSignatureMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSignatureService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserSignatureService.class);
    private final UserSignatureMapper userSignatureMapper;
    
    /**
     * 서명/도장 생성
     */
    @Transactional
    public UserSignatureDto createSignature(UserSignatureDto signatureDto, Long currentUserId, Long companyId) {
        // 서명 데이터 검증
        if (signatureDto.getSignatureData() == null || signatureDto.getSignatureData().trim().isEmpty()) {
            throw new BusinessException("서명/도장 데이터는 필수입니다.");
        }
        
        // 서명 이름 검증
        if (signatureDto.getSignatureName() == null || signatureDto.getSignatureName().trim().isEmpty()) {
            throw new BusinessException("서명/도장 이름은 필수입니다.");
        }
        
        // 타입 검증
        if (signatureDto.getSignatureType() == null || 
            (!signatureDto.getSignatureType().equals("SIGNATURE") && 
             !signatureDto.getSignatureType().equals("STAMP"))) {
            throw new BusinessException("서명/도장 타입은 SIGNATURE 또는 STAMP여야 합니다.");
        }
        
        // 기본 서명/도장 설정 처리
        if (Boolean.TRUE.equals(signatureDto.getIsDefault())) {
            // 다른 서명/도장들의 기본 해제
            userSignatureMapper.clearDefaultByUserId(currentUserId, companyId);
        }
        
        // DTO 설정
        signatureDto.setUserId(currentUserId);
        signatureDto.setCompanyId(companyId);
        if (signatureDto.getIsDefault() == null) {
            signatureDto.setIsDefault(false);
        }
        
        int result = userSignatureMapper.insert(signatureDto);
        if (result > 0) {
            logger.info("서명/도장 생성 완료 - signatureId: {}, userId: {}, signatureName: {}", 
                signatureDto.getSignatureId(), currentUserId, signatureDto.getSignatureName());
            return userSignatureMapper.findById(signatureDto.getSignatureId(), companyId);
        } else {
            throw new BusinessException("서명/도장 생성에 실패했습니다.");
        }
    }
    
    /**
     * 서명/도장 목록 조회
     */
    public List<UserSignatureDto> getSignatures(Long currentUserId, Long companyId) {
        return userSignatureMapper.findByUserId(currentUserId, companyId);
    }
    
    /**
     * 기본 서명/도장 조회
     */
    public UserSignatureDto getDefaultSignature(Long currentUserId, Long companyId) {
        return userSignatureMapper.findDefaultByUserId(currentUserId, companyId);
    }
    
    /**
     * 서명/도장 조회
     */
    public UserSignatureDto getSignature(Long signatureId, Long currentUserId, Long companyId) {
        UserSignatureDto signature = userSignatureMapper.findById(signatureId, companyId);
        if (signature == null) {
            throw new ResourceNotFoundException("서명/도장을 찾을 수 없습니다.");
        }
        
        // 본인 서명/도장만 조회 가능
        if (!signature.getUserId().equals(currentUserId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        return signature;
    }
    
    /**
     * 서명/도장 수정
     */
    @Transactional
    public UserSignatureDto updateSignature(Long signatureId, UserSignatureDto signatureDto, Long currentUserId, Long companyId) {
        UserSignatureDto existingSignature = userSignatureMapper.findById(signatureId, companyId);
        if (existingSignature == null) {
            throw new ResourceNotFoundException("서명/도장을 찾을 수 없습니다.");
        }
        
        // 본인 서명/도장만 수정 가능
        if (!existingSignature.getUserId().equals(currentUserId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        // 타입 검증
        if (signatureDto.getSignatureType() != null && 
            !signatureDto.getSignatureType().equals("SIGNATURE") && 
            !signatureDto.getSignatureType().equals("STAMP")) {
            throw new BusinessException("서명/도장 타입은 SIGNATURE 또는 STAMP여야 합니다.");
        }
        
        // 기본 서명/도장 설정 처리
        if (Boolean.TRUE.equals(signatureDto.getIsDefault())) {
            // 다른 서명/도장들의 기본 해제
            userSignatureMapper.clearDefaultByUserId(currentUserId, companyId);
        }
        
        signatureDto.setSignatureId(signatureId);
        signatureDto.setUserId(currentUserId);
        signatureDto.setCompanyId(companyId);
        
        // 수정하지 않은 필드는 기존 값 유지
        if (signatureDto.getSignatureName() == null) {
            signatureDto.setSignatureName(existingSignature.getSignatureName());
        }
        if (signatureDto.getSignatureType() == null) {
            signatureDto.setSignatureType(existingSignature.getSignatureType());
        }
        if (signatureDto.getSignatureData() == null) {
            signatureDto.setSignatureData(existingSignature.getSignatureData());
        }
        if (signatureDto.getIsDefault() == null) {
            signatureDto.setIsDefault(existingSignature.getIsDefault());
        }
        
        int result = userSignatureMapper.update(signatureDto);
        if (result > 0) {
            logger.info("서명/도장 수정 완료 - signatureId: {}", signatureId);
            return userSignatureMapper.findById(signatureId, companyId);
        } else {
            throw new BusinessException("서명/도장 수정에 실패했습니다.");
        }
    }
    
    /**
     * 서명/도장 삭제
     */
    @Transactional
    public void deleteSignature(Long signatureId, Long currentUserId, Long companyId) {
        UserSignatureDto signature = userSignatureMapper.findById(signatureId, companyId);
        if (signature == null) {
            throw new ResourceNotFoundException("서명/도장을 찾을 수 없습니다.");
        }
        
        // 본인 서명/도장만 삭제 가능
        if (!signature.getUserId().equals(currentUserId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        int result = userSignatureMapper.delete(signatureId, companyId);
        if (result > 0) {
            logger.info("서명/도장 삭제 완료 - signatureId: {}", signatureId);
        } else {
            throw new BusinessException("서명/도장 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 기본 서명/도장 설정
     */
    @Transactional
    public UserSignatureDto setDefaultSignature(Long signatureId, Long currentUserId, Long companyId) {
        UserSignatureDto signature = userSignatureMapper.findById(signatureId, companyId);
        if (signature == null) {
            throw new ResourceNotFoundException("서명/도장을 찾을 수 없습니다.");
        }
        
        // 본인 서명/도장만 설정 가능
        if (!signature.getUserId().equals(currentUserId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        // 다른 서명/도장들의 기본 해제
        userSignatureMapper.clearDefaultByUserId(currentUserId, companyId);
        
        // 현재 서명/도장을 기본으로 설정
        UserSignatureDto updateDto = new UserSignatureDto();
        updateDto.setSignatureId(signatureId);
        updateDto.setIsDefault(true);
        updateDto.setUserId(currentUserId);
        updateDto.setCompanyId(companyId);
        updateDto.setSignatureName(signature.getSignatureName());
        updateDto.setSignatureType(signature.getSignatureType());
        updateDto.setSignatureData(signature.getSignatureData());
        
        int result = userSignatureMapper.update(updateDto);
        if (result > 0) {
            logger.info("기본 서명/도장 설정 완료 - signatureId: {}", signatureId);
            return userSignatureMapper.findById(signatureId, companyId);
        } else {
            throw new BusinessException("기본 서명/도장 설정에 실패했습니다.");
        }
    }
}

