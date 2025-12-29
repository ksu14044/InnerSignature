-- expense_detail_tb에 부가세 공제 관련 컬럼 추가
ALTER TABLE `expense_detail_tb` 
ADD COLUMN `is_tax_deductible` tinyint(1) DEFAULT '1' COMMENT '부가세 공제 여부 (1: 공제, 0: 불공제)' AFTER `note`,
ADD COLUMN `non_deductible_reason` varchar(100) DEFAULT NULL COMMENT '불공제 사유 (BUSINESS_UNRELATED, ENTERTAINMENT, SMALL_CAR 등)' AFTER `is_tax_deductible`;

