-- 사용자 서명/도장 저장 테이블 생성
-- 사용자가 여러 개의 서명/도장을 저장하고 관리할 수 있도록 함

CREATE TABLE `user_signature_tb` (
  `signature_id` bigint NOT NULL AUTO_INCREMENT COMMENT '서명/도장 ID',
  `user_id` bigint NOT NULL COMMENT '사용자 ID (user_tb FK)',
  `signature_name` varchar(100) NOT NULL COMMENT '서명/도장 이름 (예: "기본 서명", "도장 1")',
  `signature_type` varchar(20) NOT NULL DEFAULT 'SIGNATURE' COMMENT '타입 (SIGNATURE: 서명, STAMP: 도장)',
  `signature_data` mediumtext NOT NULL COMMENT '서명/도장 데이터 (Base64)',
  `is_default` tinyint(1) DEFAULT 0 COMMENT '기본 서명/도장 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  PRIMARY KEY (`signature_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_company_id` (`company_id`),
  CONSTRAINT `fk_user_signature_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_signature_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 서명/도장 저장 테이블';

