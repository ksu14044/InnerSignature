# InnerSignature Database 폴더 정리

## 📁 폴더 구조

```
database/
├── 01_init/                    # 초기화 데이터
│   └── init_subscription_plans.sql
├── 02_tables/                  # 테이블 생성
│   └── create_all_tables.sql
├── 03_seed/                    # 기본 데이터
│   ├── seed_expense_categories.sql
│   └── seed_account_code_mappings.sql
├── 04_migrations/              # 미적용 마이그레이션 (비어있음)
├── 05_optimize/                # 최적화
│   └── optimize_database_indexes.sql
├── archive/                    # 적용된 마이그레이션 백업 (비어있음)
├── scripts/                    # 유틸리티 스크립트
│   ├── validate_schema.sql     # 스키마 검증
│   └── compare_dumps.sql       # 덤프 비교
├── InnerSignature.code-workspace
└── README.md                   # 이 파일
```

## 🚀 실행 순서

### 1. 신규 데이터베이스 초기화
```bash
# 1. 구독 플랜 초기화
mysql> source 01_init/init_subscription_plans.sql;

# 2. 테이블 생성
mysql> source 02_tables/create_all_tables.sql;

# 3. 기본 데이터 입력
mysql> source 03_seed/seed_expense_categories.sql;
mysql> source 03_seed/seed_account_code_mappings.sql;

# 4. 추가 마이그레이션 (필요시)
mysql> source 04_migrations/*.sql;

# 5. 인덱스 최적화 (이미 테이블 생성 시 포함됨)
mysql> source 05_optimize/optimize_database_indexes.sql;
```

### 2. 기존 데이터베이스 업데이트
```bash
# 마이그레이션만 실행
mysql> source 04_migrations/*.sql;
```

## 📊 데이터베이스 구조

### 테이블 개요
- **총 22개 테이블**
- **모든 인덱스 포함** (최적화 인덱스 40+개)
- **외래키 제약조건 포함** (30+개 FK)
- **MySQL 5.7 호환**

### 주요 테이블 그룹
1. **기본 테이블**: `subscription_plan_tb`, `user_tb`, `company_tb`
2. **비즈니스 테이블**: `expense_report_tb`, `expense_detail_tb`, `approval_line_tb`
3. **관리 테이블**: `account_code_mapping_tb`, `expense_category_tb`, `budget_tb`
4. **시스템 테이블**: `audit_log_tb`, `payment_tb`, `credit_tb`

## 🔍 검증 및 모니터링

### 스키마 검증
```bash
mysql> source scripts/validate_schema.sql;
```
- 테이블 존재 여부 확인
- 외래키 제약조건 검증
- 인덱스 상태 확인
- 시드 데이터 검증

### 덤프 비교
```bash
mysql> source scripts/compare_dumps.sql;
```
- 로컬 vs 배포서버 구조 비교
- 마이그레이션 필요성 파악
- 데이터 동기화 검증

### 성능 모니터링
```sql
-- 테이블 크기 확인
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH/1024/1024 as data_mb,
    INDEX_LENGTH/1024/1024 as index_mb
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY DATA_LENGTH DESC;
```

## ⚠️ 중요 주의사항

### 백업 필수
- **모든 작업 전 데이터베이스 백업 필수**
- 스크립트 실행 전 테스트 환경에서 검증

### 실행 순서 준수
- 테이블 생성 → 시드 데이터 → 마이그레이션 순서 필수
- 외래키 제약조건으로 인한 순서 의존성 존재

### 버전 관리
- 배포 전 `scripts/compare_dumps.sql`로 검증
- 마이그레이션 파일은 버전별로 관리
- 적용 완료된 파일은 `archive/`로 이동

## 🔧 유지보수 가이드

### 정기 점검 항목
1. **매주**: `scripts/validate_schema.sql` 실행
2. **매월**: 인덱스 성능 분석 및 재구축
3. **배포 전**: 덤프 비교 검증

### 문제 해결
- **테이블 누락**: `02_tables/create_all_tables.sql` 재실행
- **데이터 불일치**: 시드 데이터 재적용
- **성능 저하**: `05_optimize/optimize_database_indexes.sql` 실행

### 마이그레이션 추가
```sql
# 1. 04_migrations/에 새로운 마이그레이션 파일 생성
# 2. scripts/validate_schema.sql로 검증
# 3. 배포 후 archive/로 이동
```

## 📝 참고사항

- **기준**: 배포서버덤프확인 폴더 (2026-01-09) 기준
- **호환성**: MySQL 5.7+ 지원
- **인코딩**: UTF8MB4 지원
- **문서화**: 모든 테이블 및 컬럼에 COMMENT 포함

---

*마지막 업데이트: 2026년 1월 12일 | 배포서버덤프확인 기준*
