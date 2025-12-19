package com.innersignature.backend.service;

import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.dto.SubscriptionPlanDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.CompanyMapper;
import com.innersignature.backend.mapper.SubscriptionMapper;
import com.innersignature.backend.mapper.UserMapper;
import com.innersignature.backend.service.PaymentService;
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
    private final UserMapper userMapper;
    private final PaymentService paymentService;
    
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
            
            // 회사가 비활성화되어 있으면 다시 활성화
            CompanyDto company = companyMapper.findById(companyId);
            if (company != null && (company.getIsActive() == null || !company.getIsActive())) {
                companyMapper.updateIsActive(companyId, true);
                logger.info("구독 생성 시 회사 활성화 완료 - companyId: {}", companyId);
            }
            
            // 유료 플랜인 경우 결제 내역 생성
            if (plan.getPrice() != null && plan.getPrice() > 0) {
                try {
                    paymentService.createPayment(
                        subscription.getSubscriptionId(),
                        plan.getPrice(),
                        "CARD" // 더미 구현이므로 기본값
                    );
                    logger.info("결제 내역 생성 완료 - subscriptionId: {}, amount: {}", 
                        subscription.getSubscriptionId(), plan.getPrice());
                } catch (Exception e) {
                    logger.warn("결제 내역 생성 실패 - subscriptionId: {}, error: {}", 
                        subscription.getSubscriptionId(), e.getMessage());
                    // 결제 내역 생성 실패해도 구독은 유지
                }
            }
            
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
        
        // 기존 플랜 확인 (결제 내역 생성 여부 판단용)
        SubscriptionPlanDto oldPlan = subscriptionPlanService.findById(subscription.getPlanId());
        
        // 구독 업데이트
        subscription.setPlanId(planId);
        if (autoRenew != null) {
            subscription.setAutoRenew(autoRenew);
        }
        subscription.setUpdatedAt(LocalDateTime.now());
        
        int result = subscriptionMapper.update(subscription);
        if (result > 0) {
            // 유료 플랜으로 변경하는 경우 결제 내역 생성
            // (기존 플랜과 다른 경우에만 생성)
            if (!plan.getPlanId().equals(oldPlan.getPlanId()) && 
                plan.getPrice() != null && plan.getPrice() > 0) {
                try {
                    paymentService.createPayment(
                        subscriptionId,
                        plan.getPrice(),
                        "CARD" // 더미 구현이므로 기본값
                    );
                    logger.info("플랜 변경 시 결제 내역 생성 완료 - subscriptionId: {}, amount: {}", 
                        subscriptionId, plan.getPrice());
                } catch (Exception e) {
                    logger.warn("플랜 변경 시 결제 내역 생성 실패 - subscriptionId: {}, error: {}", 
                        subscriptionId, e.getMessage());
                    // 결제 내역 생성 실패해도 구독 변경은 유지
                }
            }
            
            logger.info("구독 변경 완료 - subscriptionId: {}, planId: {}", subscriptionId, planId);
            return subscriptionMapper.findById(subscriptionId);
        } else {
            throw new BusinessException("구독 변경에 실패했습니다.");
        }
    }
    
    /**
     * 구독 취소 (자동 갱신 끄기)
     * - 현재 구독은 만료일까지 계속 유지 (이미 결제된 기간)
     * - 만료일이 되면 스케줄러가 무료 플랜으로 전환 처리
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
        
        // 자동 갱신 끄기 (구독 취소)
        subscription.setAutoRenew(false);
        subscription.setUpdatedAt(LocalDateTime.now());
        
        int result = subscriptionMapper.update(subscription);
        if (result > 0) {
            logger.info("구독 취소 완료 (자동 갱신 해제) - subscriptionId: {}, companyId: {}, 만료일: {}", 
                subscriptionId, companyId, subscription.getEndDate());
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
     * - 만료일이 지난 구독을 처리
     * - 자동 갱신이 켜져 있으면 다음 기간으로 연장 (결제 처리)
     * - 자동 갱신이 꺼져 있으면 무료 플랜으로 전환 또는 회사 비활성화
     */
    @Transactional
    public void expireSubscription(Long subscriptionId) {
        SubscriptionDto subscription = subscriptionMapper.findById(subscriptionId);
        if (subscription == null || !"ACTIVE".equals(subscription.getStatus())) {
            return;
        }
        
        Long companyId = subscription.getCompanyId();
        
        // 구독 상태를 EXPIRED로 변경
        subscriptionMapper.updateStatus(subscriptionId, "EXPIRED", companyId);
        updateCompanySubscriptionId(companyId, null);
        
        // 자동 갱신이 켜져 있는 경우 다음 기간으로 연장 (결제 처리)
        if (Boolean.TRUE.equals(subscription.getAutoRenew())) {
            try {
                // TODO: 실제 결제 처리 로직 구현 필요
                // 현재는 자동으로 같은 플랜으로 연장
                SubscriptionPlanDto currentPlan = subscriptionPlanService.findById(subscription.getPlanId());
                if (currentPlan != null && currentPlan.getIsActive()) {
                    createSubscription(companyId, subscription.getPlanId(), true);
                    logger.info("구독 자동 갱신 완료 - companyId: {}, planId: {}", companyId, subscription.getPlanId());
                }
            } catch (Exception e) {
                logger.error("구독 자동 갱신 실패 - companyId: {}, error: {}", companyId, e.getMessage());
                // 자동 갱신 실패 시 무료 플랜으로 전환 처리
                handleExpiredSubscriptionDowngrade(companyId);
            }
        } else {
            // 자동 갱신이 꺼져 있는 경우 (구독 취소된 경우) 무료 플랜으로 전환 처리
            handleExpiredSubscriptionDowngrade(companyId);
        }
        
        logger.info("구독 만료 처리 완료 - subscriptionId: {}, companyId: {}", 
            subscriptionId, companyId);
    }
    
    /**
     * 만료된 구독의 무료 플랜 전환 처리
     */
    private void handleExpiredSubscriptionDowngrade(Long companyId) {
        // 현재 사용자 수 확인
        int currentUserCount = userMapper.countUsersByCompanyId(companyId);
        int freePlanMaxUsers = 3;
        
        // 사용자 수가 무료 플랜 제한을 초과하는 경우 회사 비활성화
        if (currentUserCount > freePlanMaxUsers) {
            companyMapper.updateIsActive(companyId, false);
            logger.warn("구독 만료 시 사용자 수 초과로 회사 비활성화 - companyId: {}, userCount: {}, maxUsers: {}", 
                companyId, currentUserCount, freePlanMaxUsers);
        } else {
            // 사용자 수가 제한 이내인 경우 무료 플랜으로 전환
            try {
                SubscriptionPlanDto freePlan = subscriptionPlanService.findByCode("FREE");
                if (freePlan != null) {
                    createSubscription(companyId, freePlan.getPlanId(), false);
                    logger.info("구독 만료 후 무료 플랜으로 전환 완료 - companyId: {}", companyId);
                }
            } catch (Exception e) {
                logger.warn("구독 만료 후 무료 플랜 전환 실패 - companyId: {}, error: {}", companyId, e.getMessage());
            }
        }
    }
    
    /**
     * 회사 테이블의 subscription_id 업데이트
     */
    private void updateCompanySubscriptionId(Long companyId, Long subscriptionId) {
        companyMapper.updateSubscriptionId(companyId, subscriptionId);
    }
}

