-- 회사 카드 정보 테이블 생성
-- 회사 단위로 회사 카드를 저장하고 관리하기 위한 테이블

CREATE TABLE IF NOT EXISTS `company_card_tb` (
  `card_id` bigint NOT NULL AUTO_INCREMENT COMMENT '카드 ID',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  `card_name` varchar(100) NOT NULL COMMENT '카드 별칭 (예: 회사법인카드1, 대표카드)',
  `card_number_encrypted` varchar(500) NOT NULL COMMENT '암호화된 카드번호',
  `card_last_four` varchar(4) NOT NULL COMMENT '마지막 4자리 (표시용)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성화 상태',
  `created_by` bigint NOT NULL COMMENT '생성한 사용자 ID (user_tb FK)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`card_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_company_card_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_company_card_user` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회사 카드 정보 테이블';


