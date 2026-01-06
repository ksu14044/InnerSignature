package com.innersignature.backend.service;

import com.innersignature.backend.dto.CompanyCardDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.CompanyCardMapper;
import com.innersignature.backend.util.EncryptionUtil;
import com.innersignature.backend.util.PermissionUtil;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyCardService {
    
    private static final Logger logger = LoggerFactory.getLogger(CompanyCardService.class);
    private final CompanyCardMapper companyCardMapper;
    private final EncryptionUtil encryptionUtil;
    private final PermissionUtil permissionUtil;
    
    /**
     * 회사 카드 생성
     */
    @Transactional
    public CompanyCardDto createCard(CompanyCardDto cardDto, Long currentUserId) {
        // 권한 검증: ADMIN, CEO, ACCOUNTANT만 회사 카드 생성 가능
        if (!permissionUtil.isAdmin(currentUserId) && 
            !permissionUtil.isCEO(currentUserId) && 
            !permissionUtil.isAccountant(currentUserId)) {
            throw new BusinessException("회사 카드를 생성할 권한이 없습니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        // 카드번호 검증
        String cardNumber = cardDto.getCardNumber();
        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            throw new BusinessException("카드번호는 필수입니다.");
        }
        
        // 숫자만 추출
        String numericCardNumber = cardNumber.replaceAll("[^0-9]", "");
        if (numericCardNumber.length() < 13 || numericCardNumber.length() > 19) {
            throw new BusinessException("카드번호는 13자리 이상 19자리 이하여야 합니다.");
        }
        
        // 마지막 4자리 추출
        String lastFour = numericCardNumber.length() >= 4 
            ? numericCardNumber.substring(numericCardNumber.length() - 4) 
            : numericCardNumber;
        
        // 카드번호 암호화
        String encryptedCardNumber = encryptionUtil.encrypt(numericCardNumber);
        
        // DTO 설정
        cardDto.setCompanyId(companyId);
        cardDto.setCardNumberEncrypted(encryptedCardNumber);
        cardDto.setCardLastFour(lastFour);
        cardDto.setCreatedBy(currentUserId);
        cardDto.setIsActive(true);
        
        // 카드번호 필드 제거 (평문은 저장하지 않음)
        cardDto.setCardNumber(null);
        
        int result = companyCardMapper.insert(cardDto);
        if (result > 0) {
            logger.info("회사 카드 생성 완료 - cardId: {}, companyId: {}, cardName: {}", 
                cardDto.getCardId(), companyId, cardDto.getCardName());
            return companyCardMapper.findById(cardDto.getCardId());
        } else {
            throw new BusinessException("회사 카드 생성에 실패했습니다.");
        }
    }
    
    /**
     * 회사 카드 목록 조회 (활성 카드만)
     */
    public List<CompanyCardDto> getActiveCards(Long currentUserId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        List<CompanyCardDto> cards = companyCardMapper.findActiveByCompanyId(companyId);
        
        // 카드번호 마스킹 처리 (마지막 4자리만 표시)
        for (CompanyCardDto card : cards) {
            maskCardNumber(card);
        }
        
        return cards;
    }
    
    /**
     * 회사 카드 목록 조회 (전체)
     */
    public List<CompanyCardDto> getAllCards(Long currentUserId) {
        // 권한 검증: ADMIN, CEO, ACCOUNTANT만 전체 조회 가능
        if (!permissionUtil.isAdmin(currentUserId) && 
            !permissionUtil.isCEO(currentUserId) && 
            !permissionUtil.isAccountant(currentUserId)) {
            throw new BusinessException("회사 카드 목록을 조회할 권한이 없습니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        List<CompanyCardDto> cards = companyCardMapper.findByCompanyId(companyId);
        
        // 카드번호 마스킹 처리
        for (CompanyCardDto card : cards) {
            maskCardNumber(card);
        }
        
        return cards;
    }
    
    /**
     * 회사 카드 조회
     */
    public CompanyCardDto getCard(Long cardId, Long currentUserId) {
        CompanyCardDto card = companyCardMapper.findById(cardId);
        if (card == null) {
            throw new ResourceNotFoundException("카드를 찾을 수 없습니다.");
        }
        
        // 권한 검증: 같은 회사 소속이어야 함
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (!card.getCompanyId().equals(companyId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        maskCardNumber(card);
        return card;
    }
    
    /**
     * 회사 카드 조회 (내부용 - 암호화된 카드번호 포함)
     * ExpenseService 등 내부에서 암호화된 카드번호가 필요할 때 사용
     */
    public CompanyCardDto getCardForInternalUse(Long cardId, Long currentUserId) {
        CompanyCardDto card = companyCardMapper.findById(cardId);
        if (card == null) {
            throw new ResourceNotFoundException("카드를 찾을 수 없습니다.");
        }
        
        // 권한 검증: 같은 회사 소속이어야 함
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (!card.getCompanyId().equals(companyId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        // 마스킹하지 않고 암호화된 카드번호 그대로 반환
        return card;
    }
    
    /**
     * 회사 카드 수정
     */
    @Transactional
    public CompanyCardDto updateCard(Long cardId, CompanyCardDto cardDto, Long currentUserId) {
        // 권한 검증
        if (!permissionUtil.isAdmin(currentUserId) && 
            !permissionUtil.isCEO(currentUserId) && 
            !permissionUtil.isAccountant(currentUserId)) {
            throw new BusinessException("회사 카드를 수정할 권한이 없습니다.");
        }
        
        CompanyCardDto existingCard = companyCardMapper.findById(cardId);
        if (existingCard == null) {
            throw new ResourceNotFoundException("카드를 찾을 수 없습니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (!existingCard.getCompanyId().equals(companyId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        // 카드번호가 변경된 경우 암호화 처리
        if (cardDto.getCardNumber() != null && !cardDto.getCardNumber().trim().isEmpty()) {
            String numericCardNumber = cardDto.getCardNumber().replaceAll("[^0-9]", "");
            if (numericCardNumber.length() < 13 || numericCardNumber.length() > 19) {
                throw new BusinessException("카드번호는 13자리 이상 19자리 이하여야 합니다.");
            }
            
            String lastFour = numericCardNumber.length() >= 4 
                ? numericCardNumber.substring(numericCardNumber.length() - 4) 
                : numericCardNumber;
            
            cardDto.setCardNumberEncrypted(encryptionUtil.encrypt(numericCardNumber));
            cardDto.setCardLastFour(lastFour);
        } else {
            // 카드번호가 변경되지 않은 경우 기존 값 유지
            cardDto.setCardNumberEncrypted(existingCard.getCardNumberEncrypted());
            cardDto.setCardLastFour(existingCard.getCardLastFour());
        }
        
        cardDto.setCardId(cardId);
        cardDto.setCardNumber(null); // 평문은 저장하지 않음
        
        int result = companyCardMapper.update(cardDto);
        if (result > 0) {
            logger.info("회사 카드 수정 완료 - cardId: {}", cardId);
            return companyCardMapper.findById(cardId);
        } else {
            throw new BusinessException("회사 카드 수정에 실패했습니다.");
        }
    }
    
    /**
     * 회사 카드 삭제 (soft delete)
     */
    @Transactional
    public void deleteCard(Long cardId, Long currentUserId) {
        // 권한 검증
        if (!permissionUtil.isAdmin(currentUserId) && 
            !permissionUtil.isCEO(currentUserId) && 
            !permissionUtil.isAccountant(currentUserId)) {
            throw new BusinessException("회사 카드를 삭제할 권한이 없습니다.");
        }
        
        CompanyCardDto card = companyCardMapper.findById(cardId);
        if (card == null) {
            throw new ResourceNotFoundException("카드를 찾을 수 없습니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (!card.getCompanyId().equals(companyId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        int result = companyCardMapper.delete(cardId);
        if (result > 0) {
            logger.info("회사 카드 삭제 완료 - cardId: {}", cardId);
        } else {
            throw new BusinessException("회사 카드 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 카드번호 마스킹 처리 (마지막 4자리만 표시)
     */
    private void maskCardNumber(CompanyCardDto card) {
        if (card.getCardLastFour() != null && !card.getCardLastFour().isEmpty()) {
            card.setCardNumber("****-****-****-" + card.getCardLastFour());
        } else {
            card.setCardNumber("****-****-****-****");
        }
        // 암호화된 카드번호는 클라이언트에 전달하지 않음
        card.setCardNumberEncrypted(null);
    }
}

