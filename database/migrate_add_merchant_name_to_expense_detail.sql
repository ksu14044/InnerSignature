-- expense_detail_tb에 merchant_name 컬럼 추가
-- 상호명/업체명을 저장하기 위한 필드

ALTER TABLE `expense_detail_tb`
ADD COLUMN `merchant_name` varchar(200) DEFAULT NULL COMMENT '상호명/업체명' AFTER `category`;


