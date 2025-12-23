package com.innersignature.backend.service;

import com.innersignature.backend.dto.*;
import com.innersignature.backend.mapper.CompanyMapper;
import com.innersignature.backend.mapper.PaymentMapper;
import com.innersignature.backend.mapper.SubscriptionMapper;
import com.innersignature.backend.mapper.UserMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SUPERADMIN 전용 리포트 서비스
 */
@Service
@RequiredArgsConstructor
public class AdminReportService {
    
    private final UserMapper userMapper;
    private final CompanyMapper companyMapper;
    private final SubscriptionMapper subscriptionMapper;
    private final PaymentMapper paymentMapper;
    
    /**
     * 대시보드 요약 통계 조회
     */
    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto summary = new DashboardSummaryDto();
        
        // 전체 사용자 수
        List<UserDto> allUsers = userMapper.selectAllUsers();
        summary.setTotalUsers(allUsers.size());
        summary.setActiveUsers((int) allUsers.stream()
            .filter(u -> u.getIsActive() != null && u.getIsActive())
            .count());
        
        // 전체 회사 수
        List<CompanyDto> allCompanies = companyMapper.findAll();
        summary.setTotalCompanies(allCompanies.size());
        summary.setActiveCompanies((int) allCompanies.stream()
            .filter(c -> c.getIsActive() != null && c.getIsActive())
            .count());
        
        // 활성 구독 수
        List<SubscriptionDto> allSubscriptions = subscriptionMapper.findAll();
        summary.setActiveSubscriptions((int) allSubscriptions.stream()
            .filter(s -> "ACTIVE".equals(s.getStatus()))
            .count());
        
        // 오늘 결제 금액
        List<PaymentDto> allPayments = paymentMapper.findAll();
        LocalDate today = LocalDate.now();
        int todayRevenue = allPayments.stream()
            .filter(p -> p.getPaymentDate() != null && 
                        p.getPaymentDate().toLocalDate().equals(today) &&
                        "COMPLETED".equals(p.getPaymentStatus()))
            .mapToInt(PaymentDto::getAmount)
            .sum();
        summary.setTodayRevenue(todayRevenue);
        
        // 이번 달 결제 금액
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        int monthRevenue = allPayments.stream()
            .filter(p -> p.getPaymentDate() != null &&
                        !p.getPaymentDate().toLocalDate().isBefore(firstDayOfMonth) &&
                        "COMPLETED".equals(p.getPaymentStatus()))
            .mapToInt(PaymentDto::getAmount)
            .sum();
        summary.setMonthRevenue(monthRevenue);
        
        return summary;
    }
    
    /**
     * 사용자 가입 추이 조회
     * user_tb의 created_at을 기준으로 날짜별 집계
     */
    public List<UserSignupTrendDto> getUserSignupTrend(LocalDate fromDate, LocalDate toDate) {
        return userMapper.selectUserSignupTrend(fromDate, toDate);
    }
    
    /**
     * 매출 추이 조회
     */
    public List<RevenueTrendDto> getRevenueTrend(LocalDate fromDate, LocalDate toDate) {
        List<PaymentDto> allPayments = paymentMapper.findAll();
        
        // 날짜별 매출 집계
        Map<LocalDate, Integer> revenueByDate = allPayments.stream()
            .filter(p -> p.getPaymentDate() != null && "COMPLETED".equals(p.getPaymentStatus()))
            .filter(p -> {
                LocalDate paymentDate = p.getPaymentDate().toLocalDate();
                return !paymentDate.isBefore(fromDate) && !paymentDate.isAfter(toDate);
            })
            .collect(Collectors.groupingBy(
                p -> p.getPaymentDate().toLocalDate(),
                Collectors.summingInt(PaymentDto::getAmount)
            ));
        
        return revenueByDate.entrySet().stream()
            .map(entry -> {
                RevenueTrendDto dto = new RevenueTrendDto();
                dto.setDate(entry.getKey());
                dto.setAmount(entry.getValue());
                return dto;
            })
            .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
            .collect(Collectors.toList());
    }
    
    @Data
    public static class DashboardSummaryDto {
        private int totalUsers;
        private int activeUsers;
        private int totalCompanies;
        private int activeCompanies;
        private int activeSubscriptions;
        private int todayRevenue;
        private int monthRevenue;
    }
    
    @Data
    public static class UserSignupTrendDto {
        private LocalDate date;
        private int count;
    }
    
    @Data
    public static class RevenueTrendDto {
        private LocalDate date;
        private int amount;
    }
}

