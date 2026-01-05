-- expense_detail_tb에 payment_req_date 컬럼 추가
-- 상세 항목별 지급 요청일을 저장하기 위한 필드

ALTER TABLE `expense_detail_tb`
ADD COLUMN `payment_req_date` date DEFAULT NULL COMMENT '지급 요청일 (상세 항목별)' AFTER `merchant_name`;

