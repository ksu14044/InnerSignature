import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchTaxStatus,
  fetchTaxPendingReports,
  fetchCategorySummary,
  fetchMonthlyTaxSummary,
  downloadTaxReviewList
} from '../../api/expenseApi';
import * as S from './style';

const TaxAccountantDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [taxStatus, setTaxStatus] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);
  const [summary, setSummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

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

  return (
    <>
      <S.SectionTitle>세무 처리 현황</S.SectionTitle>

      {/* 세무 처리 대기 건 */}
      {pendingReports.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>⚠️ 세무 처리 대기: {pendingReports.length}건</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/tax/summary')}>
            세무 요약 페이지로 이동 →
          </S.AlertButton>
        </S.AlertSection>
      )}

      {/* 통계 카드 */}
      {taxStatus && (
        <S.StatsGrid>
          <S.StatCard>
            <S.StatLabel>처리 완료</S.StatLabel>
            <S.StatValue>{taxStatus.processedCount || 0}건</S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>처리 대기</S.StatLabel>
            <S.StatValue>{taxStatus.pendingCount || 0}건</S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>처리 완료율</S.StatLabel>
            <S.StatValue>
              {taxStatus.totalCount > 0 
                ? Math.round((taxStatus.processedCount / taxStatus.totalCount) * 100) 
                : 0}%
            </S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>총 금액</S.StatLabel>
            <S.StatValue>{totalStats.totalAmount.toLocaleString()}원</S.StatValue>
          </S.StatCard>
        </S.StatsGrid>
      )}

      {/* 카테고리별 세무 집계 */}
      {summary.length > 0 && (
        <S.SummarySection>
          <S.SectionTitle>카테고리별 세무 집계</S.SectionTitle>
          <S.SummaryTable>
            <thead>
              <tr>
                <th>카테고리</th>
                <th>금액</th>
                <th>건수</th>
              </tr>
            </thead>
            <tbody>
              {summary.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  <td>{item.category || '-'}</td>
                  <td>{item.totalAmount?.toLocaleString() || 0}원</td>
                  <td>{item.reportCount || 0}건</td>
                </tr>
              ))}
            </tbody>
          </S.SummaryTable>
          {summary.length > 10 && (
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
            <S.ManagementTitle>세무 요약</S.ManagementTitle>
            <S.ManagementDesc>상세한 세무 처리 현황 및 자료 수집</S.ManagementDesc>
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

export default TaxAccountantDashboardSection;


