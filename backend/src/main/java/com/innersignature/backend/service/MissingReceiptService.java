package com.innersignature.backend.service;

import com.innersignature.backend.dto.ExpenseReportDto;
import com.innersignature.backend.mapper.ExpenseMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MissingReceiptService {
    
    private final ExpenseMapper expenseMapper;
    private final ExpenseService expenseService;
    
    /**
     * 증빙 누락 건 조회 (일정 기간 내에 결의서가 작성되지 않은 건)
     * @param days 경과 일수 (기본값: 3일)
     */
    public List<ExpenseReportDto> getMissingReceipts(int days) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        LocalDate cutoffDate = LocalDate.now().minusDays(days);
        
        // 법인카드 사용 후 결의서가 작성되지 않은 건 조회
        // 실제로는 법인카드 사용 내역 테이블이 필요하지만, 여기서는 예시로 구현
        // 현재는 APPROVED 상태이지만 영수증이 없는 건을 조회
        List<ExpenseReportDto> list = expenseMapper.selectMissingReceipts(companyId, cutoffDate);
        
        // 적요 요약 정보 생성
        for (ExpenseReportDto report : list) {
            expenseService.generateSummaryDescription(report);
        }
        
        return list;
    }
    
    /**
     * 사용자별 미처리 건 목록 조회
     */
    public Map<Long, List<ExpenseReportDto>> getMissingReceiptsByUser(int days) {
        List<ExpenseReportDto> missingReceipts = getMissingReceipts(days);
        Map<Long, List<ExpenseReportDto>> result = new HashMap<>();
        
        for (ExpenseReportDto report : missingReceipts) {
            Long userId = report.getDrafterId();
            result.computeIfAbsent(userId, k -> new java.util.ArrayList<>()).add(report);
        }
        
        return result;
    }
}

