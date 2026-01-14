import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchExpenseList } from '../../api/expenseApi';
import { getUserCompanies } from '../../api/userApi';
import { getCurrentSubscription } from '../../api/subscriptionApi';
import { getTotalAvailableAmount } from '../../api/creditApi';
import { STATUS_KOREAN } from '../../constants/status';
import { useDebounce, useOptimizedList } from '../../hooks/useOptimizedList';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import CompanyRegistrationModal from '../../components/CompanyRegistrationModal/CompanyRegistrationModal';
import UserDashboardSection from '../../components/DashboardSections/UserDashboardSection';
import AccountantDashboardSection from '../../components/DashboardSections/AccountantDashboardSection';
import TaxAccountantDashboardSection from '../../components/DashboardSections/TaxAccountantDashboardSection';
import AdminDashboardSection from '../../components/DashboardSections/AdminDashboardSection';
import CEODashboardSection from '../../components/DashboardSections/CEODashboardSection';
import { FaPlus, FaEye, FaChevronUp, FaCalendarAlt, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MainDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    waitCount: 0,
    rejectedCount: 0,
    approvedCount: 0,
    paidCount: 0
  });
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const checkedCompanyModalRef = useRef(false);
  const [selectedStatus, setSelectedStatus] = useState(null); // 선택된 상태
  const [statusExpenses, setStatusExpenses] = useState([]); // 선택된 상태의 결의서 목록
  const [loadingStatusExpenses, setLoadingStatusExpenses] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [totalCredit, setTotalCredit] = useState(0);
  
  // 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 초기 필터 계산 함수
  const getInitialMonthFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    return {
      startDate: formatDate(monthStart),
      endDate: formatDate(monthEnd)
    };
  };

  // 기간 필터 (기본값: 이번 달) - 초기값을 바로 설정
  const [filters, setFilters] = useState(getInitialMonthFilters);

  // 현재 선택된 기간 표시를 위한 상태
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}년 ${today.getMonth() + 1}월`;
  });

  // 선택된 월을 관리하는 상태
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 디바운스된 필터 적용 (500ms 지연으로 API 호출 최적화)
  const debouncedFilters = useDebounce(filters, 500);

  // 메모이제이션된 필터 파라미터
  const filterParams = useMemo(() => ({
    ...filters,
    drafterName: user?.role === 'USER' ? user.koreanName : ''
  }), [filters, user]);

  // 메모이제이션된 통계 계산 함수
  const calculateStats = useCallback((expenses) => {
    const filteredExpenses = user?.role === 'USER'
      ? expenses.filter(exp => exp.drafterId === user.userId)
      : expenses;

    // 승인된 결의서만 필터링
    const approvedExpenses = filteredExpenses.filter(exp => exp.status === 'APPROVED');

    return {
      totalAmount: approvedExpenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0),
      waitCount: filteredExpenses.filter(exp => exp.status === 'WAIT').length,
      rejectedCount: filteredExpenses.filter(exp => exp.status === 'REJECTED').length,
      approvedCount: filteredExpenses.filter(exp => exp.status === 'APPROVED').length
    };
  }, [user]);

  // 최적화된 대시보드 데이터 로드
  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetchExpenseList(1, 1000, filterParams);

        if (response.success && response.data) {
          const expenses = response.data.content || [];
          const newStats = calculateStats(expenses);
          setStats(newStats);
        }
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        alert('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, filterParams, calculateStats]);


  // 구독 및 크레딧 정보 로드 (CEO, ADMIN만)
  useEffect(() => {
    const loadCommonData = async () => {
      // CEO 또는 ADMIN 권한이 있는 경우에만 호출
      if (!user || (user.role !== 'CEO' && user.role !== 'ADMIN')) {
        return;
      }

      try {
        const [subscriptionRes, creditRes] = await Promise.all([
          getCurrentSubscription().catch(() => ({ success: false, data: null })),
          getTotalAvailableAmount().catch(() => ({ success: false, data: null }))
        ]);

        if (subscriptionRes.success && subscriptionRes.data) {
          setSubscription(subscriptionRes.data);
        }
        if (creditRes.success && creditRes.data) {
          setTotalCredit(creditRes.data.totalAmount || 0);
        }
      } catch (err) {
        console.error('공통 데이터 로드 실패:', err);
      }
    };

    if (user) {
      loadCommonData();
    }
  }, [user]);

  // CEO이고 회사가 하나도 없으면 회사 등록 여부를 먼저 확인 후 모달 표시
  useEffect(() => {
    if (user && user.role === 'CEO' && !checkedCompanyModalRef.current) {
      checkedCompanyModalRef.current = true;

      (async () => {
        try {
          const companiesRes = await getUserCompanies();
          const hasNoCompanies =
            !companiesRes.success || !companiesRes.data || companiesRes.data.length === 0;

          if (hasNoCompanies) {
            const shouldOpen = window.confirm(
              '등록된 회사가 없습니다.\n지금 회사를 등록하시겠습니까?'
            );

            if (shouldOpen) {
              setIsCompanyModalOpen(true);
            }
          }
        } catch (error) {
          console.error('회사 목록 조회 실패:', error);
          const shouldOpen = window.confirm(
            '회사 정보를 불러오지 못했습니다.\n지금 새 회사를 등록하시겠습니까?'
          );
          if (shouldOpen) {
            setIsCompanyModalOpen(true);
          }
        }
      })();
    }
  }, [user?.userId]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 개선된 빠른 기간 선택 핸들러
  const handleQuickFilter = (period) => {
    const today = new Date();
    let startDate = '';
    let endDate = '';
    let periodLabel = '';

    switch (period) {
      case 'today':
        startDate = endDate = formatDate(today);
        periodLabel = '오늘';
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = endDate = formatDate(yesterday);
        periodLabel = '어제';
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + (6 - today.getDay()));
        startDate = formatDate(weekStart);
        endDate = formatDate(weekEnd);
        periodLabel = '이번 주';
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        startDate = formatDate(lastWeekStart);
        endDate = formatDate(lastWeekEnd);
        periodLabel = '지난 주';
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startDate = formatDate(monthStart);
        endDate = formatDate(monthEnd);
        periodLabel = '이번 달';
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = formatDate(lastMonthStart);
        endDate = formatDate(lastMonthEnd);
        periodLabel = '지난 달';
        break;
      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        startDate = formatDate(yearStart);
        endDate = formatDate(yearEnd);
        periodLabel = '올해';
        break;
      case 'all':
        startDate = '';
        endDate = '';
        periodLabel = '전체 기간';
        break;
    }

    setFilters({
      startDate,
      endDate
    });
    setSelectedPeriod(periodLabel);
  };

  // 월별 필터 적용 함수
  const handleMonthFilter = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const startDate = formatDate(monthStart);
    const endDate = formatDate(monthEnd);
    const periodLabel = `${year}년 ${month}월`;

    setFilters({ startDate, endDate });
    setSelectedPeriod(periodLabel);
    setCurrentMonth(date);
  };

  // 이전 월로 이동
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    handleMonthFilter(newMonth);
  };

  // 다음 월로 이동
  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    handleMonthFilter(newMonth);
  };

  // 통계 카드 클릭 핸들러 - 해당 상태의 결의서 목록 로드
  const handleStatCardClick = async (status) => {
    // 같은 상태를 다시 클릭하면 닫기
    if (selectedStatus === status) {
      setSelectedStatus(null);
      setStatusExpenses([]);
      return;
    }

    setSelectedStatus(status);
    setLoadingStatusExpenses(true);

    try {
      // 일반 사용자는 자신이 작성한 글만 조회
      const filterParams = {
        ...filters,
        status: [status],
        drafterName: user.role === 'USER' ? user.koreanName : ''
      };

      const response = await fetchExpenseList(1, 100, filterParams);
      
      if (response.success && response.data) {
        const expenses = response.data.content || [];
        
        // 일반 사용자는 자신이 작성한 글만 필터링 (이중 체크)
        const filteredExpenses = user.role === 'USER' 
          ? expenses.filter(exp => exp.drafterId === user.userId)
          : expenses;
        
        setStatusExpenses(filteredExpenses);
      } else {
        setStatusExpenses([]);
      }
    } catch (error) {
      console.error('결의서 목록 로드 실패:', error);
      setStatusExpenses([]);
    } finally {
      setLoadingStatusExpenses(false);
    }
  };

  if (!user) {
    return (
      <S.Container>
        <S.Alert>로그인이 필요합니다.</S.Alert>
        <S.Button onClick={() => navigate('/')}>로그인 페이지로 이동</S.Button>
      </S.Container>
    );
  }

  if (loading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  return (
    <S.Container>
      {/* 기간 필터 */}
      <S.FilterSection>
        <S.FilterGroup>
          <S.FilterLabel>
            <FaCalendarAlt />
            월별 탐색
          </S.FilterLabel>
          <S.MonthNavigator>
            <S.NavButton onClick={handlePreviousMonth}>
              <FaChevronLeft />
            </S.NavButton>
            <S.CurrentMonth>
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </S.CurrentMonth>
            <S.NavButton onClick={handleNextMonth}>
              <FaChevronRight />
            </S.NavButton>
          </S.MonthNavigator>
        </S.FilterGroup>
      </S.FilterSection>

      {/* 통계 카드 */}
      <S.StatsGrid>
        <S.StatCard>
          <S.StatLabel>합계 금액</S.StatLabel>
          <S.StatValue status="default">{stats.totalAmount.toLocaleString()}원</S.StatValue>
        </S.StatCard>

        <S.StatCard
          status="wait"
          onClick={() => handleStatCardClick('WAIT')}
          style={{ cursor: 'pointer' }}
          title="대기 상태 결의서 보기"
          selected={selectedStatus === 'WAIT'}
        >
          <S.StatLabel>대기</S.StatLabel>
          <S.StatValue status="wait">{stats.waitCount}건</S.StatValue>
          {selectedStatus === 'WAIT' && <FaChevronUp style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }} />}
        </S.StatCard>

        <S.StatCard
          status="rejected"
          onClick={() => handleStatCardClick('REJECTED')}
          style={{ cursor: 'pointer' }}
          title="반려 상태 결의서 보기"
          selected={selectedStatus === 'REJECTED'}
        >
          <S.StatLabel>반려</S.StatLabel>
          <S.StatValue status="rejected">{stats.rejectedCount}건</S.StatValue>
          {selectedStatus === 'REJECTED' && <FaChevronUp style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }} />}
        </S.StatCard>

        <S.StatCard
          status="approved"
          onClick={() => handleStatCardClick('APPROVED')}
          style={{ cursor: 'pointer' }}
          title="승인 상태 결의서 보기"
          selected={selectedStatus === 'APPROVED'}
        >
          <S.StatLabel>승인</S.StatLabel>
          <S.StatValue status="approved">{stats.approvedCount}건</S.StatValue>
          {selectedStatus === 'APPROVED' && <FaChevronUp style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }} />}
        </S.StatCard>

      </S.StatsGrid>

      {/* 선택된 상태의 결의서 목록 */}
      {selectedStatus && (
        <S.StatusExpenseSection>
          <S.StatusExpenseHeader>
            <S.StatusExpenseTitle>
              {STATUS_KOREAN[selectedStatus]} 상태 결의서 ({statusExpenses.length}건)
            </S.StatusExpenseTitle>
            <S.ViewAllButton onClick={() => {
              const params = new URLSearchParams();
              params.append('status', selectedStatus);
              if (filters.startDate) params.append('startDate', filters.startDate);
              if (filters.endDate) params.append('endDate', filters.endDate);
              navigate(`/expenses?${params.toString()}`);
            }}>
              전체 보기
            </S.ViewAllButton>
          </S.StatusExpenseHeader>

          {loadingStatusExpenses ? (
            <S.LoadingMessage>로딩 중...</S.LoadingMessage>
          ) : statusExpenses.length === 0 ? (
            <S.EmptyMessage>해당 상태의 결의서가 없습니다.</S.EmptyMessage>
          ) : (
            <S.ExpenseListContainer>
              {statusExpenses && statusExpenses.slice(0, 10).map((item) => {
                // 지급 요청일 계산
                const paymentReqDate = item.details && item.details.length > 0
                  ? item.details
                      .map(d => d.paymentReqDate)
                      .filter(d => d)
                      .sort()[0] || item.paymentReqDate || item.reportDate
                  : item.paymentReqDate || item.reportDate;

                // 적요(내용) 표시
                const descriptionDisplay = (item.summaryDescription && item.summaryDescription.trim() !== '')
                  ? item.summaryDescription
                  : (item.firstDescription && item.firstDescription.trim() !== '')
                    ? item.firstDescription
                    : '-';

                return (
                  <S.ExpenseListItem key={item.expenseReportId}>
                    <S.ExpenseListItemLink to={`/detail/${item.expenseReportId}`}>
                      <S.ExpenseListItemDate>{paymentReqDate}</S.ExpenseListItemDate>
                      <S.ExpenseListItemContent>
                        <S.ExpenseListItemTitle>
                          {descriptionDisplay}
                        </S.ExpenseListItemTitle>
                        <S.ExpenseListItemMeta>
                          <span>{item.drafterName}</span>
                          <span>{item.totalAmount.toLocaleString()}원</span>
                        </S.ExpenseListItemMeta>
                      </S.ExpenseListItemContent>
                      <S.ExpenseListItemAction>
                        <FaEye />
                      </S.ExpenseListItemAction>
                    </S.ExpenseListItemLink>
                  </S.ExpenseListItem>
                );
              })}
              {statusExpenses.length > 10 && (
                <S.ViewMoreButton onClick={() => {
                  const params = new URLSearchParams();
                  params.append('status', selectedStatus);
                  if (filters.startDate) params.append('startDate', filters.startDate);
                  if (filters.endDate) params.append('endDate', filters.endDate);
                  navigate(`/expenses?${params.toString()}`);
                }}>
                  더 보기 ({statusExpenses.length - 10}건 더)
                </S.ViewMoreButton>
              )}
            </S.ExpenseListContainer>
          )}
        </S.StatusExpenseSection>
      )}

       

      {/* 권한별 대시보드 섹션 */}
      {user?.role === 'USER' && <UserDashboardSection filters={filters} />}
      {user?.role === 'ACCOUNTANT' && <AccountantDashboardSection filters={filters} />}
      {user?.role === 'TAX_ACCOUNTANT' && <TaxAccountantDashboardSection filters={filters} />}
      {user?.role === 'ADMIN' && <AdminDashboardSection filters={filters} />}
      {user?.role === 'CEO' && <CEODashboardSection filters={filters} />}

      {/* 구독 카드 */}
      {(subscription || totalCredit > 0) && (
        <S.InfoCardsSection>
          <S.SubscriptionCard onClick={() => navigate('/subscriptions/manage')}>
            <S.SubscriptionCardHeader>
              <S.SubscriptionCardTitle>💎 구독 정보</S.SubscriptionCardTitle>
              {subscription?.status === 'ACTIVE' && (
                <S.SubscriptionStatusBadge status={subscription.status}>활성</S.SubscriptionStatusBadge>
              )}
            </S.SubscriptionCardHeader>

            <S.SubscriptionInfoGrid>
              {totalCredit > 0 && (
                <S.SubscriptionInfoItem>
                  <S.InfoItemIcon>💰</S.InfoItemIcon>
                  <S.InfoItemContent>
                    <S.InfoItemValue>{totalCredit.toLocaleString()}원</S.InfoItemValue>
                    <S.InfoItemLabel>사용 가능한 크레딧</S.InfoItemLabel>
                  </S.InfoItemContent>
                </S.SubscriptionInfoItem>
              )}

              {subscription && (
                <S.SubscriptionInfoItem>
                  <S.InfoItemIcon>📋</S.InfoItemIcon>
                  <S.InfoItemContent>
                    <S.InfoItemValue>{subscription.plan?.planName || '알 수 없음'}</S.InfoItemValue>
                    <S.InfoItemLabel>현재 플랜</S.InfoItemLabel>
                  </S.InfoItemContent>
                </S.SubscriptionInfoItem>
              )}

              {subscription?.endDate && (
                <S.SubscriptionInfoItem>
                  <S.InfoItemIcon>📅</S.InfoItemIcon>
                  <S.InfoItemContent>
                    <S.InfoItemValue>{subscription.endDate}</S.InfoItemValue>
                    <S.InfoItemLabel>만료 예정일</S.InfoItemLabel>
                  </S.InfoItemContent>
                </S.SubscriptionInfoItem>
              )}
            </S.SubscriptionInfoGrid>

            <S.SubscriptionCardFooter>관리 페이지로 이동 →</S.SubscriptionCardFooter>
          </S.SubscriptionCard>
        </S.InfoCardsSection>
      )}

    

      {/* CEO이면서 소속 회사가 없을 때 회사 등록 모달 */}
      <CompanyRegistrationModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </S.Container>
  );
};

export default MainDashboardPage;

