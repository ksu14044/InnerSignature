package com.innersignature.backend.service;

import com.innersignature.backend.dto.UserCardDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.UserCardMapper;
import com.innersignature.backend.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserCardService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserCardService.class);
    private final UserCardMapper userCardMapper;
    private final EncryptionUtil encryptionUtil;
    
    /**
     * 개인 카드 생성
     */
    @Transactional
    public UserCardDto createCard(UserCardDto cardDto, Long currentUserId) {
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
        
        // 기본 카드 설정 처리
        if (Boolean.TRUE.equals(cardDto.getIsDefault())) {
            // 다른 카드들의 기본 카드 해제
            userCardMapper.clearDefaultByUserId(currentUserId);
        }
        
        // DTO 설정
        cardDto.setUserId(currentUserId);
        cardDto.setCardNumberEncrypted(encryptedCardNumber);
        cardDto.setCardLastFour(lastFour);
        cardDto.setIsActive(true);
        
        // 카드번호 필드 제거 (평문은 저장하지 않음)
        cardDto.setCardNumber(null);
        
        int result = userCardMapper.insert(cardDto);
        if (result > 0) {
            logger.info("개인 카드 생성 완료 - cardId: {}, userId: {}, cardName: {}", 
                cardDto.getCardId(), currentUserId, cardDto.getCardName());
            return userCardMapper.findById(cardDto.getCardId());
        } else {
            throw new BusinessException("개인 카드 생성에 실패했습니다.");
        }
    }
    
    /**
     * 개인 카드 목록 조회 (활성 카드만)
     */
    public List<UserCardDto> getActiveCards(Long currentUserId) {
        List<UserCardDto> cards = userCardMapper.findActiveByUserId(currentUserId);
        
        // 카드번호 마스킹 처리
        for (UserCardDto card : cards) {
            maskCardNumber(card);
        }
        
        return cards;
    }
    
    /**
     * 개인 카드 목록 조회 (전체)
     */
    public List<UserCardDto> getAllCards(Long currentUserId) {
        List<UserCardDto> cards = userCardMapper.findByUserId(currentUserId);
        
        // 카드번호 마스킹 처리
        for (UserCardDto card : cards) {
            maskCardNumber(card);
        }
        
        return cards;
    }
    
    /**
     * 개인 카드 조회
     */
    public UserCardDto getCard(Long cardId, Long currentUserId) {
        UserCardDto card = userCardMapper.findById(cardId);
        if (card == null) {
            throw new ResourceNotFoundException("카드를 찾을 수 없습니다.");
        }
        
        // 본인 카드만 조회 가능
        if (!card.getUserId().equals(currentUserId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        maskCardNumber(card);
        return card;
    }
    
    /**
     * 개인 카드 수정
     */
    @Transactional
    public UserCardDto updateCard(Long cardId, UserCardDto cardDto, Long currentUserId) {
        UserCardDto existingCard = userCardMapper.findById(cardId);
        if (existingCard == null) {
            throw new ResourceNotFoundException("카드를 찾을 수 없습니다.");
        }
        
        // 본인 카드만 수정 가능
        if (!existingCard.getUserId().equals(currentUserId)) {
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
        
        // 기본 카드 설정 처리
        if (Boolean.TRUE.equals(cardDto.getIsDefault())) {
            // 다른 카드들의 기본 카드 해제
            userCardMapper.clearDefaultByUserId(currentUserId);
        }
        
        cardDto.setCardId(cardId);
        cardDto.setCardNumber(null); // 평문은 저장하지 않음
        
        int result = userCardMapper.update(cardDto);
        if (result > 0) {
            logger.info("개인 카드 수정 완료 - cardId: {}", cardId);
            return userCardMapper.findById(cardId);
        } else {
            throw new BusinessException("개인 카드 수정에 실패했습니다.");
        }
    }
    
    /**
     * 개인 카드 삭제 (soft delete)
     */
    @Transactional
    public void deleteCard(Long cardId, Long currentUserId) {
        UserCardDto card = userCardMapper.findById(cardId);
        if (card == null) {
            throw new ResourceNotFoundException("카드를 찾을 수 없습니다.");
        }
        
        // 본인 카드만 삭제 가능
        if (!card.getUserId().equals(currentUserId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        int result = userCardMapper.delete(cardId);
        if (result > 0) {
            logger.info("개인 카드 삭제 완료 - cardId: {}", cardId);
        } else {
            throw new BusinessException("개인 카드 삭제에 실패했습니다.");
        }
    }
    
    /**
     * 카드번호 마스킹 처리 (마지막 4자리만 표시)
     */
    private void maskCardNumber(UserCardDto card) {
        if (card.getCardLastFour() != null && !card.getCardLastFour().isEmpty()) {
            card.setCardNumber("****-****-****-" + card.getCardLastFour());
        } else {
            card.setCardNumber("****-****-****-****");
        }
        // 암호화된 카드번호는 클라이언트에 전달하지 않음
        card.setCardNumberEncrypted(null);
    }
}

