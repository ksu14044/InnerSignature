-- =====================================================
-- Migration: Update Billing Model (2025-01-12)
-- 기존: FREE(3인), BASIC(4-30인, 5500원), PRO(30+, 15500원)
-- 변경: FREE(2인), PRO(3인+, 9900원) - BASIC 플랜 제거
-- =====================================================

-- 1. FREE 플랜의 최대 사용자 수를 3에서 2로 변경
UPDATE subscription_plan_tb
SET max_users = 2, updated_at = CURRENT_TIMESTAMP
WHERE plan_code = 'FREE';

-- 2. PRO 플랜의 가격을 15500원에서 9900원으로 변경
UPDATE subscription_plan_tb
SET price = 9900, updated_at = CURRENT_TIMESTAMP
WHERE plan_code = 'PRO';

-- 3. BASIC 플랜을 사용중인 모든 구독을 PRO 플랜으로 변경
-- 먼저 PRO 플랜의 ID를 가져와서 BASIC 구독들을 업데이트
UPDATE subscription_tb
SET plan_id = (
    SELECT plan_id FROM subscription_plan_tb
    WHERE plan_code = 'PRO' AND is_active = 1
    LIMIT 1
), updated_at = CURRENT_TIMESTAMP
WHERE plan_id = (
    SELECT plan_id FROM subscription_plan_tb
    WHERE plan_code = 'BASIC' AND is_active = 1
    LIMIT 1
);

-- 4. BASIC 플랜을 비활성화 (삭제하지 않고 비활성화 처리)
UPDATE subscription_plan_tb
SET is_active = 0, updated_at = CURRENT_TIMESTAMP
WHERE plan_code = 'BASIC';

-- 5. 변경사항 확인을 위한 로그
SELECT 'Migration completed successfully' as status,
       (SELECT COUNT(*) FROM subscription_plan_tb WHERE is_active = 1) as active_plans,
       (SELECT COUNT(*) FROM subscription_tb WHERE plan_id = (SELECT plan_id FROM subscription_plan_tb WHERE plan_code = 'PRO' AND is_active = 1)) as pro_subscriptions;
