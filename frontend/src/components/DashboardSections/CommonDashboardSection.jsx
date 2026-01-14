import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchDashboardStats,
  fetchMonthlyTrend,
  fetchUserExpenseStats,
  fetchCategoryRatio
} from '../../api/expenseApi';
import { getPendingUsers } from '../../api/userApi';
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

// 차트 타입별 설정
const CHART_CONFIGS = {
  monthly: {
    title: '월별 지출 추이',
    dataKey: 'amount',
    color: '#8884d8'
  },
  user: {
    title: '사용자별 지출 합계',
    dataKey: 'amount',
    color: '#8884d8'
  },
  category: {
    title: '카테고리별 비율',
    dataKey: 'amount',
    color: '#82ca9d'
  }
};

// 데이터 변환 함수들
const transformMonthlyData = (data) => data.map(item => ({
  name: item.yearMonth,
  amount: item.totalAmount
}));

const transformUserData = (data) => data
  .filter(item => item.totalAmount > 0) // 지출 내역이 있는 사용자만 필터링
  .map(item => ({
    name: item.userName,
    amount: item.totalAmount
  }));

const transformCategoryData = (data) => data.map(item => ({
  name: item.category,
  amount: item.amount,
  ratio: item.ratio
}));

const CommonDashboardSection = ({
  chartTypes = ['user'], // Array of 'monthly' | 'user' | 'category'
  showCategoryChart = true,
  showPendingUsers = true,
  filters = null // 부모로부터 전달받은 필터 (null이면 전체 데이터)
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboardStats, setDashboardStats] = useState({});
  const [chartDatas, setChartDatas] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const debounceTimer = useRef(null);

  // 데이터 변환
  const transformedChartDatas = useMemo(() => {
    const result = {};
    chartTypes.forEach(type => {
      const data = chartDatas[type] || [];
      if (data.length > 0) {
        switch (type) {
          case 'monthly':
            result[type] = transformMonthlyData(data);
            break;
          case 'user':
            result[type] = transformUserData(data);
            break;
          case 'category':
            result[type] = transformCategoryData(data);
            break;
        }
      }
    });
    return result;
  }, [chartDatas, chartTypes]);

  const transformedCategoryData = useMemo(() =>
    categoryData.map(item => ({
      name: item.category,
      value: item.amount,
      ratio: (item.ratio * 100).toFixed(1)
    })),
    [categoryData]
  );

  // API 호출 함수들
  const getChartData = useCallback(async (chartType, startDate, endDate) => {
    switch (chartType) {
      case 'monthly':
        return await fetchMonthlyTrend(null, null); // 월별 추이는 전체 기간 데이터로 유지
      case 'user':
        return await fetchUserExpenseStats(startDate, endDate);
      case 'category':
        return await fetchCategoryRatio(startDate, endDate);
      default:
        return { success: false, data: [] };
    }
  }, []);

  // 데이터 로드
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const promises = [
        fetchDashboardStats(filters?.startDate || null, filters?.endDate || null)
      ];

      // 각 차트 타입별로 API 호출
      chartTypes.forEach(type => {
        promises.push(getChartData(type, filters?.startDate || null, filters?.endDate || null));
      });

      if (showCategoryChart) {
        promises.push(fetchCategoryRatio(filters?.startDate || null, filters?.endDate || null));
      }

      if (showPendingUsers) {
        promises.push(getPendingUsers().catch(() => ({ success: false, data: [] })));
      }

      const results = await Promise.all(promises);
      const statsRes = results[0];
      const chartResults = results.slice(1, 1 + chartTypes.length);
      const otherRes = results.slice(1 + chartTypes.length);

      if (statsRes.success) {
        setDashboardStats(statsRes.data);
      }

      // 차트 데이터 설정
      const newChartDatas = {};
      chartTypes.forEach((type, index) => {
        if (chartResults[index]?.success) {
          newChartDatas[type] = chartResults[index].data || [];
        }
      });
      setChartDatas(newChartDatas);

      if (showCategoryChart && otherRes[0]?.success) {
        setCategoryData(otherRes[0].data || []);
      }

      if (showPendingUsers && otherRes[showCategoryChart ? 1 : 0]?.success) {
        const usersRes = otherRes[showCategoryChart ? 1 : 0];
        setPendingUsers(usersRes.data || []);
      }

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters, chartTypes, showCategoryChart, showPendingUsers, getChartData]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // 디바운스된 데이터 로드
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      loadDashboardData();
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [loadDashboardData]);

  // 차트 렌더링 (데스크톱 및 모바일 공통)
  const renderCharts = () => (
    <S.ChartsGrid>
      {/* 각 차트 타입별 렌더링 */}
      {chartTypes.map(type => {
        const chartData = transformedChartDatas[type];
        if (!chartData || chartData.length === 0) return null;

        const config = CHART_CONFIGS[type];
        return (
          <S.ChartCard key={type}>
            <S.ChartTitle>{config.title}</S.ChartTitle>
            <S.ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => value?.toLocaleString?.() ?? value} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                  <Bar dataKey="amount" fill={config.color} />
                </BarChart>
              </ResponsiveContainer>
            </S.ChartContainer>
          </S.ChartCard>
        );
      })}

      {/* 카테고리 차트 */}
      {showCategoryChart && transformedCategoryData.length > 0 && (
        <S.ChartCard>
          <S.ChartTitle>카테고리별 비율</S.ChartTitle>
          <S.ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transformedCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, ratio }) => `${name} ${ratio}%`}
                >
                  {transformedCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
              </PieChart>
            </ResponsiveContainer>
          </S.ChartContainer>
        </S.ChartCard>
      )}
    </S.ChartsGrid>
  );

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  return (
    <>
      {/* 필터 UI는 추후 추가 가능 */}
      {renderCharts()}

      {/* 대시보드 통계 카드들 */}
      <S.StatsGrid>
        <S.StatCard>
          <S.StatValue>{dashboardStats.totalCount || 0}</S.StatValue>
          <S.StatLabel>총 결의서</S.StatLabel>
        </S.StatCard>
        <S.StatCard>
          <S.StatValue>{dashboardStats.totalAmount?.toLocaleString() || 0}원</S.StatValue>
          <S.StatLabel>총 금액</S.StatLabel>
        </S.StatCard>
        <S.StatCard>
          <S.StatValue>{dashboardStats.averageAmount?.toLocaleString() || 0}원</S.StatValue>
          <S.StatLabel>평균 금액</S.StatLabel>
        </S.StatCard>
      </S.StatsGrid>
    </>
  );
};

export default CommonDashboardSection;
