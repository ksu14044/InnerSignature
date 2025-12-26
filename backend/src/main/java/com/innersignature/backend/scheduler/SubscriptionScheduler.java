package com.innersignature.backend.scheduler;

import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 구독 만료 체크 및 처리 스케줄러
 */
@Component
@RequiredArgsConstructor
public class SubscriptionScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(SubscriptionScheduler.class);
    private final SubscriptionService subscriptionService;
    
    /**
     * 매일 자정에 만료된 구독 체크 및 처리, 대기 중인 플랜 변경 처리
     * cron 표현식: 초 분 시 일 월 요일
     * "0 0 0 * * ?" = 매일 자정 (00:00:00)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkExpiredSubscriptions() {
        logger.info("만료된 구독 체크 시작");
        
        try {
            List<SubscriptionDto> expiredSubscriptions = subscriptionService.findExpiredSubscriptions();
            
            logger.info("만료된 구독 수: {}", expiredSubscriptions.size());
            
            for (SubscriptionDto subscription : expiredSubscriptions) {
                try {
                    subscriptionService.expireSubscription(subscription.getSubscriptionId());
                    logger.info("구독 만료 처리 완료 - subscriptionId: {}, companyId: {}", 
                        subscription.getSubscriptionId(), subscription.getCompanyId());
                } catch (Exception e) {
                    logger.error("구독 만료 처리 실패 - subscriptionId: {}", 
                        subscription.getSubscriptionId(), e);
                }
            }
            
            logger.info("만료된 구독 체크 완료");
        } catch (Exception e) {
            logger.error("만료된 구독 체크 중 오류 발생", e);
        }
        
        // 대기 중인 플랜 변경 처리 (다운그레이드)
        logger.info("대기 중인 플랜 변경 처리 시작");
        
        try {
            List<SubscriptionDto> pendingChanges = subscriptionService.findPendingPlanChanges();
            
            logger.info("대기 중인 플랜 변경 수: {}", pendingChanges.size());
            
            for (SubscriptionDto subscription : pendingChanges) {
                try {
                    subscriptionService.processPendingPlanChange(subscription.getSubscriptionId());
                    logger.info("대기 중인 플랜 변경 처리 완료 - subscriptionId: {}, companyId: {}", 
                        subscription.getSubscriptionId(), subscription.getCompanyId());
                } catch (Exception e) {
                    logger.error("대기 중인 플랜 변경 처리 실패 - subscriptionId: {}", 
                        subscription.getSubscriptionId(), e);
                }
            }
            
            logger.info("대기 중인 플랜 변경 처리 완료");
        } catch (Exception e) {
            logger.error("대기 중인 플랜 변경 처리 중 오류 발생", e);
        }
    }
    
    /**
     * 매일 오전 9시에 만료 예정 구독 체크 (7일 전, 1일 전 알림용)
     * 실제 알림 기능은 추후 구현
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void checkExpiringSoonSubscriptions() {
        logger.info("만료 예정 구독 체크 시작");
        
        try {
            // 7일 전 알림
            List<SubscriptionDto> expiringIn7Days = subscriptionService.findExpiringSoon(7);
            logger.info("7일 후 만료 예정 구독 수: {}", expiringIn7Days.size());
            
            // 1일 전 알림
            List<SubscriptionDto> expiringIn1Day = subscriptionService.findExpiringSoon(1);
            logger.info("1일 후 만료 예정 구독 수: {}", expiringIn1Day.size());
            
            // TODO: 이메일/SMS 알림 기능 구현
            // for (SubscriptionDto subscription : expiringIn7Days) {
            //     emailService.sendExpirationWarning(subscription, 7);
            // }
            // for (SubscriptionDto subscription : expiringIn1Day) {
            //     emailService.sendExpirationWarning(subscription, 1);
            // }
            
            logger.info("만료 예정 구독 체크 완료");
        } catch (Exception e) {
            logger.error("만료 예정 구독 체크 중 오류 발생", e);
        }
    }
}

