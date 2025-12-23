-- 회사 테이블에 사업자등록번호와 대표자 이름 컬럼 추가 및 UNIQUE 제약 추가
-- 기존 데이터가 있는 경우를 고려하여 단계별로 실행합니다.

-- 1단계: 컬럼을 NULL 허용으로 추가 (UNIQUE 제약 없이)
ALTER TABLE `company_tb`
  ADD COLUMN `business_reg_no` varchar(20) NULL COMMENT '사업자등록번호' AFTER `company_name`,
  ADD COLUMN `representative_name` varchar(50) NULL COMMENT '대표자 이름' AFTER `business_reg_no`;

-- 2단계: 기존 데이터에 임시값 설정 (각 행마다 고유한 값으로)
UPDATE `company_tb` 
SET 
  `business_reg_no` = CONCAT('TEMP-', LPAD(company_id, 10, '0')),
  `representative_name` = '임시대표자'
WHERE `business_reg_no` IS NULL OR `business_reg_no` = '';

-- 3단계: NOT NULL 제약 추가
ALTER TABLE `company_tb`
  MODIFY COLUMN `business_reg_no` varchar(20) NOT NULL COMMENT '사업자등록번호',
  MODIFY COLUMN `representative_name` varchar(50) NOT NULL COMMENT '대표자 이름';

-- 4단계: UNIQUE KEY 추가
ALTER TABLE `company_tb`
  ADD UNIQUE KEY `uk_business_reg_no` (`business_reg_no`);

-- 주의: 임시값(TEMP-*)으로 설정된 데이터는 나중에 실제 사업자등록번호와 대표자 이름으로 업데이트해야 합니다.

