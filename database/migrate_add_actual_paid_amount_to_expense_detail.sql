-- expense_detail_tb에 actual_paid_amount 컬럼 추가
-- 상세 항목별 실제 지급 금액을 저장하기 위한 필드
-- 결재 금액과 실제 지급 금액이 다를 경우를 처리하기 위한 필드

ALTER TABLE `expense_detail_tb`
ADD COLUMN `actual_paid_amount` DECIMAL(15,0) NULL COMMENT '실제 지급 금액 (결재 금액과 다를 수 있음)' AFTER `amount`;

