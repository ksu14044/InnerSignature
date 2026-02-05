import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchExpenseList, fetchPendingApprovals } from '../../api/expenseApi';
import { getUserCompanies, getPendingUsers, approveUser } from '../../api/userApi';
import { getCurrentSubscription } from '../../api/subscriptionApi';
import { getTotalAvailableAmount } from '../../api/creditApi';
import { STATUS_KOREAN } from '../../constants/status';
import { useDebounce, useOptimizedList } from '../../hooks/useOptimizedList';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import CompanyRegistrationModal from '../../components/CompanyRegistrationModal/CompanyRegistrationModal';
import AccountantDashboardSection from '../../components/DashboardSections/AccountantDashboardSection';
import TaxAccountantDashboardSection from '../../components/DashboardSections/TaxAccountantDashboardSection';
import AdminDashboardSection from '../../components/DashboardSections/AdminDashboardSection';
import CEODashboardSection from '../../components/DashboardSections/CEODashboardSection';
import { FaPlus, FaEye, FaChevronUp, FaCalendarAlt, FaChevronDown, FaChevronLeft, FaChevronRight, FaBell, FaList, FaBuilding, FaCheck } from 'react-icons/fa';

const MainDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    waitCount: 0,
    rejectedCount: 0,
    approvedCount: 0
  });
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const checkedCompanyModalRef = useRef(false);
  const [selectedStatus, setSelectedStatus] = useState(null); // 선택된 상태
  const [statusExpenses, setStatusExpenses] = useState([]); // 선택된 상태의 결의서 목록
  const [loadingStatusExpenses, setLoadingStatusExpenses] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [totalCredit, setTotalCredit] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);
  
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
          
          // 최근 작성한 결의서 (최대 5개)
          if (user.role === 'USER') {
            const filteredExpenses = expenses.filter(exp => exp.drafterId === user.userId);
            setRecentExpenses(
              filteredExpenses
                .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
                .slice(0, 5)
            );
          }
        }
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        // 401 에러는 axiosInstance에서 이미 로그인 페이지로 리다이렉트 처리
        // 따라서 401 에러가 아닐 때만 alert 표시
        if (error?.response?.status !== 401) {
          alert('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, filterParams, calculateStats]);

  // 알림 데이터 로드
  useEffect(() => {
    if (!user?.userId) return;

    const loadNotifications = async () => {
      try {
        // 서명 대기 건 조회
        const approvalsRes = await fetchPendingApprovals(user.userId);
        if (approvalsRes.success) {
          setPendingApprovals(approvalsRes.data || []);
        }

        // 승인 대기 사용자 조회 (CEO, ADMIN만)
        if (user.role === 'CEO' || user.role === 'ADMIN') {
          const usersRes = await getPendingUsers();
          if (usersRes.success) {
            setPendingUsers(usersRes.data || []);
          }
        }
      } catch (error) {
        console.error('알림 데이터 로드 실패:', error);
      }
    };

    loadNotifications();
  }, [user?.userId, user?.role]);

  // 회사 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCompanyDropdownOpen && !event.target.closest('[data-company-dropdown]')) {
        setIsCompanyDropdownOpen(false);
      }
    };

    if (isCompanyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCompanyDropdownOpen]);


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

  const { companies, switchCompany } = useAuth();
  const totalNotifications = pendingApprovals.length + pendingUsers.length;

  return (
    <S.Container>
      {/* 헤더 영역 - 피그마 디자인 기반 */}
      {(user?.role === 'USER' || user?.role === 'ACCOUNTANT' || user?.role === 'ADMIN' || user?.role === 'TAX_ACCOUNTANT' || user?.role === 'CEO') && (
        <>
          <S.PageHeader>
            <S.PageHeaderLeft>
              <S.PageTitle>대시보드</S.PageTitle>
            </S.PageHeaderLeft>
            <S.PageHeaderRight>
              <S.DashboardNotificationContainer>
                <S.DashboardNotificationIconWrapper>
                  <S.DashboardNotificationIcon
                    onClick={() => {
                      // 서명 대기 건이 있으면 바로 모달 열기
                      if (pendingApprovals.length > 0) {
                        setIsNotificationModalOpen(true);
                      } else if (pendingUsers.length > 0) {
                        // 승인 대기 건이 있으면 승인 모달 열기
                        setIsApprovalModalOpen(true);
                      }
                    }}
                    style={{ cursor: totalNotifications > 0 ? 'pointer' : 'default' }}
                  >
                    <img src="/이너사인_이미지 (1)/아이콘/24px_알림_사이드바/알림.png" alt="알림" />
                  </S.DashboardNotificationIcon>
                  {totalNotifications > 0 && (
                    <S.DashboardNotificationBadgeCount>{totalNotifications > 9 ? '9+' : totalNotifications}</S.DashboardNotificationBadgeCount>
                  )}
                </S.DashboardNotificationIconWrapper>
                <S.DashboardNotificationBadge>
                  <S.DashboardProfileIcon />
                </S.DashboardNotificationBadge>
              </S.DashboardNotificationContainer>
            </S.PageHeaderRight>
          </S.PageHeader>
          
          {/* 액션 버튼 섹션 - 역할별로 다른 버튼 표시 */}
          <S.DashboardActionSection>
            {companies && companies.length > 1 && (
              <S.DashboardCompanySelector data-company-dropdown>
                <S.DashboardCompanySelectorButton onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}>
                  <span>{companies.find(c => c.companyId === user.companyId)?.companyName || '회사 선택'}</span>
                  <FaChevronDown style={{ fontSize: '12px', marginLeft: '4px' }} />
                </S.DashboardCompanySelectorButton>
                {isCompanyDropdownOpen && (
                  <S.DashboardCompanyDropdown>
                    {companies.map((company) => (
                      <S.DashboardCompanyDropdownItem
                        key={company.companyId}
                        selected={company.companyId === user.companyId}
                        onClick={async () => {
                          try {
                            await switchCompany(company.companyId);
                            setIsCompanyDropdownOpen(false);
                            window.location.reload();
                          } catch (error) {
                            alert('회사 전환에 실패했습니다.');
                          }
                        }}
                      >
                        {company.companyId === user.companyId && <FaCheck style={{ marginRight: '8px', color: '#007bff' }} />}
                        {company.companyName}
                      </S.DashboardCompanyDropdownItem>
                    ))}
                  </S.DashboardCompanyDropdown>
                )}
              </S.DashboardCompanySelector>
            )}
            <S.ActionButtons>
              {user?.role === 'USER' && (
                <>
                  <S.ListButton onClick={() => navigate('/expenses')}>
                    <FaList />
                    <span>내 지출결의서</span>
                  </S.ListButton>
                  <S.CreateButton onClick={() => navigate('/expenses/create')}>
                    <FaPlus />
                    <span>지출결의서 작성</span>
                  </S.CreateButton>
                </>
              )}
              {user?.role === 'ACCOUNTANT' && (
                <>
                  <S.ListButton onClick={() => navigate('/expenses?tab=MY_APPROVALS')}>
                    <FaList />
                    <span>내 결재함</span>
                  </S.ListButton>
                  <S.CreateButton onClick={() => navigate('/expenses/create')}>
                    <FaPlus />
                    <span>지출결의서 작성</span>
                  </S.CreateButton>
                </>
              )}
              {(user?.role === 'ADMIN' || user?.role === 'CEO') && (
                <S.CreateButton onClick={() => navigate('/expenses/create')}>
                  <FaPlus />
                  <span>지출결의서 작성</span>
                </S.CreateButton>
              )}
              {user?.role === 'TAX_ACCOUNTANT' && (
                <S.CreateButton onClick={() => navigate('/tax/summary')}>
                  <FaList />
                  <span>세무 요약</span>
                </S.CreateButton>
              )}
            </S.ActionButtons>
          </S.DashboardActionSection>
        </>
      )}

      {/* 기간 필터 */}
      <S.FilterSection>
        <S.FilterGroup>
          <S.FilterLabel>
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

      {/* 통계 카드 - 피그마 디자인 기반 (USER 역할만 표시) */}
      {user?.role === 'USER' && (
        <S.StatsGrid>
          <S.StatCard>
            <S.StatLabel>
              <S.StatBadge status="default">합계 금액</S.StatBadge>
            </S.StatLabel>
            <S.StatValue>{stats.totalAmount.toLocaleString()}원</S.StatValue>
          </S.StatCard>

          <S.StatCard
            status="wait"
            onClick={() => handleStatCardClick('WAIT')}
            title="대기 상태 결의서 보기"
            selected={selectedStatus === 'WAIT'}
          >
            <S.StatLabel>
              <S.StatBadge status="wait">대기</S.StatBadge>
            </S.StatLabel>
            <S.StatValue>{stats.waitCount}건</S.StatValue>
            {selectedStatus === 'WAIT' && <S.ChevronIcon><FaChevronUp /></S.ChevronIcon>}
          </S.StatCard>

          <S.StatCard
            status="rejected"
            onClick={() => handleStatCardClick('REJECTED')}
            title="반려 상태 결의서 보기"
            selected={selectedStatus === 'REJECTED'}
          >
            <S.StatLabel>
              <S.StatBadge status="rejected">반려</S.StatBadge>
            </S.StatLabel>
            <S.StatValue>{stats.rejectedCount}건</S.StatValue>
            {selectedStatus === 'REJECTED' && <S.ChevronIcon><FaChevronUp /></S.ChevronIcon>}
          </S.StatCard>

          <S.StatCard
            status="approved"
            onClick={() => handleStatCardClick('APPROVED')}
            title="승인 상태 결의서 보기"
            selected={selectedStatus === 'APPROVED'}
          >
            <S.StatLabel>
              <S.StatBadge status="approved">승인</S.StatBadge>
            </S.StatLabel>
            <S.StatValue>{stats.approvedCount}건</S.StatValue>
            {selectedStatus === 'APPROVED' && <S.ChevronIcon><FaChevronUp /></S.ChevronIcon>}
          </S.StatCard>
        </S.StatsGrid>
      )}

      {/* 선택된 상태의 결의서 목록 (USER 역할만 표시) */}
      {user?.role === 'USER' && selectedStatus && (
        <S.StatusExpenseSection>
          <S.StatusExpenseHeader>
            <S.StatusExpenseTitle>
              최근 {STATUS_KOREAN[selectedStatus]} 상태 결의서
            </S.StatusExpenseTitle>
            <S.ViewAllLink to={`/expenses?status=${selectedStatus}${filters.startDate ? `&startDate=${filters.startDate}` : ''}${filters.endDate ? `&endDate=${filters.endDate}` : ''}`}>
              전체보기 →
            </S.ViewAllLink>
          </S.StatusExpenseHeader>

          {loadingStatusExpenses ? (
            <S.LoadingMessage>로딩 중...</S.LoadingMessage>
          ) : statusExpenses.length === 0 ? (
            <S.EmptyMessage>해당 상태의 결의서가 없습니다.</S.EmptyMessage>
          ) : (
            <S.RecentExpenseList>
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

                // 상태를 소문자로 변환 (StatusBadge용)
                // PENDING도 wait로 매핑
                let statusLower = item.status?.toLowerCase() || '';
                if (statusLower === 'pending') {
                  statusLower = 'wait';
                }

                return (
                  <S.RecentExpenseItem
                    key={item.expenseReportId}
                    onClick={() => navigate(`/detail/${item.expenseReportId}`)}
                    selected={false}
                  >
                    <S.RecentExpenseDate>{paymentReqDate}</S.RecentExpenseDate>
                    <S.RecentExpenseContent>
                      <S.RecentExpenseDescription>
                        {descriptionDisplay}
                      </S.RecentExpenseDescription>
                      <S.RecentExpenseMeta>
                        <span>{item.drafterName}</span>
                        <span>{item.totalAmount.toLocaleString()}원</span>
                      </S.RecentExpenseMeta>
                    </S.RecentExpenseContent>
                    {item.status && (
                      <S.StatusBadge status={statusLower}>
                        {STATUS_KOREAN[item.status] || item.status}
                      </S.StatusBadge>
                    )}
                  </S.RecentExpenseItem>
                );
              })}
            </S.RecentExpenseList>
          )}
        </S.StatusExpenseSection>
      )}

       

      {/* 일반 사용자 대시보드 - 최근 작성한 지출결의서 */}
      {user?.role === 'USER' && !selectedStatus && (
        <S.RecentExpenseSection>
          <S.RecentExpenseHeader>
            <S.RecentExpenseTitle>최근 작성한 지출결의서</S.RecentExpenseTitle>
            <S.ViewAllLink to="/expenses">전체보기 →</S.ViewAllLink>
          </S.RecentExpenseHeader>
          {recentExpenses.length === 0 ? (
            <S.EmptyMessage>작성한 결의서가 없습니다.</S.EmptyMessage>
          ) : (
            <S.RecentExpenseList>
              {recentExpenses.map((expense) => (
                <S.RecentExpenseItem
                  key={expense.expenseReportId}
                  onClick={() => navigate(`/detail/${expense.expenseReportId}`)}
                  selected={false}
                >
                  <S.RecentExpenseDate>{expense.reportDate}</S.RecentExpenseDate>
                  <S.RecentExpenseContent>
                    <S.RecentExpenseDescription>
                      {expense.summaryDescription || expense.firstDescription || '-'}
                    </S.RecentExpenseDescription>
                    <S.RecentExpenseMeta>
                      <span>{expense.drafterName}</span>
                      <span>{expense.totalAmount.toLocaleString()}원</span>
                    </S.RecentExpenseMeta>
                  </S.RecentExpenseContent>
                  {expense.status === 'APPROVED' && (
                    <S.StatusBadge status="approved">승인</S.StatusBadge>
                  )}
                </S.RecentExpenseItem>
              ))}
            </S.RecentExpenseList>
          )}
        </S.RecentExpenseSection>
      )}

      {/* 권한별 대시보드 섹션 - 일반 사용자는 MainDashboardPage에서 직접 처리 */}
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

    

      {/* 서명 대기 모달 */}
      {isNotificationModalOpen && (
        <S.NotificationModal onClick={() => setIsNotificationModalOpen(false)}>
          <S.NotificationModalContent onClick={(e) => e.stopPropagation()}>
            <S.NotificationModalHeader>
              <h3>서명 대기 건 ({pendingApprovals.length}건)</h3>
              <button onClick={() => setIsNotificationModalOpen(false)}>×</button>
            </S.NotificationModalHeader>
            <S.NotificationModalBody>
              {pendingApprovals.length === 0 ? (
                <p>서명 대기 중인 건이 없습니다.</p>
              ) : (
                <S.NotificationList>
                  {pendingApprovals.map((item) => (
                    <S.NotificationItem
                      key={item.expenseReportId}
                      onClick={() => {
                        navigate(`/detail/${item.expenseReportId}`);
                        setIsNotificationModalOpen(false);
                      }}
                    >
                      <S.NotificationItemTitle>
                        {(item.summaryDescription && item.summaryDescription.trim() !== '')
                          ? item.summaryDescription
                          : (item.firstDescription && item.firstDescription.trim() !== '')
                            ? item.firstDescription
                            : '-'}
                      </S.NotificationItemTitle>
                      <S.NotificationItemInfo>
                        <span>문서번호: {item.expenseReportId}</span>
                        <span>작성자: {item.drafterName}</span>
                        <span>작성일: {item.reportDate}</span>
                        <span>금액: {item.totalAmount.toLocaleString()}원</span>
                      </S.NotificationItemInfo>
                    </S.NotificationItem>
                  ))}
                </S.NotificationList>
              )}
            </S.NotificationModalBody>
          </S.NotificationModalContent>
        </S.NotificationModal>
      )}

      {/* 승인 대기 모달 */}
      {isApprovalModalOpen && (
        <S.NotificationModal onClick={() => setIsApprovalModalOpen(false)}>
          <S.NotificationModalContent onClick={(e) => e.stopPropagation()}>
            <S.NotificationModalHeader>
              <h3>승인 대기 사용자 ({pendingUsers.length}건)</h3>
              <button onClick={() => setIsApprovalModalOpen(false)}>×</button>
            </S.NotificationModalHeader>
            <S.NotificationModalBody>
              {pendingUsers.length === 0 ? (
                <p>승인 대기 중인 사용자가 없습니다.</p>
              ) : (
                <S.NotificationList>
                  {pendingUsers.map((pendingUser) => (
                    <S.NotificationItem key={pendingUser.userId}>
                      <S.NotificationItemTitle>{pendingUser.koreanName} ({pendingUser.username})</S.NotificationItemTitle>
                      <S.NotificationItemInfo>
                        <span>역할: {pendingUser.role}</span>
                        <span>직급: {pendingUser.position || '-'}</span>
                        <span>이메일: {pendingUser.email || '-'}</span>
                      </S.NotificationItemInfo>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={async () => {
                            try {
                              const response = await approveUser(pendingUser.userId, 'APPROVE');
                              if (response.success) {
                                setPendingUsers(pendingUsers.filter(u => u.userId !== pendingUser.userId));
                                const refreshResponse = await getPendingUsers();
                                if (refreshResponse.success) {
                                  setPendingUsers(refreshResponse.data || []);
                                }
                                alert('사용자가 승인되었습니다.');
                              } else {
                                alert(response.message || '승인에 실패했습니다.');
                              }
                            } catch (error) {
                              console.error('승인 실패:', error);
                              alert('승인 처리 중 오류가 발생했습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          승인
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await approveUser(pendingUser.userId, 'REJECT');
                              if (response.success) {
                                setPendingUsers(pendingUsers.filter(u => u.userId !== pendingUser.userId));
                                const refreshResponse = await getPendingUsers();
                                if (refreshResponse.success) {
                                  setPendingUsers(refreshResponse.data || []);
                                }
                                alert('사용자가 거부되었습니다.');
                              } else {
                                alert(response.message || '거부에 실패했습니다.');
                              }
                            } catch (error) {
                              console.error('거부 실패:', error);
                              alert('거부 처리 중 오류가 발생했습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          거부
                        </button>
                      </div>
                    </S.NotificationItem>
                  ))}
                </S.NotificationList>
              )}
            </S.NotificationModalBody>
          </S.NotificationModalContent>
        </S.NotificationModal>
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

