-- 비밀글 기능 제거: is_secret 컬럼 삭제
-- 급여 카테고리가 자동으로 비밀글로 처리되어 중복되므로 제거
-- 급여 카테고리 체크 로직으로 대체

USE signature;

-- expense_report_tb에서 is_secret 컬럼 제거
ALTER TABLE `expense_report_tb`
DROP COLUMN `is_secret`;

