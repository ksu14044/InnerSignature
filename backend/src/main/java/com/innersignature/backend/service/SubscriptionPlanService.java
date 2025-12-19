package com.innersignature.backend.service;

import com.innersignature.backend.dto.SubscriptionPlanDto;
import com.innersignature.backend.exception.ResourceNotFoundException;
import com.innersignature.backend.mapper.SubscriptionPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanService {
    
    private final SubscriptionPlanMapper subscriptionPlanMapper;
    
    /**
     * 모든 활성 플랜 조회
     */
    public List<SubscriptionPlanDto> findAllActive() {
        return subscriptionPlanMapper.findAllActive();
    }
    
    /**
     * 플랜 ID로 조회
     */
    public SubscriptionPlanDto findById(Long planId) {
        SubscriptionPlanDto plan = subscriptionPlanMapper.findById(planId);
        if (plan == null) {
            throw new ResourceNotFoundException("플랜을 찾을 수 없습니다.");
        }
        return plan;
    }
    
    /**
     * 플랜 코드로 조회
     */
    public SubscriptionPlanDto findByCode(String planCode) {
        SubscriptionPlanDto plan = subscriptionPlanMapper.findByCode(planCode);
        if (plan == null) {
            throw new ResourceNotFoundException("플랜을 찾을 수 없습니다.");
        }
        return plan;
    }
}

