-- =====================================================
-- InnerSignature 데이터베이스 테이블 생성 스크립트
-- 배포서버덤프확인 기준 최신 테이블 구조 (2026-01-09)
-- =====================================================

-- 📊 테이블 생성 개요:
-- ✅ 총 22개 테이블
-- ✅ 모든 인덱스 포함 (최적화 인덱스 포함)
-- ✅ FK 제약조건 포함
-- ✅ MySQL 5.7 호환

-- ⚠️ 실행 전 확인사항:
-- 1. 데이터베이스 백업 필수
-- 2. 기존 테이블 DROP 후 생성
-- 3. 외래키 제약조건으로 인한 생성 순서 중요

-- =====================================================
-- 1. 기본 마스터 테이블들 (외래키 제약조건 없이 생성)
-- =====================================================

-- 구독 플랜 테이블
DROP TABLE IF EXISTS `subscription_plan_tb`;
CREATE TABLE `subscription_plan_tb` (
  `plan_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '플랜 ID',
  `plan_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '플랜 코드 (FREE, BASIC, PRO)',
  `plan_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '플랜 이름',
  `price` int(11) NOT NULL DEFAULT '0' COMMENT '월간 가격 (원)',
  `max_users` int(11) DEFAULT NULL COMMENT '최대 사용자 수 (NULL이면 무제한)',
  `features` json DEFAULT NULL COMMENT '기능 목록 (JSON)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`plan_id`),
  UNIQUE KEY `idx_plan_code` (`plan_code`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='구독 플랜 정보 테이블';

-- 사용자 테이블 (기본 테이블 - 외래키 없이 생성)
DROP TABLE IF EXISTS `user_tb`;
CREATE TABLE `user_tb` (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '사원 고유 ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '로그인 아이디',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '비밀번호 (암호화 필수)',
  `korean_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '이름',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '이메일 주소',
  `position` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '직급 (사원, 대리, 전무, 대표)',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '권한 (USER, ADMIN, ACCOUNTANT)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 상태',
  `approval_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'APPROVED' COMMENT '승인 상태 (PENDING, APPROVED, REJECTED)',
  `company_id` bigint(20) DEFAULT NULL COMMENT '회사 ID (company_tb FK)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_user_korean_name` (`korean_name`),
  KEY `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사원 정보 테이블';

-- 회사 테이블
DROP TABLE IF EXISTS `company_tb`;
CREATE TABLE `company_tb` (
  `company_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '회사 고유 ID',
  `company_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '회사 코드 (6자리 영숫자, 자동 생성)',
  `company_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '회사명',
  `business_reg_no` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '사업자등록번호',
  `representative_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '대표자 이름',
  `created_by` bigint(20) DEFAULT NULL COMMENT '회사를 등록한 ADMIN의 user_id',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 상태',
  `subscription_id` bigint(20) DEFAULT NULL COMMENT '현재 활성 구독 ID (subscription_tb FK)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`company_id`),
  UNIQUE KEY `idx_company_code` (`company_code`),
  UNIQUE KEY `uk_business_reg_no` (`business_reg_no`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_subscription_id` (`subscription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회사 정보 테이블';

-- =====================================================
-- 2. 비즈니스 테이블들
-- =====================================================

-- 지출결의서 메인 테이블
DROP TABLE IF EXISTS `expense_report_tb`;
CREATE TABLE `expense_report_tb` (
  `expense_report_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '문서 번호',
  `drafter_id` bigint(20) NOT NULL COMMENT '작성자 ID (user_tb FK)',
  `report_date` date NOT NULL COMMENT '작성 일자',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '문서 제목',
  `total_amount` decimal(15,0) DEFAULT '0' COMMENT '총 합계 금액',
  `actual_paid_amount` decimal(15,0) DEFAULT NULL COMMENT '실제 지급 금액 (결재 금액과 다를 수 있음)',
  `amount_difference_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '금액 차이 사유',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT' COMMENT '상태 (DRAFT, PENDING, APPROVED, REJECTED, PAID)',
  `payment_req_date` date DEFAULT NULL COMMENT '지급 요청일',
  `is_pre_approval` tinyint(1) DEFAULT '0' COMMENT '가승인 요청 여부 (결의서 단위)',
  `receipt_file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_processed` tinyint(4) DEFAULT '0',
  `tax_processed_at` datetime DEFAULT NULL,
  `tax_collected_at` datetime DEFAULT NULL COMMENT '세무사가 자료를 수집한 일시',
  `tax_collected_by` bigint(20) DEFAULT NULL COMMENT '세무사가 자료를 수집한 사용자 ID',
  `tax_revision_requested` tinyint(1) DEFAULT '0' COMMENT '세무사가 수정 요청을 보냈는지 여부',
  `tax_revision_request_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '수정 요청 사유',
  `is_secret` tinyint(1) DEFAULT '0' COMMENT '비밀글 여부 (0: 일반, 1: 비밀글)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `company_id` bigint(20) NOT NULL,
  PRIMARY KEY (`expense_report_id`),
  KEY `drafter_id` (`drafter_id`),
  KEY `idx_expense_report_company_status_date` (`company_id`,`status`,`report_date`),
  KEY `idx_expense_report_id_company` (`expense_report_id`,`company_id`),
  KEY `idx_expense_report_drafter_date` (`drafter_id`,`report_date`),
  KEY `idx_expense_report_status_date` (`status`,`report_date`),
  KEY `idx_expense_report_date_range` (`report_date`,`company_id`,`status`),
  KEY `idx_expense_report_stats` (`company_id`,`status`,`report_date`,`drafter_id`),
  KEY `idx_expense_report_pending` (`company_id`,`status`,`report_date`),
  KEY `idx_expense_report_approved` (`company_id`,`status`,`report_date`),
  KEY `idx_expense_report_tax_pending` (`company_id`,`status`,`report_date`),
  KEY `idx_expense_report_monthly_tax` (`company_id`,`report_date`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지출결의서 메인 정보';

-- 지출결의서 상세 테이블
DROP TABLE IF EXISTS `expense_detail_tb`;
CREATE TABLE `expense_detail_tb` (
  `expense_detail_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '상세 내역 ID',
  `expense_report_id` bigint(20) NOT NULL COMMENT '어떤 문서의 항목인지 (expense_report_tb FK)',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '지출 항목',
  `merchant_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '상호명/업체명',
  `payment_req_date` date DEFAULT NULL COMMENT '지급 요청일 (상세 항목별)',
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '적요',
  `amount` decimal(15,0) NOT NULL COMMENT '개별 금액',
  `actual_paid_amount` decimal(15,0) DEFAULT NULL COMMENT '실제 지급 금액 (결재 금액과 다를 수 있음)',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '결제수단 (CASH, BANK_TRANSFER, CARD, CHECK 등)',
  `card_number` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '카드번호 (암호화 저장)',
  `is_pre_approval` tinyint(1) DEFAULT '0' COMMENT '가승인 요청 여부',
  `note` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '비고',
  `is_tax_deductible` tinyint(1) DEFAULT '1' COMMENT '부가세 공제 여부 (1: 공제, 0: 불공제)',
  `non_deductible_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '불공제 사유 (BUSINESS_UNRELATED, ENTERTAINMENT, SMALL_CAR 등)',
  `company_id` bigint(20) NOT NULL,
  PRIMARY KEY (`expense_detail_id`),
  KEY `expense_report_id` (`expense_report_id`),
  KEY `idx_expense_detail_payment_method` (`payment_method`,`amount`),
  KEY `idx_expense_detail_category_amount` (`category`,`amount`),
  KEY `idx_expense_detail_deduction` (`expense_report_id`,`is_tax_deductible`,`amount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지출결의서 상세 항목들';

-- 결재 라인 테이블
DROP TABLE IF EXISTS `approval_line_tb`;
CREATE TABLE `approval_line_tb` (
  `approval_line_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '결재 라인 ID',
  `expense_report_id` bigint(20) NOT NULL COMMENT '어떤 문서인지 (expense_report_tb FK)',
  `approver_id` bigint(20) NOT NULL COMMENT '누가 결재하는지 (user_tb FK)',
  `step_order` int(11) NOT NULL COMMENT '결재 순서 (1, 2, 3)',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'WAIT' COMMENT '결재 상태',
  `approval_date` datetime DEFAULT NULL COMMENT '결재한 시간',
  `signature_data` mediumtext COLLATE utf8mb4_unicode_ci COMMENT '서명 데이터 (Base64)',
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '반려 사유',
  `company_id` bigint(20) NOT NULL,
  PRIMARY KEY (`approval_line_id`),
  KEY `expense_report_id` (`expense_report_id`),
  KEY `approver_id` (`approver_id`),
  KEY `idx_approval_line_status_date` (`status`,`approval_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='결재 진행 및 서명 정보';

-- 영수증 테이블
DROP TABLE IF EXISTS `receipt_tb`;
CREATE TABLE `receipt_tb` (
  `receipt_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '영수증 ID',
  `expense_report_id` bigint(20) NOT NULL COMMENT '지출결의서 ID (expense_report_tb FK)',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '파일 경로',
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '원본 파일명',
  `file_size` bigint(20) DEFAULT NULL COMMENT '파일 크기 (bytes)',
  `uploaded_by` bigint(20) NOT NULL COMMENT '업로드한 사용자 ID (user_tb FK)',
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 시간',
  `company_id` bigint(20) NOT NULL,
  PRIMARY KEY (`receipt_id`),
  KEY `expense_report_id` (`expense_report_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_receipt_uploaded_at` (`uploaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 파일 정보';

-- =====================================================
-- 3. 추가 비즈니스 테이블들
-- =====================================================

-- 구독 테이블
DROP TABLE IF EXISTS `subscription_tb`;
CREATE TABLE `subscription_tb` (
  `subscription_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '구독 ID',
  `company_id` bigint(20) NOT NULL COMMENT '회사 ID',
  `plan_id` bigint(20) NOT NULL COMMENT '플랜 ID',
  `start_date` date NOT NULL COMMENT '시작일',
  `end_date` date DEFAULT NULL COMMENT '종료일 (NULL이면 무기한)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성 상태',
  `auto_renewal` tinyint(1) DEFAULT '1' COMMENT '자동 갱신 여부',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '결제 수단',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`subscription_id`),
  KEY `company_id` (`company_id`),
  KEY `plan_id` (`plan_id`),
  KEY `idx_subscription_active` (`is_active`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회사 구독 정보';

-- 계정 과목 매핑 테이블
DROP TABLE IF EXISTS `account_code_mapping_tb`;
CREATE TABLE `account_code_mapping_tb` (
  `mapping_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '매핑 ID',
  `company_id` bigint(20) DEFAULT NULL COMMENT '회사 ID (NULL이면 전역 설정)',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '카테고리',
  `category_order` int(11) DEFAULT '0' COMMENT '항목 표시 순서',
  `merchant_keyword` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '가맹점명 키워드 (NULL 가능)',
  `account_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계정 과목 코드',
  `account_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계정 과목명',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`mapping_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_category` (`category`),
  KEY `idx_merchant_keyword` (`merchant_keyword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='계정 과목 매핑 테이블';

-- 지출 항목 관리 테이블
DROP TABLE IF EXISTS `expense_category_tb`;
CREATE TABLE `expense_category_tb` (
  `category_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '항목 ID',
  `company_id` bigint(20) DEFAULT NULL COMMENT '회사 ID (NULL이면 전역 기본값)',
  `category_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '항목명',
  `display_order` int(11) DEFAULT '0' COMMENT '표시 순서',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 여부',
  `created_by` bigint(20) DEFAULT NULL COMMENT '생성자 ID (user_tb FK)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `unique_company_category` (`company_id`,`category_name`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`),
  KEY `fk_expense_category_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지출 항목 관리';

-- 감사 로그 테이블
DROP TABLE IF EXISTS `audit_log_tb`;
CREATE TABLE `audit_log_tb` (
  `audit_log_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '감사 로그 ID',
  `expense_report_id` bigint(20) NOT NULL COMMENT '지출결의서 ID (expense_report_tb FK)',
  `rule_id` bigint(20) NOT NULL COMMENT '규칙 ID (audit_rule_tb FK)',
  `severity` varchar(20) NOT NULL DEFAULT 'MEDIUM' COMMENT '심각도 (LOW, MEDIUM, HIGH)',
  `message` varchar(500) NOT NULL COMMENT '감사 메시지',
  `detected_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '탐지 일시',
  `is_resolved` tinyint(1) DEFAULT '0' COMMENT '해결 여부 (1: 해결, 0: 미해결)',
  `resolved_at` datetime DEFAULT NULL COMMENT '해결 일시',
  `resolved_by` bigint(20) DEFAULT NULL COMMENT '해결한 사용자 ID (user_tb FK)',
  PRIMARY KEY (`audit_log_id`),
  KEY `idx_expense_report_id` (`expense_report_id`),
  KEY `idx_rule_id` (`rule_id`),
  KEY `idx_severity` (`severity`),
  KEY `idx_is_resolved` (`is_resolved`),
  KEY `idx_detected_at` (`detected_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='감사 로그 테이블';

-- 감사 규칙 테이블
DROP TABLE IF EXISTS `audit_rule_tb`;
CREATE TABLE `audit_rule_tb` (
  `rule_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '규칙 ID',
  `rule_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '규칙명',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '규칙 설명',
  `severity` varchar(20) NOT NULL DEFAULT 'MEDIUM' COMMENT '심각도 (LOW, MEDIUM, HIGH)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`rule_id`),
  KEY `idx_rule_name` (`rule_name`),
  KEY `idx_severity` (`severity`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='감사 규칙 테이블';

-- 예산 테이블
DROP TABLE IF EXISTS `budget_tb`;
CREATE TABLE `budget_tb` (
  `budget_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '예산 ID',
  `company_id` bigint(20) NOT NULL COMMENT '회사 ID',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '카테고리',
  `year_month` varchar(7) NOT NULL COMMENT '년월 (YYYY-MM)',
  `budget_amount` decimal(15,0) NOT NULL COMMENT '예산 금액',
  `used_amount` decimal(15,0) DEFAULT '0' COMMENT '사용 금액',
  `created_by` bigint(20) DEFAULT NULL COMMENT '생성자 ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`budget_id`),
  KEY `idx_company_category_month` (`company_id`,`category`,`year_month`),
  KEY `idx_company_month` (`company_id`,`year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='예산 관리 테이블';

-- 월간 마감 테이블
DROP TABLE IF EXISTS `monthly_closing_tb`;
CREATE TABLE `monthly_closing_tb` (
  `closing_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '마감 ID',
  `company_id` bigint(20) NOT NULL COMMENT '회사 ID',
  `year_month` varchar(7) NOT NULL COMMENT '년월 (YYYY-MM)',
  `is_closed` tinyint(1) DEFAULT '0' COMMENT '마감 여부',
  `closed_by` bigint(20) DEFAULT NULL COMMENT '마감한 사용자 ID',
  `closed_at` datetime DEFAULT NULL COMMENT '마감 일시',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`closing_id`),
  UNIQUE KEY `uk_company_year_month` (`company_id`,`year_month`),
  KEY `idx_company_closed` (`company_id`,`is_closed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='월간 마감 관리 테이블';

-- 회사 법인카드 테이블
DROP TABLE IF EXISTS `company_card_tb`;
CREATE TABLE `company_card_tb` (
  `card_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '카드 ID',
  `company_id` bigint(20) NOT NULL COMMENT '회사 ID',
  `card_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '카드 별명',
  `card_number_masked` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '마스킹된 카드번호',
  `card_number_encrypted` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '암호화된 실제 카드번호',
  `expiry_date` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '유효기간 (MM/YY)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 여부',
  `created_by` bigint(20) DEFAULT NULL COMMENT '등록자 ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`card_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회사 법인카드 정보';

-- 사용자 개인카드 테이블
DROP TABLE IF EXISTS `user_card_tb`;
CREATE TABLE `user_card_tb` (
  `card_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '카드 ID',
  `user_id` bigint(20) NOT NULL COMMENT '사용자 ID',
  `card_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '카드 별명',
  `card_number_masked` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '마스킹된 카드번호',
  `card_number_encrypted` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '암호화된 실제 카드번호',
  `expiry_date` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '유효기간 (MM/YY)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`card_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 개인카드 정보';

-- 사용자-승인자 매핑 테이블
DROP TABLE IF EXISTS `user_approver_mapping_tb`;
CREATE TABLE `user_approver_mapping_tb` (
  `mapping_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '매핑 ID',
  `company_id` bigint(20) NOT NULL COMMENT '회사 ID',
  `user_id` bigint(20) NOT NULL COMMENT '사용자 ID',
  `approver_id` bigint(20) NOT NULL COMMENT '승인자 ID',
  `priority_order` int(11) DEFAULT '1' COMMENT '승인 우선순위',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 여부',
  `created_by` bigint(20) DEFAULT NULL COMMENT '생성자 ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`mapping_id`),
  KEY `idx_company_user` (`company_id`,`user_id`),
  KEY `idx_approver` (`approver_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자-승인자 매핑';

-- 사용자 서명 테이블
DROP TABLE IF EXISTS `user_signature_tb`;
CREATE TABLE `user_signature_tb` (
  `signature_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '서명 ID',
  `user_id` bigint(20) NOT NULL COMMENT '사용자 ID',
  `signature_data` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '서명 데이터 (Base64)',
  `signature_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'DIGITAL' COMMENT '서명 유형 (DIGITAL, IMAGE)',
  `is_default` tinyint(1) DEFAULT '1' COMMENT '기본 서명 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`signature_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 서명 정보';

-- 비밀번호 재설정 토큰 테이블
DROP TABLE IF EXISTS `password_reset_token_tb`;
CREATE TABLE `password_reset_token_tb` (
  `token_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '토큰 ID',
  `user_id` bigint(20) NOT NULL COMMENT '사용자 ID',
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '재설정 토큰',
  `expires_at` datetime NOT NULL COMMENT '만료 시간',
  `is_used` tinyint(1) DEFAULT '0' COMMENT '사용 여부',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `uk_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='비밀번호 재설정 토큰';

-- 결제 테이블
DROP TABLE IF EXISTS `payment_tb`;
CREATE TABLE `payment_tb` (
  `payment_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '결제 ID',
  `subscription_id` bigint(20) NOT NULL COMMENT '구독 ID',
  `amount` decimal(10,0) NOT NULL COMMENT '결제 금액',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KRW' COMMENT '통화',
  `payment_date` datetime NOT NULL COMMENT '결제 일시',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '결제 수단',
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '거래 ID',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'COMPLETED' COMMENT '결제 상태',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`payment_id`),
  KEY `idx_subscription_id` (`subscription_id`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='구독 결제 내역';

-- 크레딧 테이블
DROP TABLE IF EXISTS `credit_tb`;
CREATE TABLE `credit_tb` (
  `credit_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '크레딧 ID',
  `company_id` bigint(20) NOT NULL COMMENT '회사 ID',
  `amount` decimal(10,0) NOT NULL COMMENT '크레딧 금액',
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '설명',
  `transaction_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '거래 유형 (EARNED, USED, EXPIRED)',
  `reference_id` bigint(20) DEFAULT NULL COMMENT '참조 ID (결제ID 등)',
  `expires_at` datetime DEFAULT NULL COMMENT '만료 일시',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  PRIMARY KEY (`credit_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='크레딧 관리 테이블';

-- =====================================================
-- 4. 외래키 제약조건 추가
-- =====================================================

-- 사용자-회사 관계 외래키
ALTER TABLE `user_tb` ADD CONSTRAINT `fk_user_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`);

-- 회사 외래키들
ALTER TABLE `company_tb` ADD CONSTRAINT `fk_company_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;
ALTER TABLE `company_tb` ADD CONSTRAINT `fk_company_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscription_tb` (`subscription_id`) ON DELETE SET NULL;

-- 구독 외래키
ALTER TABLE `subscription_tb` ADD CONSTRAINT `fk_subscription_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;
ALTER TABLE `subscription_tb` ADD CONSTRAINT `fk_subscription_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plan_tb` (`plan_id`);

-- 지출결의서 외래키
ALTER TABLE `expense_report_tb` ADD CONSTRAINT `fk_expense_report_drafter` FOREIGN KEY (`drafter_id`) REFERENCES `user_tb` (`user_id`);

-- 지출상세 외래키
ALTER TABLE `expense_detail_tb` ADD CONSTRAINT `fk_expense_detail_report` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE;

-- 결재라인 외래키들
ALTER TABLE `approval_line_tb` ADD CONSTRAINT `fk_approval_line_report` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE;
ALTER TABLE `approval_line_tb` ADD CONSTRAINT `fk_approval_line_approver` FOREIGN KEY (`approver_id`) REFERENCES `user_tb` (`user_id`);

-- 영수증 외래키들
ALTER TABLE `receipt_tb` ADD CONSTRAINT `fk_receipt_report` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE;
ALTER TABLE `receipt_tb` ADD CONSTRAINT `fk_receipt_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `user_tb` (`user_id`);

-- 계정과목매핑 외래키
ALTER TABLE `account_code_mapping_tb` ADD CONSTRAINT `fk_account_code_mapping_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;

-- 지출항목 외래키들
ALTER TABLE `expense_category_tb` ADD CONSTRAINT `fk_expense_category_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;
ALTER TABLE `expense_category_tb` ADD CONSTRAINT `fk_expense_category_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;

-- 감사로그 외래키들
ALTER TABLE `audit_log_tb` ADD CONSTRAINT `fk_audit_log_expense` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE;
ALTER TABLE `audit_log_tb` ADD CONSTRAINT `fk_audit_log_rule` FOREIGN KEY (`rule_id`) REFERENCES `audit_rule_tb` (`rule_id`) ON DELETE CASCADE;
ALTER TABLE `audit_log_tb` ADD CONSTRAINT `fk_audit_log_user` FOREIGN KEY (`resolved_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;

-- 예산 외래키
ALTER TABLE `budget_tb` ADD CONSTRAINT `fk_budget_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;
ALTER TABLE `budget_tb` ADD CONSTRAINT `fk_budget_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;

-- 월간마감 외래키들
ALTER TABLE `monthly_closing_tb` ADD CONSTRAINT `fk_monthly_closing_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;
ALTER TABLE `monthly_closing_tb` ADD CONSTRAINT `fk_monthly_closing_closed_by` FOREIGN KEY (`closed_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;

-- 회사카드 외래키들
ALTER TABLE `company_card_tb` ADD CONSTRAINT `fk_company_card_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;
ALTER TABLE `company_card_tb` ADD CONSTRAINT `fk_company_card_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;

-- 사용자카드 외래키
ALTER TABLE `user_card_tb` ADD CONSTRAINT `fk_user_card_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE;

-- 사용자-승인자매핑 외래키들
ALTER TABLE `user_approver_mapping_tb` ADD CONSTRAINT `fk_user_approver_mapping_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;
ALTER TABLE `user_approver_mapping_tb` ADD CONSTRAINT `fk_user_approver_mapping_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE;
ALTER TABLE `user_approver_mapping_tb` ADD CONSTRAINT `fk_user_approver_mapping_approver` FOREIGN KEY (`approver_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE;
ALTER TABLE `user_approver_mapping_tb` ADD CONSTRAINT `fk_user_approver_mapping_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;

-- 사용자서명 외래키
ALTER TABLE `user_signature_tb` ADD CONSTRAINT `fk_user_signature_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE;

-- 비밀번호토큰 외래키
ALTER TABLE `password_reset_token_tb` ADD CONSTRAINT `fk_password_reset_token_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE;

-- 결제 외래키
ALTER TABLE `payment_tb` ADD CONSTRAINT `fk_payment_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscription_tb` (`subscription_id`) ON DELETE CASCADE;

-- 크레딧 외래키
ALTER TABLE `credit_tb` ADD CONSTRAINT `fk_credit_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE;

COMMIT;

-- =====================================================
-- 실행 완료 확인
-- =====================================================
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
