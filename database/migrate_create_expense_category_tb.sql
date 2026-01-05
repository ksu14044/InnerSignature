-- 지출 항목(category) 관리 테이블 생성
-- 전역 기본값 상속 + 회사별 오버라이드 구조

CREATE TABLE IF NOT EXISTS `expense_category_tb` (
  `category_id` bigint NOT NULL AUTO_INCREMENT COMMENT '항목 ID',
  `company_id` bigint DEFAULT NULL COMMENT '회사 ID (NULL이면 전역 기본값)',
  `category_name` varchar(50) NOT NULL COMMENT '항목명',
  `display_order` int DEFAULT 0 COMMENT '표시 순서',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성화 여부',
  `created_by` bigint DEFAULT NULL COMMENT '생성자 ID (user_tb FK)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `unique_company_category` (`company_id`, `category_name`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_expense_category_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expense_category_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지출 항목 관리';

