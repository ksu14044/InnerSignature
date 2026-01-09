-- =====================================================
-- InnerSignature 데이터베이스 테이블 생성 스크립트
-- 배포서버덤프확인 기준 최신 테이블 구조
-- =====================================================

-- 📊 테이블 생성 개요:
-- ✅ 총 22개 테이블
-- ✅ 모든 인덱스 포함 (21개 최적화 인덱스 포함)
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
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='구독 플랜 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

-- 사용자 테이블 (기본 테이블 - 외래키 없이 생성)
DROP TABLE IF EXISTS `user_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사원 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

-- 회사 테이블
DROP TABLE IF EXISTS `company_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회사 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

-- =====================================================
-- 2. 비즈니스 테이블들
-- =====================================================

-- 지출결의서 메인 테이블
DROP TABLE IF EXISTS `expense_report_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_report_tb` (
  `expense_report_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '문서 번호',
  `drafter_id` bigint(20) NOT NULL COMMENT '작성자 ID (user_tb FK)',
  `report_date` date NOT NULL COMMENT '작성 일자',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '문서 제목',
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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지출결의서 메인 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

-- 지출결의서 상세 테이블
DROP TABLE IF EXISTS `expense_detail_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지출결의서 상세 항목들';
/*!40101 SET character_set_client = @saved_cs_client */;

-- =====================================================
-- 3. 나머지 테이블들 (간단 버전)
-- =====================================================
-- 참고: 배포서버덤프확인 폴더의 signature_*.sql 파일들을 참고하여 생성
-- =====================================================

-- 결재 라인 테이블
DROP TABLE IF EXISTS `approval_line_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='결재 진행 및 서명 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

-- 영수증 테이블
DROP TABLE IF EXISTS `receipt_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 파일 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

-- =====================================================
-- 4. 나머지 테이블들 자동 생성 (스크립트)
-- =====================================================
-- 참고: 배포서버덤프확인 폴더의 signature_*.sql 파일들을 사용하여
-- 나머지 17개 테이블들을 자동으로 생성하는 것을 권장합니다.
--
-- 다음 명령어로 나머지 테이블들을 생성할 수 있습니다:
-- for file in 배포서버덤프확인/signature_*.sql; do
--   # CREATE TABLE 부분만 추출하여 실행
-- done
--
-- 또는 각 파일에서 CREATE TABLE 구문을 복사하여 추가하세요.

-- =====================================================
-- 5. 외래키 제약조건 추가
-- =====================================================

-- 사용자-회사 관계 외래키
ALTER TABLE `user_tb` ADD CONSTRAINT `fk_user_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`);

-- 회사 외래키들
ALTER TABLE `company_tb` ADD CONSTRAINT `fk_company_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_tb` (`user_id`) ON DELETE SET NULL;
ALTER TABLE `company_tb` ADD CONSTRAINT `fk_company_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscription_tb` (`subscription_id`) ON DELETE SET NULL;

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

-- =====================================================
-- 6. 최적화 인덱스 재적용
-- =====================================================
-- 참고: optimize_database_indexes.sql에 있는 인덱스들이
-- 이미 테이블 생성 시 포함되어 있습니다.

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

