-- =====================================================
-- InnerSignature 계정 과목 매핑 기본 데이터
-- 배포서버덤프확인 기준 최신 데이터
-- =====================================================

-- 기본 계정 과목 매핑 데이터 입력 (전역 설정)
INSERT INTO account_code_mapping_tb (company_id, category, category_order, account_code, account_name) VALUES
(NULL, '식비/회식', 0, '5320', '복리후생비'),
(NULL, '출장/교통비', 0, '5210', '여비교통비'),
(NULL, '거래처 접대', 0, '5310', '접대비'),
(NULL, '사무용품', 0, '5220', '소모품비'),
(NULL, '수수료', 0, '5230', '지급수수료'),
(NULL, '광고/홍보', 0, '5240', '광고선전비'),
(NULL, '통신비', 0, '5250', '통신비'),
(NULL, '차량비', 0, '5260', '차량유지비'),
(NULL, '도서/인쇄', 0, '5270', '도서인쇄비'),
(NULL, '세금/공과금', 0, '5280', '세금과공과'),
(NULL, '급여', 0, '5110', '급여'),
(NULL, '기타', 0, '5290', '기타비용')
ON DUPLICATE KEY UPDATE
    category_order = VALUES(category_order),
    account_code = VALUES(account_code),
    account_name = VALUES(account_name),
    updated_at = CURRENT_TIMESTAMP;

-- 시드 데이터 입력 완료 확인
SELECT 'Account code mappings seeded successfully' as status, COUNT(*) as total_mappings FROM account_code_mapping_tb WHERE company_id IS NULL;
