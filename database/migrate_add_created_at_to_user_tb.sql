-- user_tb에 created_at, updated_at 컬럼 추가
-- 기존 데이터는 user_company_tb의 최초 created_at을 사용하거나, 현재 시점으로 설정

-- 1단계: 컬럼 추가 (NULL 허용으로 먼저 추가)
ALTER TABLE `user_tb`
  ADD COLUMN `created_at` datetime NULL COMMENT '생성 시간' AFTER `company_id`,
  ADD COLUMN `updated_at` datetime NULL COMMENT '수정 시간' AFTER `created_at`;

-- 2단계: 기존 데이터의 created_at 설정
-- user_company_tb에서 해당 user_id의 최초 created_at을 가져와서 설정
UPDATE `user_tb` u
LEFT JOIN (
    SELECT user_id, MIN(created_at) AS first_created_at
    FROM user_company_tb
    GROUP BY user_id
) uc ON u.user_id = uc.user_id
SET 
    u.created_at = COALESCE(uc.first_created_at, NOW()),
    u.updated_at = NOW()
WHERE u.created_at IS NULL;

-- 3단계: NOT NULL 및 DEFAULT 설정
ALTER TABLE `user_tb`
  MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  MODIFY COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간';

