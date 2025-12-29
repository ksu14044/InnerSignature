-- 예산 관리 테이블 생성
CREATE TABLE IF NOT EXISTS `budget_tb` (
  `budget_id` bigint NOT NULL AUTO_INCREMENT COMMENT '예산 ID',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  `budget_year` int NOT NULL COMMENT '예산 년도',
  `budget_month` int DEFAULT NULL COMMENT '예산 월 (1-12, NULL이면 연간 예산)',
  `category` varchar(50) NOT NULL COMMENT '카테고리 (식대, 교통비, 비품비 등)',
  `budget_amount` bigint NOT NULL DEFAULT '0' COMMENT '예산 금액',
  `alert_threshold` decimal(5,2) DEFAULT '80.00' COMMENT '경고 임계값 (퍼센트, 예: 80.00 = 80%)',
  `is_blocking` tinyint(1) DEFAULT '0' COMMENT '초과 시 차단 여부 (1: 차단, 0: 경고만)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`budget_id`),
  UNIQUE KEY `uk_company_year_month_category` (`company_id`, `budget_year`, `budget_month`, `category`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_budget_date` (`budget_year`, `budget_month`),
  KEY `idx_category` (`category`),
  CONSTRAINT `fk_budget_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='예산 관리 테이블';

