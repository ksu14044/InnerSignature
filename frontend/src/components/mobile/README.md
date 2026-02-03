# 모바일 대시보드 컴포넌트

이 폴더는 모바일 환경에 최적화된 대시보드 컴포넌트들을 포함합니다.

## 📱 구조

### 컴포넌트 목록

- **MobileCEODashboard.jsx** - CEO용 모바일 대시보드
- **MobileAccountantDashboard.jsx** - 회계사용 모바일 대시보드
- **MobileUserDashboard.jsx** - 일반 사용자용 모바일 대시보드
- **MobileTaxAccountantDashboard.jsx** - 세무사용 모바일 대시보드
- **style.js** - 공통 모바일 스타일 정의

## 🎯 주요 특징

### 1. 자동 반응형 전환
- 480px 이하에서 자동으로 모바일 버전으로 전환
- `useIsMobile()` 훅을 통한 자동 감지

### 2. 터치 친화적 UI
- 최소 44x44px 터치 영역
- Active 상태에서 시각적 피드백 (scale 효과)
- 스와이프 제스처 지원

### 3. 카드 스와이프 기능
- Swiper 라이브러리 사용
- 통계 카드를 좌우로 스와이프하여 확인
- 페이지네이션 인디케이터 표시

### 4. 모바일 최적화 디자인
- 복잡한 차트 대신 바 그래프와 프로그레스 바
- 아이콘과 이모지를 활용한 직관적 표현
- 둥근 모서리(16px~20px)와 그림자 효과
- 간결하고 명확한 정보 배치

### 5. 네이티브 앱 느낌
- 카드 기반 레이아웃
- 부드러운 애니메이션
- 상태 변화에 따른 시각적 피드백

## 📦 의존성

```json
{
  "swiper": "^11.x.x"
}
```

## 🚀 사용 방법

### 1. 기존 대시보드 섹션에 통합

```javascript
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileCEODashboard from '../mobile/MobileCEODashboard';

const CEODashboardSection = ({ filters }) => {
  const isMobile = useIsMobile();
  // ... 데이터 로딩 로직 ...

  // 모바일 버전 렌더링
  if (isMobile) {
    return (
      <MobileCEODashboard
        dashboardStats={dashboardStats}
        statusStats={statusStats}
        categoryRatio={categoryRatio}
        pendingUsers={pendingUsers}
        monthlyTrend={monthlyTrend}
      />
    );
  }

  // 데스크톱 버전
  return (
    // ... 기존 코드 ...
  );
};
```

### 2. Props 전달

각 모바일 대시보드는 필요한 데이터를 props로 받습니다:

#### MobileCEODashboard
```javascript
{
  dashboardStats: Object,    // 통계 데이터
  statusStats: Array,        // 상태별 통계
  categoryRatio: Array,      // 카테고리별 비율
  pendingUsers: Array,       // 승인 대기 사용자
  monthlyTrend: Array        // 월별 추이 (선택사항)
}
```

#### MobileAccountantDashboard
```javascript
{
  dashboardStats: Object,    // 통계 데이터
  statusStats: Array,        // 상태별 통계
  categoryRatio: Array,      // 카테고리별 비율
  pendingApprovals: Array,   // 결재 대기 건
  approvedExpenses: Array    // 결제 대기 건
}
```

#### MobileUserDashboard
```javascript
{
  stats: Object,             // 사용자 통계
  recentExpenses: Array      // 최근 지출내역
}
```

#### MobileTaxAccountantDashboard
```javascript
{
  taxStatus: Object,         // 세무 현황
  pendingReports: Array,     // 세무 처리 대기
  summary: Array             // 카테고리별 요약
}
```

## 🎨 스타일 커스터마이징

### 색상 변경

`style.js`에서 통계 카드 색상을 변경할 수 있습니다:

```javascript
<S.StatCard color="#4CAF50">  // 원하는 색상으로 변경
```

### 레이아웃 조정

Swiper 설정을 변경하여 표시되는 카드 수를 조정:

```javascript
<Swiper
  slidesPerView={2.2}  // 한 번에 보이는 카드 수
  spaceBetween={12}    // 카드 간격
  // ...
>
```

## 🔧 향후 개선 사항

- [ ] Pull-to-refresh 기능 추가
- [ ] 오프라인 지원
- [ ] 스켈레톤 로딩 UI
- [ ] 제스처 기반 내비게이션
- [ ] 다크 모드 지원

## 📝 주의사항

1. **Swiper 라이브러리 필수**: `npm install swiper` 명령으로 설치 필요
2. **CSS import**: Swiper CSS를 반드시 import 해야 함
3. **터치 영역**: 버튼은 최소 44x44px 유지
4. **성능**: 모바일에서는 무거운 차트 라이브러리 대신 간단한 프로그레스 바 사용

## 🐛 디버깅

모바일 뷰가 표시되지 않는 경우:

1. 브라우저 개발자 도구에서 디바이스 에뮬레이션 확인
2. `useIsMobile()` 훅이 올바르게 작동하는지 확인
3. 480px 이하로 화면 크기를 줄여서 테스트

```javascript
// 디버깅 코드
const isMobile = useIsMobile();
console.log('Is Mobile:', isMobile, 'Window Width:', window.innerWidth);
```

## 📞 문의

문제가 발생하거나 개선 제안이 있으시면 이슈를 등록해주세요.

















