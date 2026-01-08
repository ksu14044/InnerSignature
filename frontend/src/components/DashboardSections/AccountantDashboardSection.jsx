import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchDashboardStats, 
  fetchMonthlyTrend, 
  fetchStatusStats, 
  fetchCategoryRatio,
  fetchPendingApprovals,
  fetchExpenseList
} from '../../api/expenseApi';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AccountantDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [categoryRatio, setCategoryRatio] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedExpenses, setApprovedExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [statsRes, trendRes, statusRes, categoryRes, pendingRes, approvedRes] = await Promise.all([
        fetchDashboardStats(filters.startDate || null, filters.endDate || null),
        fetchMonthlyTrend(filters.startDate || null, filters.endDate || null),
        fetchStatusStats(filters.startDate || null, filters.endDate || null),
        fetchCategoryRatio(filters.startDate || null, filters.endDate || null),
        fetchPendingApprovals(user.userId).catch(() => ({ success: false, data: [] })),
        fetchExpenseList(1, 5, { status: ['APPROVED'] }).catch(() => ({ success: false, data: { content: [] } }))
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
      if (pendingRes.success) {
        setPendingApprovals(pendingRes.data || []);
      }
      if (approvedRes.success && approvedRes.data) {
        setApprovedExpenses(approvedRes.data.content || []);
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
    
    debounceTimer.current = setTimeout(() => {
      loadDashboardData();
    }, 500);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [loadDashboardData]);

  const statusChartData = statusStats.map(item => ({
    name: STATUS_KOREAN[item.status] || item.status,
    건수: item.count,
    금액: item.totalAmount
  }));

  const categoryChartData = categoryRatio.map(item => ({
    name: item.category,
    value: item.amount,
    ratio: (item.ratio * 100).toFixed(1)
  }));

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  return (
    <>
      {/* 결재 대기 현황 */}
      {pendingApprovals.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>⚠️ 결재 대기 건: {pendingApprovals.length}건</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/expenses?tab=MY_APPROVALS')}>
            결재 대기 목록 보기 →
          </S.AlertButton>
        </S.AlertSection>
      )}

      {/* 결제 대기 현황 (APPROVED 상태 문서) */}
      {approvedExpenses.length > 0 && (
        <S.AlertSection style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3' }}>
          <S.AlertTitle>💰 결제 대기 건: {approvedExpenses.length}건 이상</S.AlertTitle>
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            <div style={{ marginBottom: '8px' }}>결제 완료 처리가 필요한 문서:</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {approvedExpenses.slice(0, 5).map((expense) => (
                <div 
                  key={expense.expenseReportId} 
                  style={{ 
                    padding: '8px', 
                    marginBottom: '4px', 
                    backgroundColor: 'white', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0'
                  }}
                  onClick={() => navigate(`/expenses/${expense.expenseReportId}`)}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {expense.drafterName} - {expense.totalAmount.toLocaleString()}원
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {expense.reportDate} | {expense.firstDescription || '적요 없음'}
                  </div>
                </div>
              ))}
            </div>
            {approvedExpenses.length >= 5 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                ... 외 더 많은 문서가 있습니다
              </div>
            )}
          </div>
          <S.AlertButton 
            onClick={() => navigate('/expenses?status=APPROVED')}
            style={{ marginTop: '12px', backgroundColor: '#2196f3' }}
          >
            결제 대기 목록 전체 보기 →
          </S.AlertButton>
        </S.AlertSection>
      )}

      {/* 요약 통계 */}
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
            <S.StatLabel>진행 중 건수</S.StatLabel>
            <S.StatValue>{dashboardStats.pendingCount?.toLocaleString()}건</S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>평균 금액</S.StatLabel>
            <S.StatValue>{Math.round(dashboardStats.averageAmount || 0).toLocaleString()}원</S.StatValue>
          </S.StatCard>
        </S.StatsGrid>
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

        {categoryChartData.length > 0 && (
          <S.ChartCard>
            <S.ChartTitle>카테고리별 비율</S.ChartTitle>
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
      </S.ChartsGrid>

      {/* 빠른 액션 */}
      <S.ManagementSection>
        <S.SectionTitle>빠른 액션</S.SectionTitle>
        <S.ManagementGrid>
          <S.ManagementCard onClick={() => navigate('/missing-receipts')}>
            <S.ManagementIcon>⚠️</S.ManagementIcon>
            <S.ManagementTitle>증빙 누락 관리</S.ManagementTitle>
            <S.ManagementDesc>영수증 미제출 건 조회 및 관리</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/expenses?tab=MY_APPROVALS')}>
            <S.ManagementIcon>📋</S.ManagementIcon>
            <S.ManagementTitle>결재 대기 목록</S.ManagementTitle>
            <S.ManagementDesc>결재 대기 중인 문서 확인</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/audit-logs')}>
            <S.ManagementIcon>📊</S.ManagementIcon>
            <S.ManagementTitle>감사 로그</S.ManagementTitle>
            <S.ManagementDesc>자동 감사로 탐지된 이슈 확인</S.ManagementDesc>
          </S.ManagementCard>
        </S.ManagementGrid>
      </S.ManagementSection>
    </>
  );
};

export default AccountantDashboardSection;

