-- =====================================================
-- Migration: Add expense_detail_id to receipt_tb (2025-01-13)
-- 영수증을 지출 상세 내역 단위로 연결하기 위한 스키마 변경
-- =====================================================

-- 1. receipt_tb에 expense_detail_id 컬럼 추가 (NULL 허용, 기존 데이터 호환성)
ALTER TABLE `receipt_tb` 
ADD COLUMN `expense_detail_id` BIGINT NULL COMMENT '지출 상세 내역 ID (expense_detail_tb FK)' AFTER `expense_report_id`;

-- 2. 인덱스 추가
ALTER TABLE `receipt_tb` 
ADD KEY `idx_receipt_expense_detail_id` (`expense_detail_id`);

-- 3. 외래키 추가
ALTER TABLE `receipt_tb` 
ADD CONSTRAINT `fk_receipt_detail` 
FOREIGN KEY (`expense_detail_id`) REFERENCES `expense_detail_tb` (`expense_detail_id`) ON DELETE CASCADE;

-- 4. 변경사항 확인을 위한 로그
SELECT 'Migration completed successfully' as status,
       (SELECT COUNT(*) FROM receipt_tb) as total_receipts,
       (SELECT COUNT(*) FROM receipt_tb WHERE expense_detail_id IS NOT NULL) as receipts_with_detail_id;

