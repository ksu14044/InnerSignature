import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchDashboardStats, 
  fetchMonthlyTrend, 
  fetchStatusStats, 
  fetchCategoryRatio
} from '../../api/expenseApi';
import { getPendingUsers } from '../../api/userApi';
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
import { useIsMobile } from '../../hooks/useMediaQuery';
import * as S from './style';

// Lazy load 모바일 컴포넌트
const MobileCEODashboard = lazy(() => import('../mobile/MobileCEODashboard'));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CEODashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [categoryRatio, setCategoryRatio] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [statsRes, trendRes, statusRes, categoryRes, usersRes] = await Promise.all([
        fetchDashboardStats(filters.startDate || null, filters.endDate || null),
        fetchMonthlyTrend(filters.startDate || null, filters.endDate || null),
        fetchStatusStats(filters.startDate || null, filters.endDate || null),
        fetchCategoryRatio(filters.startDate || null, filters.endDate || null),
        getPendingUsers().catch(() => ({ success: false, data: [] }))
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
      if (usersRes.success) {
        setPendingUsers(usersRes.data || []);
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters.startDate, filters.endDate]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // 디바운스 딜레이 300ms로 단축
    debounceTimer.current = setTimeout(() => {
      loadDashboardData();
    }, 300);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [loadDashboardData]);

  // useMemo로 차트 데이터 메모이제이션
  const statusChartData = useMemo(() => 
    statusStats.map(item => ({
      name: STATUS_KOREAN[item.status] || item.status,
      건수: item.count,
      금액: item.totalAmount
    })),
    [statusStats]
  );

  const categoryChartData = useMemo(() => 
    categoryRatio.map(item => ({
      name: item.category,
      value: item.amount,
      ratio: (item.ratio * 100).toFixed(1)
    })),
    [categoryRatio]
  );

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  // 모바일 버전 렌더링 (Suspense로 래핑)
  if (isMobile) {
    return (
      <Suspense fallback={<S.LoadingMessage>로딩 중...</S.LoadingMessage>}>
        <MobileCEODashboard
          dashboardStats={dashboardStats}
          statusStats={statusStats}
          categoryRatio={categoryRatio}
          pendingUsers={pendingUsers}
          monthlyTrend={monthlyTrend}
        />
      </Suspense>
    );
  }

  // 데스크톱 버전
  return (
    <>
      {/* 승인 대기 사용자 */}
      {pendingUsers.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>👥 승인 대기 사용자: {pendingUsers.length}명</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/users')}>
            사용자 관리로 이동 →
          </S.AlertButton>
        </S.AlertSection>
      )}


      {/* 차트 */}
      <S.ChartsGrid>
        {monthlyTrend.length > 0 && (
          <S.ChartCard>
            <S.ChartTitle>월별 지출 추이</S.ChartTitle>
            <S.ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="yearMonth" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" name="금액" strokeWidth={2} />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" name="건수" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </S.ChartContainer>
          </S.ChartCard>
        )}

        {categoryChartData.length > 0 && (
          <S.ChartCard>
            <S.ChartTitle>카테고리별 비중</S.ChartTitle>
            <S.ChartContainer>
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
                  <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                </PieChart>
              </ResponsiveContainer>
            </S.ChartContainer>
          </S.ChartCard>
        )}

        {statusChartData.length > 0 && (
          <S.ChartCard>
            <S.ChartTitle>상태별 통계</S.ChartTitle>
            <S.ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="건수" fill="#82ca9d" name="건수" />
                  <Bar yAxisId="right" dataKey="금액" fill="#8884d8" name="금액" />
                </BarChart>
              </ResponsiveContainer>
            </S.ChartContainer>
          </S.ChartCard>
        )}
      </S.ChartsGrid>

      {/* 관리 기능 */}
      <S.ManagementSection>
        <S.SectionTitle>관리 기능</S.SectionTitle>
        <S.ManagementGrid>
          <S.ManagementCard onClick={() => navigate('/users')}>
            <S.ManagementIcon>👥</S.ManagementIcon>
            <S.ManagementTitle>사용자 관리</S.ManagementTitle>
            <S.ManagementDesc>회사 소속 사용자 관리 및 승인</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/subscriptions/manage')}>
            <S.ManagementIcon>💳</S.ManagementIcon>
            <S.ManagementTitle>구독 관리</S.ManagementTitle>
            <S.ManagementDesc>구독 및 크레딧 현황 관리</S.ManagementDesc>
          </S.ManagementCard>
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
        </S.ManagementGrid>
      </S.ManagementSection>
    </>
  );
};

export default CEODashboardSection;

