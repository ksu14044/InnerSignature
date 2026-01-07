-- 세무 수집 및 수정 요청 필드 추가
-- 세무사가 기간별로 자료를 수집하고, 수정 요청을 보낼 수 있도록 하는 필드

ALTER TABLE `expense_report_tb`
ADD COLUMN `tax_collected_at` DATETIME NULL COMMENT '세무사가 자료를 수집한 일시' AFTER `tax_processed_at`,
ADD COLUMN `tax_collected_by` BIGINT NULL COMMENT '세무사가 자료를 수집한 사용자 ID' AFTER `tax_collected_at`,
ADD COLUMN `tax_revision_requested` TINYINT(1) DEFAULT 0 COMMENT '세무사가 수정 요청을 보냈는지 여부' AFTER `tax_collected_by`,
ADD COLUMN `tax_revision_request_reason` VARCHAR(500) NULL COMMENT '수정 요청 사유' AFTER `tax_revision_requested`;


