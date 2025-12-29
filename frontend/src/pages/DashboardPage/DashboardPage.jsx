import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchDashboardStats, 
  fetchMonthlyTrend, 
  fetchStatusStats, 
  fetchCategoryRatio 
} from '../../api/expenseApi';
import { getCurrentSubscription } from '../../api/subscriptionApi';
import { getTotalAvailableAmount } from '../../api/creditApi';
import { useAuth } from '../../contexts/AuthContext';
import { STATUS_KOREAN } from '../../constants/status';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import TourButton from '../../components/TourButton/TourButton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const DashboardPage = () => {
  const { user, logout, companies } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [categoryRatio, setCategoryRatio] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [totalCredit, setTotalCredit] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  // isAuthorized를 useMemo로 메모이제이션
  const isAuthorized = useMemo(() => 
    user?.role === 'CEO' || user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT',
    [user?.role]
  );

  // loadDashboardData를 useCallback으로 메모이제이션
  const loadDashboardData = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      setLoading(true);
      
      const [statsRes, trendRes, statusRes, categoryRes, creditRes] = await Promise.all([
        fetchDashboardStats(filters.startDate || null, filters.endDate || null),
        fetchMonthlyTrend(filters.startDate || null, filters.endDate || null),
        fetchStatusStats(filters.startDate || null, filters.endDate || null),
        fetchCategoryRatio(filters.startDate || null, filters.endDate || null),
        getTotalAvailableAmount().catch(() => ({ success: false, data: null }))
      ]);

      if (statsRes.success) {
        setDashboardStats(statsRes.data);
      }
      if (trendRes.success) {
        setMonthlyTrend(trendRes.data || []);
      }
      if (statusRes.success) {
        setStatusStats(statusRes.data || []);
      }
      if (categoryRes.success) {
        setCategoryRatio(categoryRes.data || []);
      }
      if (creditRes.success && creditRes.data) {
        setTotalCredit(creditRes.data.totalAmount || 0);
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      alert(error?.response?.data?.message || '대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, filters.startDate, filters.endDate]);

  // 필터 자동 적용 (debounce)
  useEffect(() => {
    if (!isAuthorized) return;
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      loadDashboardData();
    }, 500);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [isAuthorized, loadDashboardData]);

  // 초기 로드
  useEffect(() => {
    if (isAuthorized) {
      loadDashboardData();
      loadSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthorized]);

  const loadSubscription = async () => {
    try {
      const res = await getCurrentSubscription().catch(() => ({ success: false, data: null }));
      if (res.success && res.data) {
        setSubscription(res.data);
      }
    } catch (err) {
      console.error('구독 정보 로드 실패:', err);
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

  if (!isAuthorized) {
    return (
      <S.Container>
        <S.Alert>접근 권한이 없습니다. (CEO, ADMIN 또는 ACCOUNTANT 권한 필요)</S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  // 상태별 통계 차트 데이터 준비 (useMemo로 메모이제이션)
  const statusChartData = useMemo(() => 
    statusStats.map(item => ({
      name: STATUS_KOREAN[item.status] || item.status,
      건수: item.count,
      금액: item.totalAmount
    })),
    [statusStats]
  );

  // 카테고리별 비율 차트 데이터 준비 (useMemo로 메모이제이션)
  const categoryChartData = useMemo(() => 
    categoryRatio.map(item => ({
      name: item.category,
      value: item.amount,
      ratio: (item.ratio * 100).toFixed(1)
    })),
    [categoryRatio]
  );

  return (
    <S.Container>
      <S.Header data-tourid="tour-dashboard-header">
        <div>
          <S.Title>대시보드</S.Title>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <TourButton />
          <S.Button variant="secondary" onClick={() => navigate('/expenses')}>
            목록으로
          </S.Button>
        </div>
      </S.Header>

      {/* 크레딧 카드 */}
      {totalCredit > 0 && (
        <S.CreditCard onClick={() => navigate('/credits')}>
          <S.CreditCardHeader>
            <S.CreditCardTitle>사용 가능한 크레딧</S.CreditCardTitle>
          </S.CreditCardHeader>
          <S.CreditAmount>{totalCredit.toLocaleString()}원</S.CreditAmount>
          <S.CreditCardFooter>크레딧 내역 보기 →</S.CreditCardFooter>
        </S.CreditCard>
      )}

      {/* 구독 상태 카드 */}
      {subscription && (() => {
        const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let daysLeft = null;
        if (endDate) {
          endDate.setHours(0, 0, 0, 0);
          daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        }
        
        return (
          <S.SubscriptionCard 
            data-tourid="tour-subscription-card"
            warning={daysLeft !== null && daysLeft <= 7 && daysLeft >= 0}
            danger={daysLeft !== null && daysLeft < 0}
            onClick={() => navigate('/subscriptions/manage')}
          >
            <S.SubscriptionCardHeader>
              <S.SubscriptionCardTitle>구독 상태</S.SubscriptionCardTitle>
              {subscription.status === 'ACTIVE' && (
                <S.SubscriptionStatusBadge status={subscription.status}>활성</S.SubscriptionStatusBadge>
              )}
            </S.SubscriptionCardHeader>
            <S.SubscriptionPlanName>{subscription.plan?.planName || '알 수 없음'} 플랜</S.SubscriptionPlanName>
            {subscription.endDate && (
              <S.SubscriptionExpiry>
                <S.SubscriptionExpiryLabel>만료일:</S.SubscriptionExpiryLabel>
                <S.SubscriptionExpiryDate>{subscription.endDate}</S.SubscriptionExpiryDate>
                {daysLeft !== null && (
                  <>
                    {daysLeft < 0 && (
                      <S.SubscriptionExpiryWarning danger>⚠️ 만료됨</S.SubscriptionExpiryWarning>
                    )}
                    {daysLeft >= 0 && daysLeft <= 7 && (
                      <S.SubscriptionExpiryWarning>⚠️ {daysLeft}일 남음</S.SubscriptionExpiryWarning>
                    )}
                    {daysLeft > 7 && daysLeft <= 30 && (
                      <S.SubscriptionExpiryInfo>{daysLeft}일 남음</S.SubscriptionExpiryInfo>
                    )}
                  </>
                )}
              </S.SubscriptionExpiry>
            )}
            <S.SubscriptionCardFooter>구독 관리로 이동 →</S.SubscriptionCardFooter>
          </S.SubscriptionCard>
        );
      })()}

      {/* 관리 메뉴 섹션 */}
      {(user?.role === 'ADMIN' || user?.role === 'CEO' || user?.role === 'ACCOUNTANT') && (
        <S.ManagementSection>
          <S.SectionTitle>관리 메뉴</S.SectionTitle>
          <S.ManagementGrid>
            {(user?.role === 'ADMIN' || user?.role === 'CEO') && (
              <>
                <S.ManagementCard onClick={() => navigate('/budget')}>
                  <S.ManagementIcon>💰</S.ManagementIcon>
                  <S.ManagementTitle>예산 관리</S.ManagementTitle>
                  <S.ManagementDesc>연간/월간 예산 설정 및 모니터링</S.ManagementDesc>
                </S.ManagementCard>
                <S.ManagementCard onClick={() => navigate('/audit-rules')}>
                  <S.ManagementIcon>🛡️</S.ManagementIcon>
                  <S.ManagementTitle>감사 규칙</S.ManagementTitle>
                  <S.ManagementDesc>자동 감사 규칙 설정 및 관리</S.ManagementDesc>
                </S.ManagementCard>
                <S.ManagementCard onClick={() => navigate('/account-codes')}>
                  <S.ManagementIcon>📊</S.ManagementIcon>
                  <S.ManagementTitle>계정 과목 매핑</S.ManagementTitle>
                  <S.ManagementDesc>카테고리별 계정 과목 자동 분류 설정</S.ManagementDesc>
                </S.ManagementCard>
                <S.ManagementCard onClick={() => navigate('/monthly-closing')}>
                  <S.ManagementIcon>📅</S.ManagementIcon>
                  <S.ManagementTitle>월 마감 관리</S.ManagementTitle>
                  <S.ManagementDesc>회계 월 마감 처리 및 관리</S.ManagementDesc>
                </S.ManagementCard>
              </>
            )}
            <S.ManagementCard onClick={() => navigate('/audit-logs')}>
              <S.ManagementIcon>📋</S.ManagementIcon>
              <S.ManagementTitle>감사 로그</S.ManagementTitle>
              <S.ManagementDesc>자동 감사로 탐지된 이슈 확인</S.ManagementDesc>
            </S.ManagementCard>
            {user?.role === 'ACCOUNTANT' && (
              <S.ManagementCard onClick={() => navigate('/missing-receipts')}>
                <S.ManagementIcon>⚠️</S.ManagementIcon>
                <S.ManagementTitle>증빙 누락 관리</S.ManagementTitle>
                <S.ManagementDesc>영수증 미제출 건 조회 및 관리</S.ManagementDesc>
              </S.ManagementCard>
            )}
          </S.ManagementGrid>
        </S.ManagementSection>
      )}

      <S.FilterCard data-tourid="tour-date-filter">
        <S.FilterGrid>
          <div>
            <S.Label>시작일</S.Label>
            <S.Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <S.Label>종료일</S.Label>
            <S.Input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </S.FilterGrid>
      </S.FilterCard>

      {loading ? (
        <LoadingOverlay fullScreen={false} message="데이터를 불러오는 중..." />
      ) : (
        <>
          {/* 요약 카드 */}
          {dashboardStats && (
            <S.StatsGrid data-tourid="tour-stats-grid">
              <S.StatCard>
                <S.StatLabel>총 금액</S.StatLabel>
                <S.StatValue>{dashboardStats.totalAmount?.toLocaleString()}원</S.StatValue>
              </S.StatCard>
              <S.StatCard>
                <S.StatLabel>총 건수</S.StatLabel>
                <S.StatValue>{dashboardStats.totalCount?.toLocaleString()}건</S.StatValue>
              </S.StatCard>
              <S.StatCard>
                <S.StatLabel>평균 금액</S.StatLabel>
                <S.StatValue>{Math.round(dashboardStats.averageAmount || 0).toLocaleString()}원</S.StatValue>
              </S.StatCard>
              <S.StatCard>
                <S.StatLabel>진행 중 건수</S.StatLabel>
                <S.StatValue>{dashboardStats.pendingCount?.toLocaleString()}건</S.StatValue>
              </S.StatCard>
            </S.StatsGrid>
          )}

          {/* 차트 그리드 */}
          <S.ChartsGrid data-tourid="tour-charts">
            {/* 월별 지출 추이 */}
            <S.ChartCard>
              <S.ChartTitle>월별 지출 추이</S.ChartTitle>
              <S.ChartContainer>
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="yearMonth" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => value.toLocaleString()}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalAmount" 
                        stroke="#8884d8" 
                        name="금액"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#82ca9d" 
                        name="건수"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <S.Empty>데이터가 없습니다.</S.Empty>
                )}
              </S.ChartContainer>
            </S.ChartCard>

            {/* 상태별 통계 */}
            <S.ChartCard>
              <S.ChartTitle>상태별 통계</S.ChartTitle>
              <S.ChartContainer>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="건수" fill="#8884d8" name="건수" />
                      <Bar yAxisId="right" dataKey="금액" fill="#82ca9d" name="금액" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <S.Empty>데이터가 없습니다.</S.Empty>
                )}
              </S.ChartContainer>
            </S.ChartCard>

            {/* 카테고리별 비율 */}
            <S.ChartCard>
              <S.ChartTitle>카테고리별 비율</S.ChartTitle>
              <S.ChartContainer>
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, ratio }) => `${name}: ${ratio}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => value.toLocaleString() + '원'}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <S.Empty>데이터가 없습니다.</S.Empty>
                )}
              </S.ChartContainer>
            </S.ChartCard>
          </S.ChartsGrid>
        </>
      )}
    </S.Container>
  );
};

export default DashboardPage;

