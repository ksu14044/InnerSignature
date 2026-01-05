-- 사용자별 담당 결재자 매핑 테이블 생성
-- 한 사용자에게 여러 담당 결재자를 설정할 수 있음

CREATE TABLE IF NOT EXISTS `user_approver_mapping_tb` (
  `mapping_id` bigint NOT NULL AUTO_INCREMENT COMMENT '매핑 ID',
  `user_id` bigint NOT NULL COMMENT '사용자 ID (user_tb FK)',
  `approver_id` bigint NOT NULL COMMENT '담당 결재자 ID (user_tb FK)',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  `priority` int DEFAULT 1 COMMENT '우선순위 (낮을수록 우선)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성화 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`mapping_id`),
  UNIQUE KEY `unique_user_approver_company` (`user_id`, `approver_id`, `company_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_approver_id` (`approver_id`),
  KEY `idx_company_id` (`company_id`),
  CONSTRAINT `fk_user_approver_mapping_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_approver_mapping_approver` FOREIGN KEY (`approver_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_approver_mapping_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자별 담당 결재자 매핑';

