# InnerSignature Database 폴더 정리

## 📁 폴더 구조

```
database/
├── 01_init/                    # 초기화 파일들
│   └── init_subscription_plans.sql
├── 02_tables/                  # 테이블 생성
│   └── create_all_tables.sql
├── 03_seed/                    # 시드 데이터
│   ├── seed_account_code_mappings.sql
│   └── seed_expense_categories.sql
├── 04_migrations/              # 미적용 마이그레이션
│   └── migrate_add_subscription_plan_change_fields.sql
├── 05_optimize/                # 최적화
│   └── optimize_database_indexes.sql
├── archive/                    # 삭제된 마이그레이션 파일들 (백업)
├── signature_*.sql             # 현재 DB 구조 (참조용)
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
mysql> source 04_migrations/migrate_add_subscription_plan_change_fields.sql;

# 5. 인덱스 최적화 (이미 테이블 생성 시 포함됨)
mysql> source 05_optimize/optimize_database_indexes.sql;
```

## 📊 정리 결과

### 기존 vs 정리 후
- **기존 파일 수**: 38개 SQL 파일
- **정리 후 파일 수**: 7개 SQL 파일 (81% 감소)
- **삭제된 파일**: 31개 (archive 폴더로 백업)

### 삭제된 파일들 (archive/)
- `migrate_create_*.sql` (11개): 이미 적용된 테이블 생성 마이그레이션
- `migrate_add_*.sql` (14개): 이미 적용된 컬럼 추가 마이그레이션
- `migrate_*` (6개): 이미 적용된 데이터 마이그레이션

### 보존된 파일들
- `init_subscription_plans.sql`: 구독 플랜 초기 데이터
- `create_all_tables.sql`: 통합 테이블 생성 스크립트
- `seed_*.sql` (2개): 기본 마스터 데이터
- `migrate_add_subscription_plan_change_fields.sql`: 미적용 마이그레이션
- `optimize_database_indexes.sql`: 인덱스 최적화

## ✅ 주요 특징

### 통합 테이블 생성 스크립트 (`create_all_tables.sql`)
- **22개 테이블** 모두 포함
- **21개 최적화 인덱스** 미리 포함
- **외래키 제약조건** 포함
- **MySQL 5.7 호환**
- **배포서버덤프확인 기준** 최신 구조

### 폴더 구조 최적화
- **실행 순서에 따른 폴더 분류**
- **관련 파일들 그룹화**
- **유지보수 용이성 향상**

## 🔍 검증 방법

### 테이블 생성 확인
```sql
SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
```

### 인덱스 확인
```sql
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

## 📝 참고사항

- `signature_*.sql`: 현재 데이터베이스 구조 백업 (참조용)
- `archive/`: 삭제된 마이그레이션 파일들 백업
- 배포 전 반드시 로컬에서 테스트 실행 권장
- 외래키 제약조건으로 인한 생성 순서 중요

---
*정리일: 2026년 1월 9일 | 로컬덤프 + 배포서버덤프확인 기준*
