-- 데이터 마이그레이션 스크립트
-- 기존 user_tb.company_id 데이터를 user_company_tb로 마이그레이션

-- 1. user_company_tb 테이블이 생성되어 있어야 함
-- 2. 기존 user_tb.company_id 데이터를 user_company_tb로 복사
-- 3. 모든 레코드에 is_primary = true 설정
-- 4. approval_status는 APPROVED로 설정 (기존 사용자는 이미 승인된 것으로 간주)

INSERT INTO `user_company_tb` (`user_id`, `company_id`, `role`, `position`, `is_active`, `is_primary`, `approval_status`, `created_at`, `updated_at`)
SELECT 
    `user_id`,
    `company_id`,
    `role`,
    `position`,
    COALESCE(`is_active`, 1),
    1 AS `is_primary`,  -- 모든 기존 사용자의 기본 회사로 설정
    COALESCE(`approval_status`, 'APPROVED') AS `approval_status`,
    NOW() AS `created_at`,
    NOW() AS `updated_at`
FROM `user_tb`
WHERE `company_id` IS NOT NULL
ON DUPLICATE KEY UPDATE
    `role` = VALUES(`role`),
    `position` = VALUES(`position`),
    `is_active` = VALUES(`is_active`),
    `updated_at` = NOW();

-- 참고: user_tb.company_id는 하위 호환성을 위해 유지됨
-- 이후에는 user_company_tb가 주 데이터 소스로 사용됨

