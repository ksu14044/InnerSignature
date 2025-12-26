-- 결재자 지정 기능 추가를 위한 마이그레이션 스크립트
-- user_company_tb 테이블에 is_approver 컬럼 추가

-- 1. 컬럼 추가
ALTER TABLE `user_company_tb` 
ADD COLUMN `is_approver` tinyint(1) DEFAULT 0 COMMENT '결재자 지정 여부' 
AFTER `is_primary`;

-- 2. 기존 데이터 마이그레이션 (선택사항)
-- 기존 ADMIN, CEO, ACCOUNTANT를 초기 결재자로 설정
UPDATE `user_company_tb` 
SET `is_approver` = 1 
WHERE `role` IN ('ADMIN', 'CEO', 'ACCOUNTANT') 
  AND `approval_status` = 'APPROVED'
  AND (`is_active` IS NULL OR `is_active` = 1);

