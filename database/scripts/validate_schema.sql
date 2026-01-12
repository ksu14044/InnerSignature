-- =====================================================
-- InnerSignature 데이터베이스 스키마 검증 스크립트
-- 배포서버덤프확인 기준 스키마 검증
-- =====================================================

-- 1. 테이블 존재 여부 검증
SELECT 'Checking table existence...' as status;

SELECT
    'subscription_plan_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscription_plan_tb'

UNION ALL

SELECT
    'user_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_tb'

UNION ALL

SELECT
    'company_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'company_tb'

UNION ALL

SELECT
    'expense_report_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expense_report_tb'

UNION ALL

SELECT
    'expense_detail_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expense_detail_tb'

UNION ALL

SELECT
    'approval_line_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'approval_line_tb'

UNION ALL

SELECT
    'receipt_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipt_tb'

UNION ALL

SELECT
    'subscription_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscription_tb'

UNION ALL

SELECT
    'account_code_mapping_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'account_code_mapping_tb'

UNION ALL

SELECT
    'expense_category_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expense_category_tb'

UNION ALL

SELECT
    'audit_log_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_log_tb'

UNION ALL

SELECT
    'audit_rule_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_rule_tb'

UNION ALL

SELECT
    'budget_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'budget_tb'

UNION ALL

SELECT
    'monthly_closing_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'monthly_closing_tb'

UNION ALL

SELECT
    'company_card_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'company_card_tb'

UNION ALL

SELECT
    'user_card_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_card_tb'

UNION ALL

SELECT
    'user_approver_mapping_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_approver_mapping_tb'

UNION ALL

SELECT
    'user_signature_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_signature_tb'

UNION ALL

SELECT
    'password_reset_token_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'password_reset_token_tb'

UNION ALL

SELECT
    'payment_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_tb'

UNION ALL

SELECT
    'credit_tb' as expected_table,
    CASE WHEN COUNT(*) > 0 THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'credit_tb';

-- 2. 외래키 제약조건 검증
SELECT '\nChecking foreign key constraints...' as status;

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- 3. 인덱스 검증
SELECT '\nChecking indexes...' as status;

SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- 4. 기본 데이터 검증
SELECT '\nChecking seed data...' as status;

SELECT
    'subscription_plans' as data_type,
    COUNT(*) as count,
    'Expected: 2 (FREE, PRO)' as expected
FROM subscription_plan_tb

UNION ALL

SELECT
    'expense_categories' as data_type,
    COUNT(*) as count,
    'Expected: 12 (global categories)' as expected
FROM expense_category_tb
WHERE company_id IS NULL

UNION ALL

SELECT
    'account_code_mappings' as data_type,
    COUNT(*) as count,
    'Expected: 12 (global mappings)' as expected
FROM account_code_mapping_tb
WHERE company_id IS NULL;

-- 5. 테이블 구조 요약
SELECT '\nTable structure summary...' as status;

SELECT
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH / 1024 as data_kb,
    INDEX_LENGTH / 1024 as index_kb,
    (DATA_LENGTH + INDEX_LENGTH) / 1024 as total_kb
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%_tb'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
