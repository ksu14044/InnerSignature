package com.innersignature.backend.service;

import com.innersignature.backend.dto.CompanyDto;
import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.dto.SubscriptionPlanDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.CompanyMapper;
import com.innersignature.backend.mapper.SubscriptionMapper;
import com.innersignature.backend.mapper.UserMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    private final CreditService creditService;
    
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
                logger.info("결제 내역 생성 시도 - subscriptionId: {}, planPrice: {}", 
                    subscription.getSubscriptionId(), plan.getPrice());
                try {
                    paymentService.createPayment(
                        subscription.getSubscriptionId(),
                        plan.getPrice(),
                        "CARD", // 더미 구현이므로 기본값
                        companyId
                    );
                    logger.info("결제 내역 생성 완료 - subscriptionId: {}, amount: {}", 
                        subscription.getSubscriptionId(), plan.getPrice());
                } catch (Exception e) {
                    logger.error("결제 내역 생성 실패 - subscriptionId: {}, error: {}", 
                        subscription.getSubscriptionId(), e.getMessage(), e);
                    // 결제 내역 생성 실패해도 구독은 유지
                }
            } else {
                logger.info("무료 플랜이므로 결제 내역 생성 건너뜀 - subscriptionId: {}, planPrice: {}", 
                    subscription.getSubscriptionId(), plan.getPrice());
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
     * 
     * 다운그레이드 (가격 하락): 기간 끝까지 기존 플랜 유지, 만료일 이후 새 플랜 적용
     * 업그레이드 (가격 상승): 즉시 적용 + 남은 기간 미사용 금액을 크레딧으로 전환
     * 
     * 트랜잭션 관리: 상위 트랜잭션 없이 각 단계를 독립적으로 처리하여 데드락 방지
     */
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
        SubscriptionPlanDto newPlan = subscriptionPlanService.findById(planId);
        if (newPlan.getIsActive() == null || !newPlan.getIsActive()) {
            throw new BusinessException("비활성화된 플랜입니다.");
        }
        
        // 기존 플랜 확인
        SubscriptionPlanDto oldPlan = subscriptionPlanService.findById(subscription.getPlanId());
        if (oldPlan == null) {
            throw new ResourceNotFoundException("기존 플랜을 찾을 수 없습니다.");
        }
        
        // 같은 플랜으로 변경하는 경우
        if (oldPlan.getPlanId().equals(newPlan.getPlanId())) {
            if (autoRenew != null) {
                subscription.setAutoRenew(autoRenew);
                subscription.setUpdatedAt(LocalDateTime.now());
                updateSubscriptionInTransaction(subscription);
            }
            return subscriptionMapper.findById(subscriptionId);
        }
        
        LocalDate today = LocalDate.now();
        Integer oldPrice = oldPlan.getPrice() != null ? oldPlan.getPrice() : 0;
        Integer newPrice = newPlan.getPrice() != null ? newPlan.getPrice() : 0;
        
        // 다운그레이드 (가격 하락 또는 무료 플랜)
        if (newPrice < oldPrice) {
            return handleDowngrade(subscription, newPlan, oldPlan, today, autoRenew);
        } 
        // 업그레이드 (가격 상승)
        else {
            return handleUpgrade(subscription, newPlan, oldPlan, today, autoRenew);
        }
    }
    
    /**
     * 다운그레이드 처리: 기간 끝까지 기존 플랜 유지, 만료일 이후 새 플랜 적용
     */
    private SubscriptionDto handleDowngrade(SubscriptionDto subscription, SubscriptionPlanDto newPlan, 
                                            SubscriptionPlanDto oldPlan, LocalDate today, Boolean autoRenew) {
        logger.info("다운그레이드 처리 - subscriptionId: {}, oldPlan: {}, newPlan: {}", 
            subscription.getSubscriptionId(), oldPlan.getPlanCode(), newPlan.getPlanCode());
        
        // 기존 구독 만료일까지 기존 플랜 유지
        LocalDate changeDate = subscription.getEndDate();
        if (changeDate == null) {
            changeDate = today.plusMonths(1); // 만료일이 없으면 1개월 후
        }
        
        // pending_plan_id와 pending_change_date 설정 (현재 planId는 유지)
        subscription.setPendingPlanId(newPlan.getPlanId());
        subscription.setPendingChangeDate(changeDate);
        if (autoRenew != null) {
            subscription.setAutoRenew(autoRenew);
        }
        // creditAmount 명시적 설정 (변경하지 않으므로 기존 값 유지)
        if (subscription.getCreditAmount() == null) {
            subscription.setCreditAmount(0);
        }
        subscription.setUpdatedAt(LocalDateTime.now());
        
        // 다운그레이드는 subscription 업데이트만 트랜잭션으로 처리
        updateSubscriptionInTransaction(subscription);
        
        logger.info("다운그레이드 예약 완료 - subscriptionId: {}, 현재 플랜: {}, 변경 예정일: {}, 새 플랜: {}", 
            subscription.getSubscriptionId(), oldPlan.getPlanCode(), changeDate, newPlan.getPlanCode());
        return subscriptionMapper.findById(subscription.getSubscriptionId());
    }
    
    /**
     * 업그레이드 처리: 즉시 적용 + 남은 기간 미사용 금액을 크레딧으로 전환
     */
    private SubscriptionDto handleUpgrade(SubscriptionDto subscription, SubscriptionPlanDto newPlan, 
                                         SubscriptionPlanDto oldPlan, LocalDate today, Boolean autoRenew) {
        logger.info("업그레이드 처리 - subscriptionId: {}, oldPlan: {}, newPlan: {}", 
            subscription.getSubscriptionId(), oldPlan.getPlanCode(), newPlan.getPlanCode());
        
        // 남은 기간 계산
        LocalDate endDate = subscription.getEndDate();
        if (endDate == null || endDate.isBefore(today) || endDate.isEqual(today)) {
            endDate = today.plusMonths(1);
        }
        
        long totalDays = ChronoUnit.DAYS.between(subscription.getStartDate(), endDate);
        long remainingDays = ChronoUnit.DAYS.between(today, endDate);
        
        if (remainingDays <= 0) {
            // 남은 기간이 없으면 그냥 새 플랜으로 전환
            subscription.setPlanId(newPlan.getPlanId());
            subscription.setStartDate(today);
            subscription.setEndDate(today.plusMonths(1));
            subscription.setPendingPlanId(null);
            subscription.setPendingChangeDate(null);
            if (autoRenew != null) {
                subscription.setAutoRenew(autoRenew);
            }
            subscription.setUpdatedAt(LocalDateTime.now());
            
            // subscription 업데이트를 먼저 커밋하여 외래키 잠금 문제 방지
            commitSubscriptionUpdate(subscription);
            
            // subscription 업데이트가 완전히 커밋된 후 결제 처리 (별도 트랜잭션)
            Long subscriptionId = subscription.getSubscriptionId();
            Long companyId = subscription.getCompanyId();
            processPaymentAfterUpgrade(subscriptionId, companyId, newPlan, false);
            
            return subscriptionMapper.findById(subscriptionId);
        }
        
        // 남은 기간의 미사용 금액을 크레딧으로 전환
        Integer oldPrice = oldPlan.getPrice() != null ? oldPlan.getPrice() : 0;
        if (oldPrice > 0 && totalDays > 0) {
            int unusedAmount = (int) (oldPrice * remainingDays / totalDays);
            if (unusedAmount > 0) {
                try {
                    creditService.addCredit(
                        subscription.getCompanyId(),
                        unusedAmount,
                        String.format("플랜 다운그레이드 크레딧 (%s → %s)", oldPlan.getPlanName(), newPlan.getPlanName()),
                        null // 만료일 없음
                    );
                    logger.info("크레딧 전환 완료 - companyId: {}, amount: {}, remainingDays: {}/{}", 
                        subscription.getCompanyId(), unusedAmount, remainingDays, totalDays);
                } catch (Exception e) {
                    logger.warn("크레딧 전환 실패", e);
                }
            }
        }
        
        // 즉시 새 플랜으로 전환
        subscription.setPlanId(newPlan.getPlanId());
        subscription.setStartDate(today);
        subscription.setEndDate(today.plusMonths(1)); // 전환일부터 1개월
        subscription.setPendingPlanId(null);
        subscription.setPendingChangeDate(null);
        if (autoRenew != null) {
            subscription.setAutoRenew(autoRenew);
        }
        // creditAmount 명시적 설정 (변경하지 않으므로 기존 값 유지)
        if (subscription.getCreditAmount() == null) {
            subscription.setCreditAmount(0);
        }
        subscription.setUpdatedAt(LocalDateTime.now());
        
        // subscription 업데이트를 먼저 커밋하여 외래키 잠금 문제 방지
        commitSubscriptionUpdate(subscription);
        
        // subscription 업데이트가 완전히 커밋된 후 결제 처리 (별도 트랜잭션)
        Long subscriptionId = subscription.getSubscriptionId();
        Long companyId = subscription.getCompanyId();
        processPaymentAfterUpgrade(subscriptionId, companyId, newPlan, true);
        
        logger.info("업그레이드 완료 - subscriptionId: {}, newPlan: {}, nextPaymentDate: {}", 
            subscriptionId, newPlan.getPlanCode(), subscription.getEndDate());
        return subscriptionMapper.findById(subscriptionId);
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
     * - pending_plan_id가 있으면 해당 플랜으로 전환
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
        
        // pending 플랜이 있으면 해당 플랜으로 전환 (다운그레이드 처리)
        if (subscription.getPendingPlanId() != null && subscription.getPendingChangeDate() != null) {
            LocalDate today = LocalDate.now();
            if (subscription.getPendingChangeDate().isBefore(today) || subscription.getPendingChangeDate().isEqual(today)) {
                SubscriptionPlanDto pendingPlan = subscriptionPlanService.findById(subscription.getPendingPlanId());
                if (pendingPlan != null && pendingPlan.getIsActive()) {
                    // pending 플랜으로 전환
                    subscription.setPlanId(pendingPlan.getPlanId());
                    subscription.setPendingPlanId(null);
                    subscription.setPendingChangeDate(null);
                    subscription.setStartDate(today);
                    subscription.setEndDate(today.plusMonths(1));
                    subscription.setUpdatedAt(LocalDateTime.now());
                    
                    // subscription 업데이트를 먼저 커밋하여 외래키 잠금 문제 방지
                    commitSubscriptionUpdate(subscription);
                    logger.info("다운그레이드 플랜 전환 완료 - subscriptionId: {}, newPlan: {}", 
                        subscriptionId, pendingPlan.getPlanCode());
                    
                    // subscription 업데이트가 완전히 커밋된 후 결제 처리 (별도 트랜잭션)
                    processPaymentAfterPlanChange(subscriptionId, companyId, pendingPlan);
                    return;
                }
            }
        }
        
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
     * 대기 중인 플랜 변경 조회 (스케줄러용)
     */
    public List<SubscriptionDto> findPendingPlanChanges() {
        return subscriptionMapper.findPendingPlanChanges(LocalDate.now());
    }
    
    /**
     * 대기 중인 플랜 변경 처리 (스케줄러용)
     * 다운그레이드 예정 플랜을 실제로 전환
     */
    @Transactional
    public void processPendingPlanChange(Long subscriptionId) {
        SubscriptionDto subscription = subscriptionMapper.findById(subscriptionId);
        if (subscription == null || !"ACTIVE".equals(subscription.getStatus())) {
            return;
        }
        
        if (subscription.getPendingPlanId() == null || subscription.getPendingChangeDate() == null) {
            return;
        }
        
        LocalDate today = LocalDate.now();
        if (subscription.getPendingChangeDate().isAfter(today)) {
            return; // 아직 전환일이 아님
        }
        
        SubscriptionPlanDto pendingPlan = subscriptionPlanService.findById(subscription.getPendingPlanId());
        if (pendingPlan == null || !pendingPlan.getIsActive()) {
            logger.warn("대기 중인 플랜이 유효하지 않음 - subscriptionId: {}, pendingPlanId: {}", 
                subscriptionId, subscription.getPendingPlanId());
            return;
        }
        
        Long companyId = subscription.getCompanyId();
        
        // pending 플랜으로 전환
        subscription.setPlanId(pendingPlan.getPlanId());
        subscription.setPendingPlanId(null);
        subscription.setPendingChangeDate(null);
        subscription.setStartDate(today);
        subscription.setEndDate(today.plusMonths(1));
        subscription.setUpdatedAt(LocalDateTime.now());
        
        // subscription 업데이트를 먼저 커밋하여 외래키 잠금 문제 방지
        commitSubscriptionUpdate(subscription);
        logger.info("대기 중인 플랜 전환 완료 - subscriptionId: {}, newPlan: {}", 
            subscriptionId, pendingPlan.getPlanCode());
        
        // subscription 업데이트가 완전히 커밋된 후 결제 처리 (별도 트랜잭션)
        processPaymentAfterPlanChange(subscriptionId, companyId, pendingPlan);
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
     * 구독 업데이트를 별도 트랜잭션으로 처리 (데드락 방지)
     * 상위 트랜잭션이 없어도 독립적으로 실행됨
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void updateSubscriptionInTransaction(SubscriptionDto subscription) {
        int result = subscriptionMapper.update(subscription);
        if (result <= 0) {
            throw new BusinessException("구독 업데이트에 실패했습니다.");
        }
        logger.debug("구독 업데이트 완료 - subscriptionId: {}", subscription.getSubscriptionId());
    }
    
    /**
     * 구독 업데이트를 별도 트랜잭션으로 커밋 (외래키 잠금 문제 방지)
     * subscription 업데이트를 먼저 커밋한 후 payment 생성 시 데드락 방지
     * commitSubscriptionUpdate는 updateSubscriptionInTransaction의 별칭으로 사용
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void commitSubscriptionUpdate(SubscriptionDto subscription) {
        updateSubscriptionInTransaction(subscription);
    }
    
    /**
     * 업그레이드 후 결제 처리 (별도 트랜잭션으로 완전히 분리)
     * subscription 업데이트가 완전히 커밋된 후 실행되어 데드락 방지
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void processPaymentAfterUpgrade(Long subscriptionId, Long companyId, 
                                          SubscriptionPlanDto newPlan, boolean useCredit) {
        if (newPlan.getPrice() == null || newPlan.getPrice() <= 0) {
            return;
        }
        
        logger.info("업그레이드 결제 처리 시작 - subscriptionId: {}, newPlanPrice: {}", 
            subscriptionId, newPlan.getPrice());
        
        try {
            Integer creditUsed = 0;
            Integer actualPayment = newPlan.getPrice();
            
            // 크레딧 사용 여부에 따라 처리
            if (useCredit) {
                creditUsed = creditService.useCredit(companyId, newPlan.getPrice());
                actualPayment = newPlan.getPrice() - creditUsed;
                
                logger.info("크레딧 사용 완료 - subscriptionId: {}, creditUsed: {}, actualPayment: {}", 
                    subscriptionId, creditUsed, actualPayment);
            }
            
            // 실제 결제 금액이 있으면 결제 내역 생성
            if (actualPayment > 0) {
                logger.info("실제 결제 내역 생성 시도 - subscriptionId: {}, amount: {}", 
                    subscriptionId, actualPayment);
                try {
                    paymentService.createPayment(subscriptionId, actualPayment, "CARD", companyId);
                    logger.info("업그레이드 결제 완료 - subscriptionId: {}, amount: {}, creditUsed: {}", 
                        subscriptionId, actualPayment, creditUsed);
                } catch (Exception e) {
                    logger.error("결제 내역 생성 실패 (구독 변경은 유지) - subscriptionId: {}, amount: {}", 
                        subscriptionId, actualPayment, e);
                }
            } else {
                logger.info("실제 결제 금액이 0원이므로 결제 내역 생성 건너뜀 - subscriptionId: {}", 
                    subscriptionId);
            }
            
            // 크레딧 사용 기록 (양수 금액으로 저장, payment_method로 구분)
            if (creditUsed > 0) {
                try {
                    paymentService.createPayment(subscriptionId, creditUsed, "CREDIT_USED", companyId);
                    logger.info("크레딧 사용 기록 - subscriptionId: {}, creditUsed: {}", 
                        subscriptionId, creditUsed);
                } catch (Exception e) {
                    logger.error("크레딧 사용 기록 실패 (구독 변경은 유지) - subscriptionId: {}, creditUsed: {}", 
                        subscriptionId, creditUsed, e);
                }
            }
        } catch (Exception e) {
            logger.error("결제 처리 중 오류 발생 (구독 변경은 유지) - subscriptionId: {}", 
                subscriptionId, e);
        }
    }
    
    /**
     * 플랜 변경 후 결제 처리 (별도 트랜잭션으로 완전히 분리)
     * subscription 업데이트가 완전히 커밋된 후 실행되어 데드락 방지
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void processPaymentAfterPlanChange(Long subscriptionId, Long companyId, SubscriptionPlanDto plan) {
        if (plan.getPrice() == null || plan.getPrice() <= 0) {
            return;
        }
        
        try {
            Integer creditUsed = creditService.useCredit(companyId, plan.getPrice());
            Integer actualPayment = plan.getPrice() - creditUsed;
            
            if (actualPayment > 0) {
                try {
                    paymentService.createPayment(subscriptionId, actualPayment, "CARD", companyId);
                } catch (Exception e) {
                    logger.error("결제 내역 생성 실패 (구독 변경은 유지) - subscriptionId: {}, amount: {}", 
                        subscriptionId, actualPayment, e);
                }
            }
            if (creditUsed > 0) {
                try {
                    paymentService.createPayment(subscriptionId, creditUsed, "CREDIT_USED", companyId);
                } catch (Exception e) {
                    logger.error("크레딧 사용 기록 실패 (구독 변경은 유지) - subscriptionId: {}, creditUsed: {}", 
                        subscriptionId, creditUsed, e);
                }
            }
        } catch (Exception e) {
            logger.error("결제 처리 중 오류 발생 (구독 변경은 유지) - subscriptionId: {}", 
                subscriptionId, e);
        }
    }
    
    /**
     * 회사 테이블의 subscription_id 업데이트
     */
    private void updateCompanySubscriptionId(Long companyId, Long subscriptionId) {
        companyMapper.updateSubscriptionId(companyId, subscriptionId);
    }
    
    /**
     * 전체 구독 목록 조회 (SUPERADMIN 전용)
     */
    public List<SubscriptionDto> getAllSubscriptions() {
        return subscriptionMapper.findAll();
    }
}

