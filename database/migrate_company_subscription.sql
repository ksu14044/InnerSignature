-- 회사 테이블에 subscription_id 필드 추가
ALTER TABLE `company_tb` 
ADD COLUMN `subscription_id` bigint DEFAULT NULL COMMENT '현재 활성 구독 ID (subscription_tb FK)' AFTER `is_active`,
ADD KEY `idx_subscription_id` (`subscription_id`),
ADD CONSTRAINT `fk_company_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscription_tb` (`subscription_id`) ON DELETE SET NULL;

