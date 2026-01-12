-- =====================================================
-- InnerSignature 데이터베이스 인덱스 최적화 스크립트
-- 배포서버덤프확인 기준 최적화된 인덱스들
-- =====================================================

-- ⚠️ 주의사항:
-- 1. 이 스크립트는 테이블 생성 시 이미 대부분의 인덱스가 포함되어 있습니다
-- 2. 추가적인 쿼리 패턴에 따른 인덱스만 선택적으로 추가하세요
-- 3. 인덱스 추가 전 성능 테스트를 권장합니다

-- =====================================================
-- 현재 적용된 주요 인덱스 검토
-- =====================================================

-- 1. 복합 인덱스 (주요 쿼리 패턴 기반)
-- expense_report_tb의 주요 인덱스들:
-- - idx_expense_report_company_status_date (company_id, status, report_date)
-- - idx_expense_report_stats (company_id, status, report_date, drafter_id)
-- - idx_expense_report_date_range (report_date, company_id, status)

-- 2. 외래키 인덱스들 (자동 생성)
-- 모든 FK 컬럼에 대해 자동으로 인덱스가 생성됩니다

-- =====================================================
-- 추가 최적화 인덱스 (선택적)
-- =====================================================

-- 대시보드용 월별 통계 쿼리 최적화
-- CREATE INDEX idx_expense_report_monthly_stats ON expense_report_tb (
--     company_id, YEAR(report_date), MONTH(report_date), status, total_amount
-- );

-- 사용자별 최근 활동 쿼리 최적화
-- CREATE INDEX idx_expense_report_user_recent ON expense_report_tb (
--     drafter_id, report_date DESC, status
-- );

-- 결재 대기 목록 최적화
-- CREATE INDEX idx_approval_line_pending ON approval_line_tb (
--     approver_id, status, approval_date
-- );

-- =====================================================
-- 인덱스 상태 확인 쿼리들
-- =====================================================

-- 현재 인덱스 상태 확인
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY,
    PAGES,
    FILTER_CONDITION
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- 인덱스 사용 통계 확인
SELECT
    object_schema,
    object_name,
    index_name,
    count_read,
    count_fetch,
    count_insert,
    count_update,
    count_delete
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = DATABASE()
ORDER BY count_read DESC;

-- 테이블별 인덱스 크기 확인
SELECT
    TABLE_NAME,
    INDEX_LENGTH,
    DATA_LENGTH,
    (INDEX_LENGTH / DATA_LENGTH) * 100 as index_ratio_percent
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%_tb'
ORDER BY INDEX_LENGTH DESC;

-- =====================================================
-- 인덱스 유지보수 (주기적 실행 권장)
-- =====================================================

-- 인덱스 재구축 (필요시)
-- ANALYZE TABLE user_tb, company_tb, expense_report_tb, expense_detail_tb,
--                  approval_line_tb, receipt_tb, subscription_tb;

-- 오래된 인덱스 통계 업데이트
-- ANALYZE TABLE user_tb, company_tb, expense_report_tb, expense_detail_tb,
--                  approval_line_tb, receipt_tb, subscription_tb;
