-- account_code_mapping_tb에 category_order 컬럼 추가
-- 항목의 표시 순서를 관리하기 위한 필드 (드래그 앤 드롭으로 순서 변경 가능)

ALTER TABLE `account_code_mapping_tb`
ADD COLUMN `category_order` int DEFAULT 0 COMMENT '항목 표시 순서' AFTER `category`;

-- 기존 데이터에 순서 부여 (mapping_id 기준)
UPDATE `account_code_mapping_tb`
SET `category_order` = `mapping_id`
WHERE `category_order` = 0;


