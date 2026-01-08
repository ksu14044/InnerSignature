import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchTaxStatus,
  fetchTaxPendingReports,
  fetchCategorySummary,
  fetchMonthlyTaxSummary,
  collectTaxData
} from '../../api/expenseApi';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileTaxAccountantDashboard from '../mobile/MobileTaxAccountantDashboard';
import * as S from './style';

const TaxAccountantDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [taxStatus, setTaxStatus] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);
  const [summary, setSummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  
  const [collectMode, setCollectMode] = useState('date'); // 'date' 또는 'month'
  const [monthRange, setMonthRange] = useState({
    startMonth: '',  // 'YYYY-MM' 형식
    endMonth: ''     // 'YYYY-MM' 형식
  });

  const loadTaxData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [statusRes, pendingRes, summaryRes, monthlyRes] = await Promise.all([
        fetchTaxStatus(filters.startDate || null, filters.endDate || null),
        fetchTaxPendingReports(filters.startDate || null, filters.endDate || null),
        fetchCategorySummary({
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: ['PAID'],
          taxProcessed: null,
          isSecret: null
        }),
        fetchMonthlyTaxSummary(filters.startDate || null, filters.endDate || null)
      ]);

      if (statusRes.success) {
        setTaxStatus(statusRes.data);
      }
      if (pendingRes.success) {
        setPendingReports(pendingRes.data || []);
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data || []);
      }
      if (monthlyRes.success) {
        setMonthlySummary(monthlyRes.data || []);
      }
    } catch (error) {
      console.error('세무 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 월 범위 계산 (표시용)
  const calculateMonthRange = (startMonth, endMonth) => {
    if (!startMonth || !endMonth) return '';
    
    const start = new Date(startMonth + '-01');
    const end = new Date(endMonth + '-01');
    const endLastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    
    return `${startMonth}-01 ~ ${endMonth}-${String(endLastDay).padStart(2, '0')}`;
  };

  // 기간별 자료 수집 및 전표 다운로드 핸들러 (일별)
  const handleCollectTaxData = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert('대시보드 상단에서 기간을 먼저 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 기간의 자료를 수집하시겠습니까?\n\n📅 ${filters.startDate} ~ ${filters.endDate}\n\n⚠️ 주의사항:\n- PAID 상태 결의서가 수집 처리됩니다\n- 수집 후에는 일반 사용자가 수정/삭제 불가능합니다\n- 세무사의 수정 요청이 있을 때만 수정 가능합니다`)) {
      return;
    }

    try {
      setLoading(true);
      await collectTaxData(filters.startDate, filters.endDate);
      alert('✅ 세무 자료가 수집되었고 전표가 다운로드되었습니다.');
      loadTaxData();
    } catch (error) {
      alert(error?.userMessage || error?.response?.data?.message || error?.message || '세무 자료 수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 월별 자료 수집 및 전표 다운로드 핸들러
  const handleMonthCollect = async () => {
    if (!monthRange.startMonth || !monthRange.endMonth) {
      alert('수집할 월을 선택해주세요.');
      return;
    }
    
    // YYYY-MM을 해당 월의 첫날과 마지막날로 변환
    const startDate = `${monthRange.startMonth}-01`;
    const endMonthObj = new Date(monthRange.endMonth + '-01');
    const lastDay = new Date(endMonthObj.getFullYear(), endMonthObj.getMonth() + 1, 0).getDate();
    const endDate = `${monthRange.endMonth}-${String(lastDay).padStart(2, '0')}`;
    
    if (!confirm(`선택한 기간을 수집하시겠습니까?\n\n📅 ${monthRange.startMonth} ~ ${monthRange.endMonth}\n(${startDate} ~ ${endDate})\n\n⚠️ 주의사항:\n- PAID 상태 결의서가 수집 처리됩니다\n- 수집 후에는 일반 사용자가 수정/삭제 불가능합니다\n- 세무사의 수정 요청이 있을 때만 수정 가능합니다`)) {
      return;
    }
    
    try {
      setLoading(true);
      await collectTaxData(startDate, endDate);
      alert('✅ 세무 자료가 수집되었고 전표가 다운로드되었습니다.');
      loadTaxData();
    } catch (error) {
      alert(error?.userMessage || error?.response?.data?.message || error?.message || '세무 자료 수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      loadTaxData();
    }, 500);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    loadTaxData();
  }, [user]);

  const totalStats = useMemo(() => {
    if (!summary || summary.length === 0) {
      return { totalAmount: 0, totalItemCount: 0, totalReportCount: 0 };
    }
    return summary.reduce((acc, row) => ({
      totalAmount: acc.totalAmount + (row.totalAmount || 0),
      totalItemCount: acc.totalItemCount + (row.itemCount || 0),
      totalReportCount: acc.totalReportCount + (row.reportCount || 0)
    }), { totalAmount: 0, totalItemCount: 0, totalReportCount: 0 });
  }, [summary]);

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  // 모바일 버전 렌더링
  if (isMobile) {
    return (
      <MobileTaxAccountantDashboard
        taxStatus={taxStatus}
        pendingReports={pendingReports}
        summary={summary}
      />
    );
  }

  // 데스크톱 버전
  return (
    <>
      <S.SectionTitle>세무 자료 현황</S.SectionTitle>

      {/* 미수집 결의서 알림 */}
      {pendingReports.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>📋 미수집 결의서: {pendingReports.length}건</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/tax/summary')}>
            상세 페이지로 이동 →
          </S.AlertButton>
        </S.AlertSection>
      )}

      {/* 통계 카드 */}
      {taxStatus && (
        <S.StatsGrid>
          <S.StatCard>
            <S.StatLabel>PAID 상태 결의서</S.StatLabel>
            <S.StatValue>{taxStatus.totalCount || 0}건</S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>미수집</S.StatLabel>
            <S.StatValue style={{ color: '#dc3545' }}>{taxStatus.pendingCount || 0}건</S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>수집 완료</S.StatLabel>
            <S.StatValue style={{ color: '#28a745' }}>{taxStatus.completedCount || 0}건</S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>총 금액</S.StatLabel>
            <S.StatValue>{totalStats.totalAmount.toLocaleString()}원</S.StatValue>
          </S.StatCard>
        </S.StatsGrid>
      )}

      {/* 주요 카테고리 Top 5 */}
      {summary.length > 0 && (
        <S.SummarySection>
          <S.SectionTitle>주요 카테고리 (Top 5)</S.SectionTitle>
          <S.SummaryTable>
            <thead>
              <tr>
                <th>카테고리</th>
                <th>금액</th>
                <th>건수</th>
              </tr>
            </thead>
            <tbody>
              {summary.slice(0, 5).map((item, index) => (
                <tr key={index}>
                  <td>{item.category || '-'}</td>
                  <td>{item.totalAmount?.toLocaleString() || 0}원</td>
                  <td>{item.reportCount || 0}건</td>
                </tr>
              ))}
            </tbody>
          </S.SummaryTable>
          {summary.length > 5 && (
            <S.ViewMoreButton onClick={() => navigate('/tax/summary')}>
              전체 보기 ({summary.length}개 카테고리)
            </S.ViewMoreButton>
          )}
        </S.SummarySection>
      )}

      {/* 빠른 액션 */}
      <S.ManagementSection>
        <S.SectionTitle>빠른 액션</S.SectionTitle>
        <S.ManagementGrid>
          <S.ManagementCard onClick={() => navigate('/tax/summary')}>
            <S.ManagementIcon>📊</S.ManagementIcon>
            <S.ManagementTitle>상세 분석</S.ManagementTitle>
            <S.ManagementDesc>결의서 목록, 카테고리/월별 집계</S.ManagementDesc>
          </S.ManagementCard>
        </S.ManagementGrid>
      </S.ManagementSection>

      {/* 자료 수집 및 전표 다운로드 */}
      <S.ManagementSection>
        <S.SectionTitle>기간별 자료 수집</S.SectionTitle>
        <div style={{ padding: '20px', backgroundColor: '#fff9e6', borderRadius: '8px', border: '2px solid #ffc107' }}>
          <div style={{ marginBottom: '15px', color: '#e65100', fontWeight: '500' }}>
            ⚠️ 선택한 기간의 PAID 결의서를 수집하고 세무 전표를 다운로드합니다.
            <br />수집된 자료는 DB에 기록되며, 일반 사용자는 수정/삭제할 수 없습니다.
          </div>

          {/* 수집 모드 선택 */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="collectMode"
                value="date"
                checked={collectMode === 'date'}
                onChange={(e) => setCollectMode(e.target.value)}
                style={{ marginRight: '6px' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>📆 일별 수집</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="collectMode"
                value="month"
                checked={collectMode === 'month'}
                onChange={(e) => setCollectMode(e.target.value)}
                style={{ marginRight: '6px' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>📅 월별 수집</span>
            </label>
          </div>

          {/* 일별 수집 모드 */}
          {collectMode === 'date' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCollectTaxData}
                  disabled={!filters.startDate || !filters.endDate || loading}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: '#ff6f00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (!filters.startDate || !filters.endDate || loading) ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    opacity: (!filters.startDate || !filters.endDate || loading) ? 0.5 : 1,
                  }}
                >
                  {loading ? '처리 중...' : '📥 일별 자료 수집 및 전표 다운로드'}
                </button>
                {(!filters.startDate || !filters.endDate) && (
                  <span style={{ color: '#d32f2f', fontSize: '13px' }}>
                    ※ 대시보드 상단에서 기간을 선택해주세요
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 월별 수집 모드 */}
          {collectMode === 'month' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                    수집 시작월
                  </label>
                  <input
                    type="month"
                    value={monthRange.startMonth}
                    onChange={(e) => setMonthRange(prev => ({ ...prev, startMonth: e.target.value }))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                    수집 종료월
                  </label>
                  <input
                    type="month"
                    value={monthRange.endMonth}
                    min={monthRange.startMonth || undefined}
                    onChange={(e) => setMonthRange(prev => ({ ...prev, endMonth: e.target.value }))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleMonthCollect}
                  disabled={!monthRange.startMonth || !monthRange.endMonth || loading}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: '#ff6f00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (!monthRange.startMonth || !monthRange.endMonth || loading) ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    opacity: (!monthRange.startMonth || !monthRange.endMonth || loading) ? 0.5 : 1,
                  }}
                >
                  {loading ? '처리 중...' : '📅 월별 자료 수집 및 전표 다운로드'}
                </button>
              </div>
              {monthRange.startMonth && monthRange.endMonth && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#1976d2' }}>
                  ✓ {monthRange.startMonth} ~ {monthRange.endMonth} 
                  {' '}({calculateMonthRange(monthRange.startMonth, monthRange.endMonth)})
                </div>
              )}
              {(!monthRange.startMonth || !monthRange.endMonth) && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#d32f2f' }}>
                  ※ 수집할 시작월과 종료월을 선택해주세요 (예: 2024-01 ~ 2024-03)
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px', color: '#1565c0' }}>
            💡 월별 수집 시: 1월~3월처럼 연속된 여러 달을 한번에 수집 가능
          </div>
        </div>
      </S.ManagementSection>

    </>
  );
};

export default TaxAccountantDashboardSection;


