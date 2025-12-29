-- 계정 과목 매핑 테이블 생성
CREATE TABLE IF NOT EXISTS `account_code_mapping_tb` (
  `mapping_id` bigint NOT NULL AUTO_INCREMENT COMMENT '매핑 ID',
  `company_id` bigint DEFAULT NULL COMMENT '회사 ID (NULL이면 전역 설정)',
  `category` varchar(50) NOT NULL COMMENT '카테고리',
  `merchant_keyword` varchar(100) DEFAULT NULL COMMENT '가맹점명 키워드 (NULL 가능)',
  `account_code` varchar(20) NOT NULL COMMENT '계정 과목 코드',
  `account_name` varchar(100) NOT NULL COMMENT '계정 과목명',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`mapping_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_category` (`category`),
  KEY `idx_merchant_keyword` (`merchant_keyword`),
  CONSTRAINT `fk_account_code_mapping_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='계정 과목 매핑 테이블';

