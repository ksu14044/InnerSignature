-- =====================================================
-- InnerSignature 지출 항목 기본 데이터
-- 배포서버덤프확인 기준 최신 데이터
-- =====================================================

-- 기본 지출 항목 데이터 입력 (전역 설정)
INSERT INTO expense_category_tb (company_id, category_name, display_order, is_active) VALUES
(NULL, '식비/회식', 1, 1),
(NULL, '출장/교통비', 2, 1),
(NULL, '거래처 접대', 3, 1),
(NULL, '사무용품', 4, 1),
(NULL, '수수료', 5, 1),
(NULL, '광고/홍보', 6, 1),
(NULL, '통신비', 7, 1),
(NULL, '차량비', 8, 1),
(NULL, '도서/인쇄', 9, 1),
(NULL, '세금/공과금', 10, 1),
(NULL, '급여', 11, 1),
(NULL, '기타', 99, 1)
ON DUPLICATE KEY UPDATE
    display_order = VALUES(display_order),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

-- 시드 데이터 입력 완료 확인
SELECT 'Expense categories seeded successfully' as status, COUNT(*) as total_categories FROM expense_category_tb WHERE company_id IS NULL;
