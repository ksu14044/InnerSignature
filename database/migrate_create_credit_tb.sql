-- 크레딧 내역 테이블 생성
CREATE TABLE IF NOT EXISTS `credit_tb` (
  `credit_id` bigint NOT NULL AUTO_INCREMENT COMMENT '크레딧 ID',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  `amount` int NOT NULL COMMENT '크레딧 금액 (원)',
  `reason` varchar(100) DEFAULT NULL COMMENT '크레딧 발생 사유',
  `used_amount` int DEFAULT 0 COMMENT '사용된 금액 (원)',
  `expires_at` date DEFAULT NULL COMMENT '만료일 (NULL이면 만료 없음)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`credit_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_unused_credits` (`company_id`, `expires_at`, `used_amount`),
  CONSTRAINT `fk_credit_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='크레딧 내역 테이블';

