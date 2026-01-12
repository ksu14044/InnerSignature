package com.innersignature.backend.util;

import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.dto.SubscriptionPlanDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.SubscriptionMapper;
import com.innersignature.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 구독 관련 유틸리티 클래스
 */
@Component
@RequiredArgsConstructor
public class SubscriptionUtil {
    
    private final SubscriptionMapper subscriptionMapper;
    private final UserMapper userMapper;
    
    /**
     * 회사의 활성 구독 조회
     */
    public SubscriptionDto getActiveSubscription(Long companyId) {
        if (companyId == null) {
            return null;
        }
        return subscriptionMapper.findActiveByCompanyId(companyId);
    }
    
    /**
     * 구독 상태 확인 (활성 구독이 있는지)
     */
    public boolean hasActiveSubscription(Long companyId) {
        SubscriptionDto subscription = getActiveSubscription(companyId);
        return subscription != null && "ACTIVE".equals(subscription.getStatus());
    }
    
    /**
     * 사용자 수 제한 체크
     * @param companyId 회사 ID
     * @param currentUserCount 현재 사용자 수
     * @return 제한을 초과하면 true
     */
    public boolean isUserLimitExceeded(Long companyId, int currentUserCount) {
        SubscriptionDto subscription = getActiveSubscription(companyId);
        if (subscription == null || subscription.getPlan() == null) {
            // 구독이 없으면 FREE 플랜으로 간주 (최대 2명)
            return currentUserCount >= 2;
        }
        
        SubscriptionPlanDto plan = subscription.getPlan();
        if (plan.getMaxUsers() == null) {
            // 무제한
            return false;
        }
        
        return currentUserCount >= plan.getMaxUsers();
    }
    
    /**
     * 사용자 수 제한 확인 및 예외 발생
     */
    public void checkUserLimit(Long companyId, int currentUserCount) {
        if (isUserLimitExceeded(companyId, currentUserCount)) {
            SubscriptionDto subscription = getActiveSubscription(companyId);
            String planName = subscription != null && subscription.getPlan() != null 
                ? subscription.getPlan().getPlanName() 
                : "무료";
            Integer maxUsers = subscription != null && subscription.getPlan() != null
                ? subscription.getPlan().getMaxUsers()
                : 2;
            
            throw new BusinessException(
                String.format("%s 플랜의 최대 사용자 수(%d명)에 도달했습니다. 플랜을 업그레이드해주세요.", 
                    planName, maxUsers));
        }
    }
    
    /**
     * 기능 활성화 여부 확인
     */
    public boolean isFeatureEnabled(Long companyId, String featureName) {
        SubscriptionDto subscription = getActiveSubscription(companyId);
        if (subscription == null || subscription.getPlan() == null) {
            // 구독이 없으면 FREE 플랜으로 간주
            return false;
        }
        
        SubscriptionPlanDto plan = subscription.getPlan();
        if (plan.getFeatures() == null) {
            return false;
        }
        
        Object feature = plan.getFeatures().get(featureName);
        return feature instanceof Boolean && (Boolean) feature;
    }
    
    /**
     * 기능 활성화 확인 및 예외 발생
     */
    public void checkFeatureEnabled(Long companyId, String featureName, String featureDisplayName) {
        if (!isFeatureEnabled(companyId, featureName)) {
            throw new BusinessException(
                String.format("%s 기능은 현재 플랜에서 사용할 수 없습니다. 플랜을 업그레이드해주세요.", 
                    featureDisplayName));
        }
    }
    
    /**
     * 회사의 현재 사용자 수 조회
     */
    public int getCurrentUserCount(Long companyId) {
        return userMapper.countUsersByCompanyId(companyId);
    }
}

