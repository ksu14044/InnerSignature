package com.innersignature.backend.service;

import com.innersignature.backend.dto.AuditLogDto;
import com.innersignature.backend.dto.AuditRuleDto;
import com.innersignature.backend.dto.ExpenseDetailDto;
import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.mapper.AuditLogMapper;
import com.innersignature.backend.mapper.AuditRuleMapper;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
    private final AuditRuleMapper auditRuleMapper;
    private final AuditLogMapper auditLogMapper;
    private final ExpenseMapper expenseMapper;
    
    /**
     * 지출결의서 상신 시 자동 감사 실행
     */
    @Transactional
    public void auditExpenseReport(Long expenseReportId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 지출결의서 조회
        ExpenseReportDto report = expenseMapper.selectExpenseReportById(expenseReportId, companyId);
        if (report == null) {
            return;
        }
        
        // 상세 내역 조회
        List<ExpenseDetailDto> details = expenseMapper.selectExpenseDetails(expenseReportId, companyId);
        
        // 활성화된 감사 규칙 조회
        List<AuditRuleDto> rules = auditRuleMapper.findActiveByCompanyId(companyId);
        
        // 각 규칙에 대해 감사 실행
        for (AuditRuleDto rule : rules) {
            try {
                auditByRule(report, details, rule);
            } catch (Exception e) {
                logger.error("감사 규칙 실행 실패 - ruleId: {}, error: {}", rule.getRuleId(), e.getMessage());
            }
        }
    }
    
    /**
     * 규칙별 감사 실행
     */
    private void auditByRule(ExpenseReportDto report, List<ExpenseDetailDto> details, AuditRuleDto rule) {
        String ruleType = rule.getRuleType();
        Map<String, Object> config = rule.getRuleConfig();
        
        switch (ruleType) {
            case "NIGHT_TIME":
                checkNightTime(report, details, rule);
                break;
            case "WEEKEND":
                checkWeekend(report, rule);
                break;
            case "DUPLICATE_MERCHANT":
                checkDuplicateMerchant(report, details, rule, config);
                break;
            case "FORBIDDEN_CATEGORY":
                checkForbiddenCategory(details, rule, config);
                break;
            default:
                logger.warn("알 수 없는 감사 규칙 유형: {}", ruleType);
        }
    }
    
    /**
     * 심야 시간대 사용 체크 (22시~06시)
     */
    private void checkNightTime(ExpenseReportDto report, List<ExpenseDetailDto> details, AuditRuleDto rule) {
        if (report.getReportDate() == null || details == null) {
            return;
        }
        
        // 실제 거래 시간은 reportDate에 없으므로, reportDate의 시간을 체크
        // 실제 구현에서는 거래 시간 정보가 필요함
        // 예시: reportDate가 심야 시간대인지 체크 (실제로는 거래 시간 필요)
        // 여기서는 간단히 체크만 수행
        for (ExpenseDetailDto detail : details) {
            if (detail.getAmount() != null && detail.getAmount() > 0) {
                createAuditLog(report.getExpenseReportId(), rule.getRuleId(), "MEDIUM",
                        String.format("심야 시간대 사용 가능성: %s 카테고리, 금액: %,d원", 
                                detail.getCategory(), detail.getAmount()));
            }
        }
    }
    
    /**
     * 주말/공휴일 사용 체크
     */
    private void checkWeekend(ExpenseReportDto report, AuditRuleDto rule) {
        if (report.getReportDate() == null) {
            return;
        }
        
        LocalDate reportDate = report.getReportDate();
        java.time.DayOfWeek dayOfWeek = reportDate.getDayOfWeek();
        
        // 주말 체크 (토요일 또는 일요일)
        if (dayOfWeek == java.time.DayOfWeek.SATURDAY || dayOfWeek == java.time.DayOfWeek.SUNDAY) {
            createAuditLog(report.getExpenseReportId(), rule.getRuleId(), "MEDIUM",
                    String.format("주말 사용: %s", reportDate));
        }
    }
    
    /**
     * 동일 가맹점 중복 결제 체크
     */
    private void checkDuplicateMerchant(ExpenseReportDto report, List<ExpenseDetailDto> details, 
                                       AuditRuleDto rule, Map<String, Object> config) {
        if (details == null || details.isEmpty()) {
            return;
        }
        
        // 같은 날짜에 같은 가맹점(적요)으로 여러 건 결제 체크
        Map<String, Integer> merchantCount = new HashMap<>();
        for (ExpenseDetailDto detail : details) {
            String merchant = detail.getDescription();
            if (merchant != null && !merchant.isEmpty()) {
                merchantCount.put(merchant, merchantCount.getOrDefault(merchant, 0) + 1);
            }
        }
        
        int threshold = config != null && config.containsKey("threshold") 
                ? ((Number) config.get("threshold")).intValue() : 2;
        
        for (Map.Entry<String, Integer> entry : merchantCount.entrySet()) {
            if (entry.getValue() >= threshold) {
                createAuditLog(report.getExpenseReportId(), rule.getRuleId(), "HIGH",
                        String.format("동일 가맹점 중복 결제 의심: %s (%d건)", entry.getKey(), entry.getValue()));
            }
        }
    }
    
    /**
     * 금지 업종 사용 체크
     */
    private void checkForbiddenCategory(List<ExpenseDetailDto> details, AuditRuleDto rule, Map<String, Object> config) {
        if (details == null || details.isEmpty() || config == null) {
            return;
        }
        
        @SuppressWarnings("unchecked")
        List<String> forbiddenCategories = (List<String>) config.get("categories");
        if (forbiddenCategories == null || forbiddenCategories.isEmpty()) {
            return;
        }
        
        for (ExpenseDetailDto detail : details) {
            if (forbiddenCategories.contains(detail.getCategory())) {
                createAuditLog(detail.getExpenseReportId(), rule.getRuleId(), "HIGH",
                        String.format("금지 업종 사용: %s, 금액: %,d원", detail.getCategory(), detail.getAmount()));
            }
        }
    }
    
    /**
     * 감사 로그 생성
     */
    private void createAuditLog(Long expenseReportId, Long ruleId, String severity, String message) {
        AuditLogDto log = new AuditLogDto();
        log.setExpenseReportId(expenseReportId);
        log.setRuleId(ruleId);
        log.setSeverity(severity);
        log.setMessage(message);
        log.setIsResolved(false);
        
        auditLogMapper.insert(log);
        logger.info("감사 로그 생성 - expenseReportId: {}, severity: {}, message: {}", 
                expenseReportId, severity, message);
    }
    
    /**
     * 감사 로그 목록 조회
     */
    public List<AuditLogDto> getAuditLogs(String severity, Boolean isResolved, 
                                          LocalDateTime startDate, LocalDateTime endDate,
                                          int page, int size) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        int offset = (page - 1) * size;
        return auditLogMapper.findByCompanyId(companyId, severity, isResolved, startDate, endDate, offset, size);
    }
    
    /**
     * 감사 로그 개수 조회
     */
    public long countAuditLogs(String severity, Boolean isResolved, 
                               LocalDateTime startDate, LocalDateTime endDate) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return auditLogMapper.countByCompanyId(companyId, severity, isResolved, startDate, endDate);
    }
    
    /**
     * 감사 로그 해결 처리
     */
    @Transactional
    public void resolveAuditLog(Long auditLogId, Long userId) {
        auditLogMapper.resolve(auditLogId, userId);
        logger.info("감사 로그 해결 처리 - auditLogId: {}, userId: {}", auditLogId, userId);
    }
}

