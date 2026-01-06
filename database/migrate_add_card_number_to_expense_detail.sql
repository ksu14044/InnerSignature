-- expense_detail_tb에 card_number 컬럼 추가
-- 카드 결제 시 카드번호를 암호화하여 저장하기 위한 필드

ALTER TABLE `expense_detail_tb`
ADD COLUMN `card_number` varchar(500) DEFAULT NULL COMMENT '카드번호 (암호화 저장)' AFTER `payment_method`;


