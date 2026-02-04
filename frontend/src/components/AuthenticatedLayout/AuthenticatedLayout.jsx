import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaList, FaChartLine } from 'react-icons/fa';
import { useIsMobile } from '../../hooks/useMediaQuery';
import AppSidebar from '../AppSidebar/AppSidebar';
import * as S from './style';

// 페이지별 제목 매핑
const PAGE_TITLES = {
  '/dashboard': '대시보드',
  '/dashboard/main': '대시보드',
  '/expenses': '지출결의서 목록',
  '/expenses/create': '지출결의서 작성',
  '/tax/summary': '세무 요약',
  '/users': '사용자 관리',
  '/profile': '내 정보',
  '/expense-categories': '지출 항목 관리',
  '/my-approvers': '담당 결재자 설정',
  '/subscriptions/manage': '구독 관리',
  '/subscriptions/plans': '구독 플랜',
  '/subscriptions/payments': '결제 내역',
  '/cards': '카드 관리',
  '/signatures': '도장/서명 관리',
  '/missing-receipts': '영수증 미첨부 건',
  '/account-codes': '계정 코드 매핑',
  '/monthly-closing': '월 마감',
  '/budget': '예산 관리',
  '/audit-rules': '감사 규칙 관리',
  '/audit-logs': '감사 로그',
};

// 페이지별 부제목 생성 함수
const getSubtitle = (pathname, user) => {
  if (pathname === '/dashboard' || pathname === '/dashboard/main') {
    return `환영합니다, ${user?.koreanName}님`;
  }
  if (pathname === '/expenses') {
    return `환영합니다, ${user?.koreanName}님`;
  }
  return null;
};

// 페이지별 추가 버튼 생성 함수
// 원칙: 인증된 모든 페이지에서 "대시보드"와 "결의서 목록"으로 바로 갈 수 있어야 함 (현재 페이지는 제외)
const getAdditionalButtons = (pathname, user, navigate) => {
  const buttons = [];

  const isDashboard = pathname === '/dashboard' || pathname === '/dashboard/main';
  const isExpenseList = pathname === '/expenses';
  const isTaxSummary = pathname === '/tax/summary';

  const baseButtonStyle = {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
  };

  // 결의서 목록 버튼 (대시보드/결의서 목록 외 페이지에서도 제공)
  if (!isExpenseList) {
    buttons.push(
      <button
        key="expenses"
        onClick={() => navigate('/expenses')}
        style={{
          ...baseButtonStyle,
          backgroundColor: '#6c757d',
        }}
      >
        <FaList />
        <span>결의서 목록</span>
      </button>
    );
  }

  // 대시보드 버튼 (대시보드 외 페이지에서도 제공)
  if (!isDashboard) {
    buttons.push(
      <button
        key="dashboard"
        onClick={() => navigate('/dashboard/main')}
        style={{
          ...baseButtonStyle,
          backgroundColor: '#007bff',
          marginLeft: buttons.length > 0 ? '8px' : undefined,
        }}
      >
        <FaChartLine />
        <span>대시보드</span>
      </button>
    );
  }

  // 세무사 요약(세무사 계정만) - 어디서든 이동 가능하게
  if (user?.role === 'TAX_ACCOUNTANT' && !isTaxSummary) {
    buttons.push(
      <button
        key="tax"
        onClick={() => navigate('/tax/summary')}
        style={{
          ...baseButtonStyle,
          backgroundColor: '#007bff',
          marginLeft: buttons.length > 0 ? '8px' : undefined,
        }}
      >
        <span>세무사 요약</span>
      </button>
    );
  }

  return buttons.length > 0 ? <>{buttons}</> : null;
};

const AuthenticatedLayout = ({ children, customTitle, customSubtitle, customAdditionalButtons }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // 동적 경로 처리 (예: /detail/:id, /expenses/edit/:id)
  const getPageTitle = () => {
    if (customTitle) return customTitle;
    
    // 정확한 경로 매칭
    if (PAGE_TITLES[location.pathname]) {
      return PAGE_TITLES[location.pathname];
    }
    
    // 동적 경로 처리
    if (location.pathname.startsWith('/detail/')) {
      return '지출결의서 상세';
    }
    if (location.pathname.startsWith('/expenses/edit/')) {
      return '지출결의서 수정';
    }
    
    // 기본값
    return 'InnerSignature';
  };
  
  const title = getPageTitle();
  const subtitle = customSubtitle || getSubtitle(location.pathname, user);
  const additionalButtons = customAdditionalButtons || getAdditionalButtons(location.pathname, user, navigate);
  
  // 인증되지 않은 사용자는 헤더 표시 안 함 (로그인 페이지 등)
  if (!user) {
    return <>{children}</>;
  }
  
  return (
    <>
      {/* 모바일은 기존 MobileAppBar/MobileBottomNav가 전역 헤더 역할을 수행 */}
      {isMobile ? (
        <>{children}</>
      ) : (
        <S.Layout>
          <AppSidebar />
          <S.Content>
            <S.ContentInner>
              <S.ContentHeader>
                <S.TitleBlock>
                  <S.Title>{title}</S.Title>
                  {subtitle && <S.Subtitle>{subtitle}</S.Subtitle>}
                </S.TitleBlock>
                {additionalButtons && <S.HeaderActions>{additionalButtons}</S.HeaderActions>}
              </S.ContentHeader>
            </S.ContentInner>
            {children}
          </S.Content>
        </S.Layout>
      )}
    </>
  );
};

export default AuthenticatedLayout;

