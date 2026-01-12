-- =====================================================
-- InnerSignature 덤프 비교 스크립트
-- 로컬 vs 배포서버 데이터베이스 구조 비교
-- =====================================================

-- 📋 사용 방법:
-- 1. 로컬과 배포서버에서 각각 다음 쿼리를 실행하여 결과를 저장
-- 2. 결과를 비교하여 차이점 분석
-- 3. 필요한 마이그레이션 스크립트 생성

-- =====================================================
-- 1. 테이블 구조 비교
-- =====================================================

-- 테이블 목록 및 기본 정보
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    AVG_ROW_LENGTH,
    DATA_LENGTH,
    INDEX_LENGTH,
    CREATE_TIME,
    UPDATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%_tb'
ORDER BY TABLE_NAME;

-- =====================================================
-- 2. 컬럼 구조 비교
-- =====================================================

-- 각 테이블의 컬럼 정보
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    EXTRA,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%_tb'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- =====================================================
-- 3. 인덱스 비교
-- =====================================================

-- 인덱스 정보
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- =====================================================
-- 4. 외래키 제약조건 비교
-- =====================================================

-- FK 제약조건 정보
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    UPDATE_RULE,
    DELETE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- =====================================================
-- 5. 기본 데이터 비교 (시드 데이터)
-- =====================================================

-- 구독 플랜 데이터
SELECT 'subscription_plans' as data_type, plan_code, plan_name, price, max_users
FROM subscription_plan_tb
ORDER BY plan_id;

-- 지출 카테고리 데이터 (전역)
SELECT 'expense_categories' as data_type, category_name, display_order
FROM expense_category_tb
WHERE company_id IS NULL
ORDER BY display_order;

-- 계정과목 매핑 데이터 (전역)
SELECT 'account_mappings' as data_type, category, account_code, account_name
FROM account_code_mapping_tb
WHERE company_id IS NULL
ORDER BY category;

-- =====================================================
-- 6. 데이터 건수 비교
-- =====================================================

-- 각 테이블의 레코드 수
SELECT
    'user_tb' as table_name, COUNT(*) as record_count FROM user_tb
UNION ALL
SELECT 'company_tb' as table_name, COUNT(*) as record_count FROM company_tb
UNION ALL
SELECT 'subscription_tb' as table_name, COUNT(*) as record_count FROM subscription_tb
UNION ALL
SELECT 'expense_report_tb' as table_name, COUNT(*) as record_count FROM expense_report_tb
UNION ALL
SELECT 'expense_detail_tb' as table_name, COUNT(*) as record_count FROM expense_detail_tb
UNION ALL
SELECT 'approval_line_tb' as table_name, COUNT(*) as record_count FROM approval_line_tb
UNION ALL
SELECT 'receipt_tb' as table_name, COUNT(*) as record_count FROM receipt_tb
ORDER BY record_count DESC;

-- =====================================================
-- 7. 최근 변경사항 확인
-- =====================================================

-- 최근 생성된 테이블
SELECT
    TABLE_NAME,
    CREATE_TIME,
    UPDATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%_tb'
    AND CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY CREATE_TIME DESC;

-- 최근 업데이트된 테이블
SELECT
    TABLE_NAME,
    UPDATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%_tb'
    AND UPDATE_TIME >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY UPDATE_TIME DESC;

-- =====================================================
-- 📊 비교 방법:
-- =====================================================
--
-- 1. 두 환경에서 이 스크립트를 실행하여 결과를 파일로 저장
-- 2. diff 툴이나 Excel로 비교:
--    - 테이블 목록이 동일한지 확인
--    - 컬럼 구조가 동일한지 확인
--    - 인덱스가 동일한지 확인
--    - FK 제약조건이 동일한지 확인
--    - 시드 데이터가 동일한지 확인
--
-- 3. 차이점 발견 시:
--    - 로컬에 없는 테이블/컬럼 → 마이그레이션 스크립트 생성
--    - 배포서버에 없는 변경사항 → 배포 계획 수립
--    - 시드 데이터 차이 → 데이터 동기화 계획 수립
--
-- =====================================================
