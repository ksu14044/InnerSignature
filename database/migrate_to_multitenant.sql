-- 멀티 테넌트 전환 마이그레이션 스크립트
-- 실행 순서:
-- 1. company_tb 테이블 생성 (signature_company_tb.sql 실행)
-- 2. 이 스크립트 실행

SET FOREIGN_KEY_CHECKS=0;
SET UNIQUE_CHECKS=0;

-- 1. 기본 회사 생성 (내부회사)
-- company_code는 6자리 랜덤 영숫자로 생성 (예: ABC123)
-- 실제 구현에서는 백엔드에서 자동 생성하지만, 마이그레이션을 위해 임시 코드 사용
INSERT INTO `company_tb` (`company_code`, `company_name`, `created_by`, `is_active`, `created_at`, `updated_at`)
VALUES ('INTERN', '내부회사', NULL, 1, NOW(), NOW());

SET @default_company_id = LAST_INSERT_ID();

-- 2. 빈 문자열 이메일을 NULL로 변환 (UNIQUE 제약 조건 문제 방지)
UPDATE `user_tb` SET `email` = NULL WHERE `email` = '';

-- 3. 모든 기존 사용자에 기본 company_id 할당
UPDATE `user_tb` SET `company_id` = @default_company_id WHERE `company_id` IS NULL;

-- 4. 모든 expense_report에 company_id 할당 (drafter_id를 통해)
UPDATE `expense_report_tb` er
INNER JOIN `user_tb` u ON er.drafter_id = u.user_id
SET er.company_id = COALESCE(u.company_id, @default_company_id)
WHERE er.company_id IS NULL;

-- 5. 모든 expense_detail에 company_id 할당 (expense_report_id를 통해)
UPDATE `expense_detail_tb` ed
INNER JOIN `expense_report_tb` er ON ed.expense_report_id = er.expense_report_id
SET ed.company_id = er.company_id
WHERE ed.company_id IS NULL;

-- 6. 모든 approval_line에 company_id 할당 (expense_report_id를 통해)
UPDATE `approval_line_tb` al
INNER JOIN `expense_report_tb` er ON al.expense_report_id = er.expense_report_id
SET al.company_id = er.company_id
WHERE al.company_id IS NULL;

-- 7. 모든 receipt에 company_id 할당 (expense_report_id를 통해)
UPDATE `receipt_tb` r
INNER JOIN `expense_report_tb` er ON r.expense_report_id = er.expense_report_id
SET r.company_id = er.company_id
WHERE r.company_id IS NULL;

-- 8. 모든 password_reset_token에 company_id 할당 (user_id를 통해)
UPDATE `password_reset_token_tb` prt
INNER JOIN `user_tb` u ON prt.user_id = u.user_id
SET prt.company_id = u.company_id
WHERE prt.company_id IS NULL;

-- 9. NOT NULL 제약 조건 추가 (user_tb는 NULL 허용 유지)
-- expense_report_tb
ALTER TABLE `expense_report_tb` MODIFY `company_id` bigint NOT NULL;

-- expense_detail_tb
ALTER TABLE `expense_detail_tb` MODIFY `company_id` bigint NOT NULL;

-- approval_line_tb
ALTER TABLE `approval_line_tb` MODIFY `company_id` bigint NOT NULL;

-- receipt_tb
ALTER TABLE `receipt_tb` MODIFY `company_id` bigint NOT NULL;

-- password_reset_token_tb는 NULL 허용 유지

SET FOREIGN_KEY_CHECKS=1;
SET UNIQUE_CHECKS=1;

-- 마이그레이션 완료
SELECT 'Migration completed successfully' AS status;

