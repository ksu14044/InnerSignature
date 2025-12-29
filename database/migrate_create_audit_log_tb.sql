-- 감사 로그 테이블 생성
CREATE TABLE IF NOT EXISTS `audit_log_tb` (
  `audit_log_id` bigint NOT NULL AUTO_INCREMENT COMMENT '감사 로그 ID',
  `expense_report_id` bigint NOT NULL COMMENT '지출결의서 ID (expense_report_tb FK)',
  `rule_id` bigint NOT NULL COMMENT '규칙 ID (audit_rule_tb FK)',
  `severity` varchar(20) NOT NULL DEFAULT 'MEDIUM' COMMENT '심각도 (LOW, MEDIUM, HIGH)',
  `message` varchar(500) NOT NULL COMMENT '감사 메시지',
  `detected_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '탐지 일시',
  `is_resolved` tinyint(1) DEFAULT '0' COMMENT '해결 여부 (1: 해결, 0: 미해결)',
  `resolved_at` datetime DEFAULT NULL COMMENT '해결 일시',
  `resolved_by` bigint DEFAULT NULL COMMENT '해결한 사용자 ID (user_tb FK)',
  PRIMARY KEY (`audit_log_id`),
  KEY `idx_expense_report_id` (`expense_report_id`),
  KEY `idx_rule_id` (`rule_id`),
  KEY `idx_severity` (`severity`),
  KEY `idx_is_resolved` (`is_resolved`),
  KEY `idx_detected_at` (`detected_at`),
  CONSTRAINT `fk_audit_log_expense` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_log_rule` FOREIGN KEY (`rule_id`) REFERENCES `audit_rule_tb` (`rule_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_log_user` FOREIGN KEY (`resolved_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='감사 로그 테이블';

