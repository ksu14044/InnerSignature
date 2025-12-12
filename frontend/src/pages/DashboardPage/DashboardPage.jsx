import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchDashboardStats, 
  fetchMonthlyTrend, 
  fetchStatusStats, 
  fetchCategoryRatio 
} from '../../api/expenseApi';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [categoryRatio, setCategoryRatio] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const isAuthorized = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';

  const loadDashboardData = async () => {
    if (!isAuthorized) return;

    try {
      setLoading(true);
      
      const [statsRes, trendRes, statusRes, categoryRes] = await Promise.all([
        fetchDashboardStats(filters.startDate || null, filters.endDate || null),
        fetchMonthlyTrend(filters.startDate || null, filters.endDate || null),
        fetchStatusStats(filters.startDate || null, filters.endDate || null),
        fetchCategoryRatio(filters.startDate || null, filters.endDate || null)
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
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      alert(error?.response?.data?.message || '대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, isAuthorized]);

  // 초기 로드
  useEffect(() => {
    if (isAuthorized) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthorized]);

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
        <S.Alert>접근 권한이 없습니다. (ADMIN 또는 ACCOUNTANT 권한 필요)</S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  // 상태별 통계 차트 데이터 준비
  const statusChartData = statusStats.map(item => ({
    name: STATUS_KOREAN[item.status] || item.status,
    건수: item.count,
    금액: item.totalAmount
  }));

  // 카테고리별 비율 차트 데이터 준비
  const categoryChartData = categoryRatio.map(item => ({
    name: item.category,
    value: item.amount,
    ratio: (item.ratio * 100).toFixed(1)
  }));

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>대시보드</S.Title>
        </div>
        <S.Button variant="secondary" onClick={() => navigate('/expenses')}>
          목록으로
        </S.Button>
      </S.Header>

      <S.FilterCard>
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
            <S.StatsGrid>
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
          <S.ChartsGrid>
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

