-- expense_detail_tb에 payment_method 컬럼 추가
-- 상세 항목별 결제수단을 저장하기 위한 필드
-- 결제수단에 따라 전표의 대변 계정과목이 결정됨

ALTER TABLE `expense_detail_tb`
ADD COLUMN `payment_method` VARCHAR(50) NULL COMMENT '결제수단 (CASH, BANK_TRANSFER, CARD, CHECK 등)' AFTER `actual_paid_amount`;




