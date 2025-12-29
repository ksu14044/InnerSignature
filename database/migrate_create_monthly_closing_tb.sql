-- 월 마감 테이블 생성
CREATE TABLE IF NOT EXISTS `monthly_closing_tb` (
  `closing_id` bigint NOT NULL AUTO_INCREMENT COMMENT '마감 ID',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  `closing_year` int NOT NULL COMMENT '마감 년도',
  `closing_month` int NOT NULL COMMENT '마감 월 (1-12)',
  `closed_by` bigint NOT NULL COMMENT '마감 처리한 사용자 ID (user_tb FK)',
  `closed_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '마감 일시',
  `is_closed` tinyint(1) DEFAULT '1' COMMENT '마감 여부 (1: 마감, 0: 해제)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`closing_id`),
  UNIQUE KEY `uk_company_year_month` (`company_id`, `closing_year`, `closing_month`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_closed_by` (`closed_by`),
  KEY `idx_closing_date` (`closing_year`, `closing_month`),
  CONSTRAINT `fk_monthly_closing_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_monthly_closing_user` FOREIGN KEY (`closed_by`) REFERENCES `user_tb` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='월 마감 정보 테이블';

