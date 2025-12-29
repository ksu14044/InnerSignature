package com.innersignature.backend.service;

import com.innersignature.backend.dto.MonthlyClosingDto;
import com.innersignature.backend.exception.BusinessException;
import com.innersignature.backend.mapper.MonthlyClosingMapper;
import com.innersignature.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MonthlyClosingService {
    
    private static final Logger logger = LoggerFactory.getLogger(MonthlyClosingService.class);
    private final MonthlyClosingMapper monthlyClosingMapper;
    
    /**
     * 월 마감 처리
     * @param year 년도
     * @param month 월 (1-12)
     * @param userId 마감 처리한 사용자 ID
     * @return 생성된 마감 정보
     */
    @Transactional
    public MonthlyClosingDto closeMonth(Integer year, Integer month, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        // 유효성 검사
        if (year == null || month == null || month < 1 || month > 12) {
            throw new BusinessException("올바른 년도와 월을 입력해주세요.");
        }
        
        // 이미 마감된 월인지 확인
        if (monthlyClosingMapper.isClosed(companyId, year, month)) {
            throw new BusinessException(String.format("%d년 %d월은 이미 마감되었습니다.", year, month));
        }
        
        // 마감 정보 생성
        MonthlyClosingDto closing = new MonthlyClosingDto();
        closing.setCompanyId(companyId);
        closing.setClosingYear(year);
        closing.setClosingMonth(month);
        closing.setClosedBy(userId);
        closing.setClosedAt(LocalDateTime.now());
        closing.setIsClosed(true);
        
        int result = monthlyClosingMapper.insert(closing);
        if (result > 0) {
            logger.info("월 마감 처리 완료 - companyId: {}, year: {}, month: {}, userId: {}", 
                    companyId, year, month, userId);
            return monthlyClosingMapper.findByCompanyAndDate(companyId, year, month);
        } else {
            throw new BusinessException("월 마감 처리에 실패했습니다.");
        }
    }
    
    /**
     * 월 마감 해제
     * @param closingId 마감 ID
     * @param userId 해제 처리한 사용자 ID
     */
    @Transactional
    public void reopenMonth(Long closingId, Long userId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        
        MonthlyClosingDto closing = monthlyClosingMapper.findById(closingId, companyId);
        if (closing == null) {
            throw new BusinessException("마감 정보를 찾을 수 없습니다.");
        }
        
        if (!closing.getIsClosed()) {
            throw new BusinessException("이미 해제된 마감입니다.");
        }
        
        int result = monthlyClosingMapper.reopen(closingId, companyId);
        if (result > 0) {
            logger.info("월 마감 해제 완료 - closingId: {}, userId: {}", closingId, userId);
        } else {
            throw new BusinessException("월 마감 해제에 실패했습니다.");
        }
    }
    
    /**
     * 회사별 마감 목록 조회
     */
    public List<MonthlyClosingDto> getClosingList() {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return monthlyClosingMapper.findByCompanyId(companyId);
    }
    
    /**
     * 특정 월이 마감되었는지 확인
     */
    public boolean isMonthClosed(Integer year, Integer month) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        return monthlyClosingMapper.isClosed(companyId, year, month);
    }
    
    /**
     * 특정 날짜가 속한 월이 마감되었는지 확인
     */
    public boolean isDateClosed(java.time.LocalDate date) {
        if (date == null) {
            return false;
        }
        return isMonthClosed(date.getYear(), date.getMonthValue());
    }
}

