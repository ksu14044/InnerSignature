-- username을 전역 유니크로 변경하는 마이그레이션
-- 기존 회사별 유니크 제약조건 제거 후 전역 유니크 제약조건 추가

-- 1. 기존 회사별 유니크 제약조건 제거
ALTER TABLE `user_tb` DROP INDEX `idx_company_username`;

-- 2. 전역 유니크 제약조건 추가
ALTER TABLE `user_tb` ADD UNIQUE KEY `idx_username` (`username`);

-- 주의: 기존 데이터에 중복된 username이 있으면 마이그레이션이 실패합니다.
-- 중복 데이터가 있는 경우 먼저 정리해야 합니다.
-- 중복 확인 쿼리:
-- SELECT username, COUNT(*) as cnt FROM user_tb GROUP BY username HAVING cnt > 1;

