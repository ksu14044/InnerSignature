-- 개인 카드 정보 테이블 생성
-- 개인 단위로 개인 카드를 저장하고 관리하기 위한 테이블

CREATE TABLE IF NOT EXISTS `user_card_tb` (
  `card_id` bigint NOT NULL AUTO_INCREMENT COMMENT '카드 ID',
  `user_id` bigint NOT NULL COMMENT '사용자 ID (user_tb FK)',
  `card_name` varchar(100) NOT NULL COMMENT '카드 별칭 (예: 개인신용카드, 체크카드)',
  `card_number_encrypted` varchar(500) NOT NULL COMMENT '암호화된 카드번호',
  `card_last_four` varchar(4) NOT NULL COMMENT '마지막 4자리 (표시용)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성화 상태',
  `is_default` tinyint(1) DEFAULT 0 COMMENT '기본 카드 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`card_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_default` (`user_id`, `is_default`),
  CONSTRAINT `fk_user_card_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='개인 카드 정보 테이블';


