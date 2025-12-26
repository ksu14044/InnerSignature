package com.innersignature.backend.service;

import com.innersignature.backend.dto.CreditDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.CreditMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditService {
    
    private static final Logger logger = LoggerFactory.getLogger(CreditService.class);
    private final CreditMapper creditMapper;
    
    /**
     * 크레딧 추가
     * REQUIRES_NEW: 별도 트랜잭션으로 실행하여 크레딧 추가 실패가 상위 트랜잭션에 영향을 주지 않도록 함
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CreditDto addCredit(Long companyId, Integer amount, String reason, LocalDate expiresAt) {
        if (amount == null || amount <= 0) {
            throw new BusinessException("크레딧 금액은 0보다 커야 합니다.");
        }
        
        CreditDto credit = new CreditDto();
        credit.setCompanyId(companyId);
        credit.setAmount(amount);
        credit.setReason(reason);
        credit.setUsedAmount(0);
        credit.setExpiresAt(expiresAt);
        credit.setCreatedAt(LocalDateTime.now());
        credit.setUpdatedAt(LocalDateTime.now());
        
        int result = creditMapper.insert(credit);
        if (result > 0) {
            logger.info("크레딧 추가 완료 - creditId: {}, companyId: {}, amount: {}, reason: {}", 
                credit.getCreditId(), companyId, amount, reason);
            return creditMapper.findById(credit.getCreditId());
        } else {
            throw new BusinessException("크레딧 추가에 실패했습니다.");
        }
    }
    
    /**
     * 크레딧 사용 (사용 가능한 크레딧을 자동으로 선택하여 사용)
     * REQUIRES_NEW: 별도 트랜잭션으로 실행하여 크레딧 사용 실패가 상위 트랜잭션에 영향을 주지 않도록 함
     * @return 실제 사용된 크레딧 금액
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Integer useCredit(Long companyId, Integer requestedAmount) {
        if (requestedAmount == null || requestedAmount <= 0) {
            return 0;
        }
        
        List<CreditDto> availableCredits = creditMapper.findAvailableByCompanyId(companyId, LocalDate.now());
        if (availableCredits.isEmpty()) {
            return 0;
        }
        
        int remainingAmount = requestedAmount;
        int totalUsed = 0;
        
        for (CreditDto credit : availableCredits) {
            if (remainingAmount <= 0) {
                break;
            }
            
            int availableAmount = credit.getAvailableAmount();
            if (availableAmount <= 0) {
                continue;
            }
            
            int useAmount = Math.min(remainingAmount, availableAmount);
            int newUsedAmount = credit.getUsedAmount() + useAmount;
            
            creditMapper.updateUsedAmount(credit.getCreditId(), newUsedAmount);
            totalUsed += useAmount;
            remainingAmount -= useAmount;
            
            logger.debug("크레딧 사용 - creditId: {}, usedAmount: {}, remaining: {}", 
                credit.getCreditId(), useAmount, remainingAmount);
        }
        
        if (totalUsed > 0) {
            logger.info("크레딧 사용 완료 - companyId: {}, requestedAmount: {}, usedAmount: {}", 
                companyId, requestedAmount, totalUsed);
        }
        
        return totalUsed;
    }
    
    /**
     * 회사의 총 사용 가능한 크레딧 금액 조회
     */
    public Integer getTotalAvailableAmount(Long companyId) {
        return creditMapper.getTotalAvailableAmount(companyId, LocalDate.now());
    }
    
    /**
     * 회사의 모든 크레딧 조회
     */
    public List<CreditDto> findByCompanyId(Long companyId) {
        return creditMapper.findByCompanyId(companyId);
    }
    
    /**
     * 회사의 사용 가능한 크레딧 목록 조회
     */
    public List<CreditDto> findAvailableByCompanyId(Long companyId) {
        return creditMapper.findAvailableByCompanyId(companyId, LocalDate.now());
    }
}

