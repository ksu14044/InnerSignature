-- PAID 상태를 APPROVED로 마이그레이션하는 스크립트
-- 실행 전 백업을 필수적으로 수행하세요

-- 1. PAID 상태 데이터를 APPROVED로 변경
UPDATE expense_report_tb
SET status = 'APPROVED'
WHERE status = 'PAID';

-- 2. 변경된 데이터 확인
SELECT status, COUNT(*) as count
FROM expense_report_tb
GROUP BY status
ORDER BY status;

-- 3. 변경 로그 기록 (선택사항)
-- INSERT INTO migration_log_tb (description, executed_at)
-- VALUES ('Migrated PAID status to APPROVED status', NOW());
