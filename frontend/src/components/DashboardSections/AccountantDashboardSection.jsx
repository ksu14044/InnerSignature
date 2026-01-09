import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchDashboardStats, 
  fetchMonthlyTrend, 
  fetchStatusStats, 
  fetchCategoryRatio,
  fetchPendingApprovals,
  fetchExpenseList,
  downloadTaxReviewList
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
import { useIsMobile } from '../../hooks/useMediaQuery';
import * as S from './style';

// Lazy load 모바일 컴포넌트
const MobileAccountantDashboard = lazy(() => import('../mobile/MobileAccountantDashboard'));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AccountantDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // 세무 검토 자료 다운로드 핸들러
  const handleExportTaxReview = async (format = 'full') => {
    try {
      setLoading(true);
      await downloadTaxReviewList(filters.startDate, filters.endDate, format);
      alert('세무 검토 자료 다운로드가 완료되었습니다.');
    } catch (error) {
      alert(error.userMessage || '세무 검토 자료 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
        <MobileAccountantDashboard
          dashboardStats={dashboardStats}
          statusStats={statusStats}
          categoryRatio={categoryRatio}
          pendingApprovals={pendingApprovals}
          approvedExpenses={approvedExpenses}
        />
      </Suspense>
    );
  }

  // 데스크톱 버전
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

      {/* 세무 검토 자료 다운로드 */}
      <S.ManagementSection>
        <S.SectionTitle>세무 검토 자료</S.SectionTitle>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ marginBottom: '15px', color: '#666' }}>
            증빙 및 부가세 검토용 리스트를 다운로드합니다. 더존/위하고 연동을 위한 보조 자료로 활용하세요.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleExportTaxReview('full')}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              📥 전체 상세 (5 Sheets)
            </button>
            <button
              onClick={() => handleExportTaxReview('simple')}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#43a047',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              📄 간단 요약
            </button>
            <button
              onClick={() => handleExportTaxReview('import')}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f57c00',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              🔄 더존 Import용
            </button>
          </div>
          <div style={{ marginTop: '15px', fontSize: '13px', color: '#999' }}>
            ✓ 전체 상세: 증빙 내역, 누락 체크리스트, 부가세 검토, 카테고리 집계, 더존 Import (5개 시트)<br />
            ✓ 간단 요약: 증빙 내역 + 카테고리 집계 (2개 시트)<br />
            ✓ 더존 Import: 더존/위하고에 바로 import 가능한 형식 (1개 시트)
          </div>
        </div>
      </S.ManagementSection>
    </>
  );
};

export default AccountantDashboardSection;

