-- expense_detail_tb에 is_pre_approval 컬럼 추가
-- 가승인 요청 여부를 저장하기 위한 필드

ALTER TABLE `expense_detail_tb`
ADD COLUMN `is_pre_approval` tinyint(1) DEFAULT 0 COMMENT '가승인 요청 여부' AFTER `card_number`;


