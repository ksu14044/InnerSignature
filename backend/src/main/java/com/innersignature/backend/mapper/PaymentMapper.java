package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.PaymentDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaymentMapper {
    // 결제 내역 생성
    int insert(PaymentDto payment);
    
    // 결제 ID로 조회
    PaymentDto findById(@Param("paymentId") Long paymentId);
    
    // 구독의 모든 결제 내역 조회
    List<PaymentDto> findBySubscriptionId(@Param("subscriptionId") Long subscriptionId);
    
    // 회사의 모든 결제 내역 조회
    List<PaymentDto> findByCompanyId(@Param("companyId") Long companyId);
    
    // 결제 상태 업데이트
    int updateStatus(@Param("paymentId") Long paymentId, 
                     @Param("paymentStatus") String paymentStatus);
    
    // 전체 결제 내역 조회 (SUPERADMIN 전용)
    List<PaymentDto> findAll();
}

