// 각 페이지별 Tour 설정

export const getTourStepsForPage = (pathname) => {
  const tourConfigs = {
    '/expenses': getExpenseListTourSteps(),
    '/expenses/create': getExpenseCreateTourSteps(),
    '/dashboard': getDashboardTourSteps(),
    '/tax/summary': getTaxSummaryTourSteps(),
    '/profile': getProfileTourSteps(),
    '/users': getUserManagementTourSteps(),
  };

  return tourConfigs[pathname] || null;
};

// 지출결의서 목록 페이지 Tour
const getExpenseListTourSteps = () => [
  {
    target: 'tour-header',
    title: '지출결의서 목록',
    content: '이 페이지에서 모든 지출결의서를 확인할 수 있습니다. 상단 헤더에서 대시보드, 내 정보, 사용자 관리 등으로 이동할 수 있습니다.',
  },
  {
    target: 'tour-create-button',
    title: '새 결의서 작성',
    content: '이 버튼을 클릭하면 새로운 지출결의서를 작성할 수 있습니다.',
  },
  {
    target: 'tour-filter-button',
    title: '필터 기능',
    content: '필터 버튼을 클릭하면 날짜, 금액, 카테고리, 상태 등으로 지출결의서를 검색할 수 있습니다.',
  },
  {
    target: 'tour-my-posts-toggle',
    title: '내가 쓴 글만 보기',
    content: '이 토글을 활성화하면 본인이 작성한 지출결의서만 표시됩니다.',
  },
  {
    target: 'tour-expense-list',
    title: '지출결의서 목록',
    content: '여기서 지출결의서 목록을 확인하고, 각 항목을 클릭하면 상세 페이지로 이동합니다.',
  },
  {
    target: 'tour-notification-badge',
    title: '알림 배지',
    content: '서명 대기 중인 건이 있으면 알림 배지가 표시됩니다. 클릭하면 대기 중인 건을 확인할 수 있습니다.',
  },
];

// 지출결의서 작성 페이지 Tour
const getExpenseCreateTourSteps = () => [
  {
    target: 'tour-basic-info',
    title: '기본 정보 입력',
    content: '지출결의서의 제목, 지급 요청일, 작성일 등을 입력합니다. CEO, ADMIN, ACCOUNTANT는 비밀글 설정이 가능합니다.',
  },
  {
    target: 'tour-approver-selection',
    title: '결재자 선택',
    content: '결재가 필요한 경우 결재자를 선택합니다. 선택한 순서대로 결재가 진행됩니다. 비밀글이나 급여 카테고리는 결재가 필요 없습니다.',
  },
  {
    target: 'tour-expense-details',
    title: '지출 상세 내역',
    content: '지출 항목, 적요, 금액, 비고를 입력합니다. "행 추가" 버튼으로 여러 항목을 추가할 수 있습니다.',
  },
  {
    target: 'tour-total-amount',
    title: '총 합계',
    content: '입력한 모든 지출 항목의 금액이 자동으로 합산되어 표시됩니다.',
  },
  {
    target: 'tour-submit-button',
    title: '결재 요청',
    content: '모든 정보를 입력한 후 이 버튼을 클릭하면 지출결의서가 저장되고 결재가 요청됩니다.',
  },
];

// 대시보드 페이지 Tour
const getDashboardTourSteps = () => [
  {
    target: 'tour-dashboard-header',
    title: '대시보드',
    content: 'CEO, ADMIN, ACCOUNTANT 권한 사용자만 접근할 수 있는 통계 대시보드입니다.',
  },
  {
    target: 'tour-subscription-card',
    title: '구독 상태',
    content: '현재 구독 상태와 만료일을 확인할 수 있습니다. 만료일이 임박하면 경고가 표시됩니다.',
  },
  {
    target: 'tour-date-filter',
    title: '날짜 필터',
    content: '시작일과 종료일을 설정하여 특정 기간의 데이터만 조회할 수 있습니다.',
  },
  {
    target: 'tour-stats-grid',
    title: '요약 통계',
    content: '총 금액, 총 건수, 평균 금액, 진행 중 건수 등 주요 통계를 한눈에 확인할 수 있습니다.',
  },
  {
    target: 'tour-charts',
    title: '차트',
    content: '월별 지출 추이, 상태별 통계, 카테고리별 비율을 차트로 시각화하여 확인할 수 있습니다.',
  },
];

// 세무사 요약 페이지 Tour
const getTaxSummaryTourSteps = () => [
  {
    target: 'tour-tax-header',
    title: '세무사 전용 요약',
    content: 'TAX_ACCOUNTANT 권한 사용자만 접근할 수 있는 세무처리 전용 페이지입니다.',
  },
  {
    target: 'tour-tax-filter',
    title: '필터',
    content: '날짜 범위와 세무처리 상태로 데이터를 필터링할 수 있습니다.',
  },
  {
    target: 'tour-tax-status',
    title: '세무처리 현황',
    content: '총 처리 대상 건수, 대기 건수, 완료 건수, 완료율 등 세무처리 현황을 확인할 수 있습니다.',
  },
  {
    target: 'tour-tax-pending',
    title: '세무처리 대기 건',
    content: '세무처리가 필요한 지출결의서 목록입니다. 개별 또는 일괄로 처리 완료할 수 있습니다.',
  },
  {
    target: 'tour-tax-summary',
    title: '카테고리별 집계',
    content: '카테고리별로 총 금액, 상세 건수, 결의서 수를 확인할 수 있습니다.',
  },
];

// 내 정보 페이지 Tour (핵심 섹션만 간단 안내)
const getProfileTourSteps = () => [
  {
    target: 'tour-profile-header',
    title: '내 정보',
    content: '로그인한 사용자의 정보를 확인하고 수정하는 페이지입니다.',
  },
  {
    target: 'tour-basic-info',
    title: '기본 정보',
    content: '아이디, 이름, 이메일, 직급, 권한 등 기본 정보를 확인하고 수정할 수 있습니다.',
  },
  {
    target: 'tour-password-change',
    title: '비밀번호 변경',
    content: '현재 비밀번호를 입력하고 새로운 비밀번호를 설정할 수 있습니다.',
  },
  {
    target: 'tour-company-section',
    title: '소속 회사',
    content: '소속된 회사 목록을 확인하고, 회사 검색 및 지원을 통해 새 회사에 소속을 요청할 수 있습니다.',
  },
  {
    target: 'tour-subscription-section',
    title: '구독 관리',
    content: 'CEO/ADMIN 권한 사용자는 여기에서 구독 관련 메뉴로 이동할 수 있습니다.',
  },
];

// 사용자 관리 페이지 Tour
const getUserManagementTourSteps = () => [
  {
    target: 'tour-user-management-header',
    title: '사용자 관리',
    content: 'CEO, ADMIN 권한 사용자가 회사의 사용자를 관리할 수 있는 페이지입니다.',
  },
];

