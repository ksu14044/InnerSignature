-- =====================================================
-- InnerSignature 구독 플랜 초기 데이터
-- 배포서버덤프확인 기준 최신 데이터
-- =====================================================

-- 구독 플랜 초기 데이터 입력
INSERT INTO subscription_plan_tb (plan_code, plan_name, price, max_users, features, is_active) VALUES
('FREE', '무료', 0, 2, '{"audit_log": false, "tax_report": false, "expense_tracking": true, "advanced_analytics": false}', 1),
('PRO', '프로', 9900, NULL, '{"audit_log": true, "tax_report": true, "expense_tracking": true, "priority_support": true, "advanced_analytics": true}', 1)
ON DUPLICATE KEY UPDATE
    plan_name = VALUES(plan_name),
    price = VALUES(price),
    max_users = VALUES(max_users),
    features = VALUES(features),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

-- 초기화 완료 확인
SELECT 'Subscription plans initialized successfully' as status, COUNT(*) as total_plans FROM subscription_plan_tb;
