package com.innersignature.backend.service;

import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.dto.SubscriptionPlanDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.CompanyMapper;
import com.innersignature.backend.mapper.SubscriptionMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    
    private static final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);
    private final SubscriptionMapper subscriptionMapper;
    private final SubscriptionPlanService subscriptionPlanService;
    private final CompanyMapper companyMapper;
    
    /**
     * 회사의 현재 활성 구독 조회
     */
    public SubscriptionDto findActiveByCompanyId(Long companyId) {
        return subscriptionMapper.findActiveByCompanyId(companyId);
    }
    
    /**
     * 현재 회사의 활성 구독 조회
     */
    public SubscriptionDto findCurrentSubscription() {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        return findActiveByCompanyId(companyId);
    }
    
    /**
     * 구독 생성
     */
    @Transactional
    public SubscriptionDto createSubscription(Long companyId, Long planId, Boolean autoRenew) {
        // 플랜 확인
        SubscriptionPlanDto plan = subscriptionPlanService.findById(planId);
        if (plan.getIsActive() == null || !plan.getIsActive()) {
            throw new BusinessException("비활성화된 플랜입니다.");
        }
        
        // 기존 활성 구독 확인
        SubscriptionDto existing = subscriptionMapper.findActiveByCompanyId(companyId);
        if (existing != null) {
            throw new BusinessException("이미 활성 구독이 존재합니다. 먼저 기존 구독을 취소해주세요.");
        }
        
        // 구독 생성
        SubscriptionDto subscription = new SubscriptionDto();
        subscription.setCompanyId(companyId);
        subscription.setPlanId(planId);
        subscription.setStatus("ACTIVE");
        subscription.setStartDate(LocalDate.now());
        
        // 만료일 설정 (1개월 후)
        subscription.setEndDate(LocalDate.now().plusMonths(1));
        subscription.setAutoRenew(autoRenew != null ? autoRenew : true);
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        
        int result = subscriptionMapper.insert(subscription);
        if (result > 0) {
            // 회사 테이블에 구독 ID 업데이트
            updateCompanySubscriptionId(companyId, subscription.getSubscriptionId());
            
            logger.info("구독 생성 완료 - subscriptionId: {}, companyId: {}, planId: {}", 
                subscription.getSubscriptionId(), companyId, planId);
            return subscriptionMapper.findById(subscription.getSubscriptionId());
        } else {
            throw new BusinessException("구독 생성에 실패했습니다.");
        }
    }
    
    /**
     * 구독 변경 (플랜 업그레이드/다운그레이드)
     */
    @Transactional
    public SubscriptionDto updateSubscription(Long subscriptionId, Long planId, Boolean autoRenew) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        SubscriptionDto subscription = subscriptionMapper.findById(subscriptionId);
        if (subscription == null || !subscription.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("구독을 찾을 수 없습니다.");
        }
        
        if (!"ACTIVE".equals(subscription.getStatus())) {
            throw new BusinessException("활성 구독만 변경할 수 있습니다.");
        }
        
        // 플랜 확인
        SubscriptionPlanDto plan = subscriptionPlanService.findById(planId);
        if (plan.getIsActive() == null || !plan.getIsActive()) {
            throw new BusinessException("비활성화된 플랜입니다.");
        }
        
        // 구독 업데이트
        subscription.setPlanId(planId);
        if (autoRenew != null) {
            subscription.setAutoRenew(autoRenew);
        }
        subscription.setUpdatedAt(LocalDateTime.now());
        
        int result = subscriptionMapper.update(subscription);
        if (result > 0) {
            logger.info("구독 변경 완료 - subscriptionId: {}, planId: {}", subscriptionId, planId);
            return subscriptionMapper.findById(subscriptionId);
        } else {
            throw new BusinessException("구독 변경에 실패했습니다.");
        }
    }
    
    /**
     * 구독 취소
     */
    @Transactional
    public void cancelSubscription(Long subscriptionId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        if (companyId == null) {
            throw new BusinessException("회사 정보를 찾을 수 없습니다.");
        }
        
        SubscriptionDto subscription = subscriptionMapper.findById(subscriptionId);
        if (subscription == null || !subscription.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("구독을 찾을 수 없습니다.");
        }
        
        if (!"ACTIVE".equals(subscription.getStatus())) {
            throw new BusinessException("활성 구독만 취소할 수 있습니다.");
        }
        
        int result = subscriptionMapper.updateStatus(subscriptionId, "CANCELLED", companyId);
        if (result > 0) {
            // 회사 테이블에서 구독 ID 제거
            updateCompanySubscriptionId(companyId, null);
            
            logger.info("구독 취소 완료 - subscriptionId: {}, companyId: {}", subscriptionId, companyId);
        } else {
            throw new BusinessException("구독 취소에 실패했습니다.");
        }
    }
    
    /**
     * 회사의 모든 구독 조회
     */
    public List<SubscriptionDto> findByCompanyId(Long companyId) {
        return subscriptionMapper.findByCompanyId(companyId);
    }
    
    /**
     * 만료된 구독 조회 (스케줄러용)
     */
    public List<SubscriptionDto> findExpiredSubscriptions() {
        return subscriptionMapper.findExpiredSubscriptions(LocalDate.now());
    }
    
    /**
     * 만료 예정 구독 조회 (알림용)
     */
    public List<SubscriptionDto> findExpiringSoon(int days) {
        return subscriptionMapper.findExpiringSoon(LocalDate.now(), days);
    }
    
    /**
     * 구독 만료 처리 (스케줄러용)
     */
    @Transactional
    public void expireSubscription(Long subscriptionId) {
        SubscriptionDto subscription = subscriptionMapper.findById(subscriptionId);
        if (subscription == null || !"ACTIVE".equals(subscription.getStatus())) {
            return;
        }
        
        subscriptionMapper.updateStatus(subscriptionId, "EXPIRED", subscription.getCompanyId());
        updateCompanySubscriptionId(subscription.getCompanyId(), null);
        
        logger.info("구독 만료 처리 완료 - subscriptionId: {}, companyId: {}", 
            subscriptionId, subscription.getCompanyId());
    }
    
    /**
     * 회사 테이블의 subscription_id 업데이트
     */
    private void updateCompanySubscriptionId(Long companyId, Long subscriptionId) {
        companyMapper.updateSubscriptionId(companyId, subscriptionId);
    }
}

