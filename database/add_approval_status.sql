-- 승인 상태 필드 추가
ALTER TABLE `user_tb` 
ADD COLUMN `approval_status` VARCHAR(20) DEFAULT 'APPROVED' 
COMMENT '승인 상태 (PENDING, APPROVED, REJECTED)' 
AFTER `is_active`;

-- 기존 사용자는 모두 APPROVED로 설정
UPDATE `user_tb` SET `approval_status` = 'APPROVED' WHERE `approval_status` IS NULL;

