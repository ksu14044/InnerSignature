-- 구독 플랜 변경 기능 추가를 위한 마이그레이션 스크립트
-- subscription_tb 테이블에 pending_plan_id, pending_change_date, credit_amount 컬럼 추가

-- 1. 컬럼 추가
ALTER TABLE `subscription_tb` 
ADD COLUMN `pending_plan_id` bigint DEFAULT NULL COMMENT '대기 중인 플랜 ID (다운그레이드용)' AFTER `plan_id`,
ADD COLUMN `pending_change_date` date DEFAULT NULL COMMENT '플랜 변경 예정일' AFTER `pending_plan_id`,
ADD COLUMN `credit_amount` int DEFAULT 0 COMMENT '크레딧 금액 (원)' AFTER `pending_change_date`;

-- 2. 외래키 추가 (pending_plan_id)
ALTER TABLE `subscription_tb`
ADD CONSTRAINT `fk_subscription_pending_plan` 
FOREIGN KEY (`pending_plan_id`) REFERENCES `subscription_plan_tb` (`plan_id`) 
ON DELETE SET NULL;

-- 3. 인덱스 추가
ALTER TABLE `subscription_tb`
ADD INDEX `idx_pending_change_date` (`pending_change_date`);

