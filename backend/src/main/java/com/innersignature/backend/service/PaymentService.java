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
import org.springframework.transaction.annotation.Propagation;
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
     * REQUIRES_NEW: 별도 트랜잭션으로 실행하여 결제 실패가 상위 트랜잭션에 영향을 주지 않도록 함
     * 
     * @param subscriptionId 구독 ID
     * @param amount 결제 금액
     * @param paymentMethod 결제 수단
     * @param companyId 회사 ID (내부 서비스 호출 시 전달, 외부 API 호출 시 null 가능)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PaymentDto createPayment(Long subscriptionId, Integer amount, String paymentMethod, Long companyId) {
        logger.info("결제 내역 생성 요청 - subscriptionId: {}, amount: {}, paymentMethod: {}, companyId: {}", 
            subscriptionId, amount, paymentMethod, companyId);
        
        // Security Context가 있는 경우에만 권한 검증 (내부 서비스 호출 시에는 건너뜀)
        Long companyIdFromSecurity = SecurityUtil.getCurrentCompanyId();
        logger.debug("Security Context companyId: {}", companyIdFromSecurity);
        if (companyIdFromSecurity != null && companyId != null) {
            // Security Context가 있으면 권한 검증
            if (!companyId.equals(companyIdFromSecurity)) {
                logger.error("권한 검증 실패 - companyId: {}, security.companyId: {}", 
                    companyId, companyIdFromSecurity);
                throw new BusinessException("권한이 없습니다.");
            }
        } else {
            logger.debug("Security Context가 없거나 companyId가 없으므로 내부 서비스 호출로 간주하고 권한 검증 건너뜀");
        }
        
        // 금액 검증 (양수만 허용)
        if (amount == null || amount <= 0) {
            logger.error("결제 금액 검증 실패 - amount: {}", amount);
            throw new BusinessException("결제 금액은 0보다 커야 합니다.");
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

