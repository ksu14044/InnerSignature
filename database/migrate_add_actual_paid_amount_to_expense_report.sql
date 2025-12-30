-- 실제 지급 금액 및 차이 사유 필드 추가
-- 결재 금액과 실제 지급 금액이 다를 경우를 처리하기 위한 필드

ALTER TABLE `expense_report_tb`
ADD COLUMN `actual_paid_amount` DECIMAL(15,0) NULL COMMENT '실제 지급 금액 (결재 금액과 다를 수 있음)' AFTER `total_amount`,
ADD COLUMN `amount_difference_reason` VARCHAR(500) NULL COMMENT '금액 차이 사유' AFTER `actual_paid_amount`;

