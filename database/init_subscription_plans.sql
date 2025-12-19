-- 초기 구독 플랜 데이터 입력

INSERT INTO `subscription_plan_tb` (`plan_code`, `plan_name`, `price`, `max_users`, `features`, `is_active`) VALUES
('FREE', '무료', 0, 3, '{"expense_tracking": true, "tax_report": false, "audit_log": false, "advanced_analytics": false}', 1),
('BASIC', '베이직', 5500, 30, '{"expense_tracking": true, "tax_report": true, "audit_log": true, "advanced_analytics": false}', 1),
('PRO', '프로', 15500, NULL, '{"expense_tracking": true, "tax_report": true, "audit_log": true, "advanced_analytics": true, "priority_support": true}', 1);

