import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchUserExpenseStats,
  fetchCategoryRatio
} from '../../api/expenseApi';
import * as S from './style';

// 차트 타입별 설정
const CHART_CONFIGS = {
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
  const { user } = useAuth();

  const [chartDatas, setChartDatas] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const debounceTimer = useRef(null);

  // 데이터 변환
  const transformedChartDatas = useMemo(() => {
    const result = {};
    chartTypes.forEach(type => {
      const data = chartDatas[type] || [];
      if (data.length > 0) {
        switch (type) {
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


  // API 호출 함수들
  const getChartData = useCallback(async (chartType, startDate, endDate) => {
    switch (chartType) {
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

      const promises = [];

      // 각 차트 타입별로 API 호출
      chartTypes.forEach(type => {
        promises.push(getChartData(type, filters?.startDate || null, filters?.endDate || null));
      });

      if (showCategoryChart) {
        promises.push(fetchCategoryRatio(filters?.startDate || null, filters?.endDate || null));
      }


      const results = await Promise.all(promises);
      const chartResults = results.slice(0, chartTypes.length);
      const otherRes = results.slice(chartTypes.length);

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

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters, chartTypes, showCategoryChart, getChartData]);

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

  // 표 렌더링 (데스크톱 및 모바일 공통)
  const renderTables = () => (
    <S.ChartsGrid>
      {/* 각 차트 타입별 표 렌더링 */}
      {chartTypes.map(type => {
        const chartData = transformedChartDatas[type];
        if (!chartData || chartData.length === 0) return null;

        const config = CHART_CONFIGS[type];
        return (
          <S.ChartCard key={type}>
            <S.ChartTitle title={config.title}>{config.title}</S.ChartTitle>
            <S.SummaryTable style={{ marginTop: '0' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>사용자</th>
                  <th style={{ textAlign: 'center' }}>금액</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'center' }} title={item.name}>{item.name}</td>
                    <td style={{ fontWeight: '600', color: '#007bff', textAlign: 'center' }}>
                      {item.amount?.toLocaleString() || 0}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </S.SummaryTable>
          </S.ChartCard>
        );
      })}
    </S.ChartsGrid>
  );

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  return (
    <>
      {/* 필터 UI는 추후 추가 가능 */}
      {renderTables()}
    </>
  );
};

export default CommonDashboardSection;
