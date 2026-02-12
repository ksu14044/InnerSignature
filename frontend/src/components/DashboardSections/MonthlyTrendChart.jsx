import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMonthlyTrend } from '../../api/expenseApi';
import {
  AreaChart,
  Area,
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

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid #e4e4e4',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          <p style={{ 
            margin: '0 0 8px 0', 
            fontWeight: 600, 
            color: '#333333',
            fontSize: '14px'
          }}>
            {label}
          </p>
          <p style={{ 
            margin: 0, 
            color: '#489BFF', 
            fontWeight: 700,
            fontSize: '18px'
          }}>
            {payload[0].value.toLocaleString()}원
          </p>
        </div>
      );
    }
    return null;
  };

  // 월 포맷팅 함수 (YYYY-MM -> YYYY.MM)
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    return monthStr.replace('-', '.');
  };

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  if (monthlyData.length === 0) return null;

  return (
    <S.ChartCard>
      <S.ChartTitle title="월별 지출 추이">월별 지출 추이</S.ChartTitle>
      <S.ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={monthlyData} 
            margin={{ left: 10, right: 20, top: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#489BFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#489BFF" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e4e4e4"
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              tickFormatter={formatMonth}
              tick={{ fill: '#666666', fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif" }}
              axisLine={{ stroke: '#e4e4e4' }}
              tickLine={{ stroke: '#e4e4e4' }}
            />
            <YAxis 
              tickFormatter={(value) => {
                if (value >= 10000) {
                  return `${(value / 10000).toFixed(0)}만`;
                }
                return value.toLocaleString();
              }}
              width={60}
              allowDecimals={false}
              tick={{ fill: '#666666', fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif" }}
              axisLine={{ stroke: '#e4e4e4' }}
              tickLine={{ stroke: '#e4e4e4' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#489BFF" 
              strokeWidth={3}
              fill="url(#colorAmount)"
              dot={{ fill: '#489BFF', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#489BFF', stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </S.ChartContainer>
    </S.ChartCard>
  );
};

export default MonthlyTrendChart;

