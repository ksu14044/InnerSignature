package com.innersignature.backend.service;

import com.innersignature.backend.dto.PaymentDto;
import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.PaymentMapper;
import com.innersignature.backend.mapper.SubscriptionMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    private final PaymentMapper paymentMapper;
    private final SubscriptionMapper subscriptionMapper;
    
    /**
     * 결제 내역 생성 (더미 구현 - 추후 결제 게이트웨이 연동)
     */
    @Transactional
    public PaymentDto createPayment(Long subscriptionId, Integer amount, String paymentMethod) {
        // 구독 확인
        SubscriptionDto subscription = subscriptionMapper.findById(subscriptionId);
        if (subscription == null) {
            throw new ResourceNotFoundException("구독을 찾을 수 없습니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null || !subscription.getCompanyId().equals(companyId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        // 결제 내역 생성
        PaymentDto payment = new PaymentDto();
        payment.setSubscriptionId(subscriptionId);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("COMPLETED");  // 더미 구현이므로 바로 완료 처리
        payment.setPaymentDate(LocalDateTime.now());
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        int result = paymentMapper.insert(payment);
        if (result > 0) {
            logger.info("결제 내역 생성 완료 - paymentId: {}, subscriptionId: {}, amount: {}", 
                payment.getPaymentId(), subscriptionId, amount);
            return paymentMapper.findById(payment.getPaymentId());
        } else {
            throw new BusinessException("결제 내역 생성에 실패했습니다.");
        }
    }
    
    /**
     * 구독의 모든 결제 내역 조회
     */
    public List<PaymentDto> findBySubscriptionId(Long subscriptionId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        SubscriptionDto subscription = subscriptionMapper.findById(subscriptionId);
        if (subscription == null || !subscription.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("구독을 찾을 수 없습니다.");
        }
        
        return paymentMapper.findBySubscriptionId(subscriptionId);
    }
    
    /**
     * 현재 회사의 모든 결제 내역 조회
     */
    public List<PaymentDto> findCurrentCompanyPayments() {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        return paymentMapper.findByCompanyId(companyId);
    }
    
    /**
     * 결제 상태 업데이트
     */
    @Transactional
    public void updatePaymentStatus(Long paymentId, String paymentStatus) {
        PaymentDto payment = paymentMapper.findById(paymentId);
        if (payment == null) {
            throw new ResourceNotFoundException("결제 내역을 찾을 수 없습니다.");
        }
        
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        SubscriptionDto subscription = subscriptionMapper.findById(payment.getSubscriptionId());
        if (subscription == null || !subscription.getCompanyId().equals(companyId)) {
            throw new BusinessException("권한이 없습니다.");
        }
        
        paymentMapper.updateStatus(paymentId, paymentStatus);
        logger.info("결제 상태 업데이트 완료 - paymentId: {}, status: {}", paymentId, paymentStatus);
    }
    
    /**
     * 전체 결제 내역 조회 (SUPERADMIN 전용)
     */
    public List<PaymentDto> getAllPayments() {
        return paymentMapper.findAll();
    }
}

