package com.innersignature.backend.mapper;

import com.innersignature.backend.dto.AuditLogDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface AuditLogMapper {
    /**
     * 감사 로그 조회
     */
    AuditLogDto findById(@Param("auditLogId") Long auditLogId);
    
    /**
     * 지출결의서별 감사 로그 조회
     */
    List<AuditLogDto> findByExpenseReportId(@Param("expenseReportId") Long expenseReportId);
    
    /**
     * 회사별 감사 로그 목록 조회
     */
    List<AuditLogDto> findByCompanyId(
            @Param("companyId") Long companyId,
            @Param("severity") String severity,
            @Param("isResolved") Boolean isResolved,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("offset") int offset,
            @Param("limit") int limit);
    
    /**
     * 회사별 감사 로그 개수 조회
     */
    long countByCompanyId(
            @Param("companyId") Long companyId,
            @Param("severity") String severity,
            @Param("isResolved") Boolean isResolved,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * 감사 로그 생성
     */
    int insert(AuditLogDto log);
    
    /**
     * 감사 로그 해결 처리
     */
    int resolve(@Param("auditLogId") Long auditLogId, @Param("resolvedBy") Long resolvedBy);
}

