import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMonthlyTrend } from '../../api/expenseApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import * as S from './style';

const MonthlyTrendChart = ({ filters = null }) => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const loadMonthlyData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetchMonthlyTrend(null, null);
      if (response.success) {
        const transformedData = (response.data || []).map(item => ({
          name: item.yearMonth,
          amount: item.totalAmount
        }));
        setMonthlyData(transformedData);
      }
    } catch (error) {
      console.error('월별 지출 추이 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      loadMonthlyData();
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [loadMonthlyData]);

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  if (monthlyData.length === 0) return null;

  return (
    <S.ChartCard>
      <S.ChartTitle title="월별 지출 추이">월별 지출 추이</S.ChartTitle>
      <S.ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => value?.toLocaleString?.() ?? value}
              width={80}
              allowDecimals={false}
            />
            <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </S.ChartContainer>
    </S.ChartCard>
  );
};

export default MonthlyTrendChart;

