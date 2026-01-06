-- expense_report_tb에 is_pre_approval 컬럼 추가 (결의서 단위)
ALTER TABLE `expense_report_tb`
ADD COLUMN `is_pre_approval` tinyint(1) DEFAULT 0 COMMENT '가승인 요청 여부 (결의서 단위)' AFTER `payment_req_date`;


