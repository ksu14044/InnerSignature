-- 감사 규칙 테이블 생성
CREATE TABLE IF NOT EXISTS `audit_rule_tb` (
  `rule_id` bigint NOT NULL AUTO_INCREMENT COMMENT '규칙 ID',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  `rule_name` varchar(100) NOT NULL COMMENT '규칙명',
  `rule_type` varchar(50) NOT NULL COMMENT '규칙 유형 (NIGHT_TIME, WEEKEND, DUPLICATE_MERCHANT, FORBIDDEN_CATEGORY)',
  `rule_config` json DEFAULT NULL COMMENT '규칙 설정 (JSON 형식)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`rule_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_rule_type` (`rule_type`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_audit_rule_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='감사 규칙 테이블';

