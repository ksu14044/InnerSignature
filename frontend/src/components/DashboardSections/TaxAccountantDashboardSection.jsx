import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchTaxStatus,
  fetchTaxPendingReports,
  fetchCategorySummary,
  fetchMonthlyTaxSummary,
  collectTaxData,
  fetchExpenseList
} from '../../api/expenseApi';
import { useIsMobile } from '../../hooks/useMediaQuery';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import { FaChevronUp } from 'react-icons/fa';
import * as S from './style';
import * as MainS from '../../pages/MainDashboardPage/style';

// Lazy load 모바일 컴포넌트
const MobileTaxAccountantDashboard = lazy(() => import('../mobile/MobileTaxAccountantDashboard'));

const TaxAccountantDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [taxStatus, setTaxStatus] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);
  const [summary, setSummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('전표를 생성하는 중...');
  const debounceTimer = useRef(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    waitCount: 0,
    rejectedCount: 0,
    approvedCount: 0,
    collectedCount: 0
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusExpenses, setStatusExpenses] = useState([]);
  const [loadingStatusExpenses, setLoadingStatusExpenses] = useState(false);
  
  const [collectMode, setCollectMode] = useState('date'); // 'date' 또는 'month'
  const [monthRange, setMonthRange] = useState({
    startMonth: '',  // 'YYYY-MM' 형식
    endMonth: ''     // 'YYYY-MM' 형식
  });

  const loadTaxData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [statusRes, pendingRes, summaryRes, monthlyRes, allExpensesRes] = await Promise.all([
        fetchTaxStatus(filters.startDate || null, filters.endDate || null),
        fetchTaxPendingReports(filters.startDate || null, filters.endDate || null),
        fetchCategorySummary({
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: ['APPROVED'],
          taxProcessed: null
        }),
        fetchMonthlyTaxSummary(filters.startDate || null, filters.endDate || null),
        fetchExpenseList(1, 1000, filters).catch(() => ({ success: false, data: { content: [] } }))
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
      if (allExpensesRes.success && allExpensesRes.data) {
        const expenses = allExpensesRes.data.content || [];
        const approvedExpenses = expenses.filter(exp => exp.status === 'APPROVED');
        const collectedExpenses = expenses.filter(exp => exp.taxProcessed === true);
        setStats({
          totalAmount: approvedExpenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0),
          waitCount: expenses.filter(exp => exp.status === 'WAIT').length,
          rejectedCount: expenses.filter(exp => exp.status === 'REJECTED').length,
          approvedCount: expenses.filter(exp => exp.status === 'APPROVED').length,
          collectedCount: collectedExpenses.length
        });
      }
    } catch (error) {
      console.error('세무 데이터 로드 실패:', error?.message || String(error) || error);
    } finally {
      setLoading(false);
    }
  };

  // 통계 카드 클릭 핸들러
  const handleStatCardClick = async (status) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
      setStatusExpenses([]);
      return;
    }

    setSelectedStatus(status);
    setLoadingStatusExpenses(true);

    try {
      const filterParams = {
        ...filters,
        status: status === 'COLLECTED' ? ['APPROVED'] : [status]
      };

      const response = await fetchExpenseList(1, 100, filterParams);
      
      if (response.success && response.data) {
        let expenses = response.data.content || [];
        if (status === 'COLLECTED') {
          expenses = expenses.filter(exp => exp.taxProcessed === true);
        }
        setStatusExpenses(expenses);
      } else {
        setStatusExpenses([]);
      }
    } catch (error) {
      console.error('결의서 목록 로드 실패:', error);
      setStatusExpenses([]);
    } finally {
      setLoadingStatusExpenses(false);
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

    if (!confirm(`선택한 기간의 자료를 수집하시겠습니까?\n\n📅 ${filters.startDate} ~ ${filters.endDate}\n\n⚠️ 주의사항:\n- APPROVED 상태 결의서가 수집 처리됩니다\n- 수집 후에는 일반 사용자가 수정/삭제 불가능합니다`)) {
      return;
    }

    try {
      setLoading(true);
      setDownloadProgress(0);
      setProgressMessage('세무 자료를 수집하고 전표를 생성하는 중...');
      
      await collectTaxData(
        filters.startDate, 
        filters.endDate,
        (progress) => {
          setDownloadProgress(progress);
          if (progress < 50) {
            setProgressMessage('세무 자료를 수집하는 중...');
          } else if (progress < 90) {
            setProgressMessage('전표를 생성하는 중...');
          } else {
            setProgressMessage('전표를 다운로드하는 중...');
          }
        }
      );
      
      setDownloadProgress(100);
      setProgressMessage('완료!');
      
      setTimeout(() => {
        alert('✅ 세무 자료가 수집되었고 전표가 다운로드되었습니다.');
        setLoading(false);
        setDownloadProgress(0);
        loadTaxData();
      }, 500);
    } catch (error) {
      setLoading(false);
      setDownloadProgress(0);
      alert(error?.userMessage || error?.response?.data?.message || error?.message || '세무 자료 수집 중 오류가 발생했습니다.');
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
    
    if (!confirm(`선택한 기간을 수집하시겠습니까?\n\n📅 ${monthRange.startMonth} ~ ${monthRange.endMonth}\n(${startDate} ~ ${endDate})\n\n⚠️ 주의사항:\n- APPROVED 상태 결의서가 수집 처리됩니다\n- 수집 후에는 일반 사용자가 수정/삭제 불가능합니다`)) {
      return;
    }
    
    try {
      setLoading(true);
      setDownloadProgress(0);
      setProgressMessage('세무 자료를 수집하고 전표를 생성하는 중...');
      
      await collectTaxData(
        startDate, 
        endDate,
        (progress) => {
          setDownloadProgress(progress);
          if (progress < 50) {
            setProgressMessage('세무 자료를 수집하는 중...');
          } else if (progress < 90) {
            setProgressMessage('전표를 생성하는 중...');
          } else {
            setProgressMessage('전표를 다운로드하는 중...');
          }
        }
      );
      
      setDownloadProgress(100);
      setProgressMessage('완료!');
      
      setTimeout(() => {
        alert('✅ 세무 자료가 수집되었고 전표가 다운로드되었습니다.');
        setLoading(false);
        setDownloadProgress(0);
        loadTaxData();
      }, 500);
    } catch (error) {
      setLoading(false);
      setDownloadProgress(0);
      alert(error?.userMessage || error?.response?.data?.message || error?.message || '세무 자료 수집 중 오류가 발생했습니다.');
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

  // 일반 로딩 중일 때
  if (loading && !downloadProgress) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  // 모바일 버전 렌더링 (Suspense로 래핑)
  if (isMobile) {
    return (
      <>
        <Suspense fallback={<S.LoadingMessage>로딩 중...</S.LoadingMessage>}>
          <MobileTaxAccountantDashboard
            taxStatus={taxStatus}
            pendingReports={pendingReports}
            summary={summary}
          />
        </Suspense>
        
        {/* 다운로드 중일 때는 진행률 모달 표시 */}
        {loading && downloadProgress > 0 && (
          <LoadingOverlay 
            modal={true}
            message={progressMessage} 
            progress={downloadProgress}
          />
        )}
      </>
    );
  }

  // 데스크톱 버전
  return (
    <>
      <S.SectionTitle>세무 자료 현황</S.SectionTitle>

      {/* 통계 카드 - 피그마 디자인 기반 */}
      <MainS.StatsGrid style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <MainS.StatCard>
          <MainS.StatLabel>
            <MainS.StatBadge status="default">합계 금액</MainS.StatBadge>
          </MainS.StatLabel>
          <MainS.StatValue>{stats.totalAmount.toLocaleString()}원</MainS.StatValue>
        </MainS.StatCard>

        <MainS.StatCard
          status="wait"
          onClick={() => handleStatCardClick('WAIT')}
          title="대기 상태 결의서 보기"
          selected={selectedStatus === 'WAIT'}
        >
          <MainS.StatLabel>
            <MainS.StatBadge status="wait">대기</MainS.StatBadge>
          </MainS.StatLabel>
          <MainS.StatValue>{stats.waitCount}건</MainS.StatValue>
          {selectedStatus === 'WAIT' && <MainS.ChevronIcon><FaChevronUp /></MainS.ChevronIcon>}
        </MainS.StatCard>

        <MainS.StatCard
          status="rejected"
          onClick={() => handleStatCardClick('REJECTED')}
          title="반려 상태 결의서 보기"
          selected={selectedStatus === 'REJECTED'}
        >
          <MainS.StatLabel>
            <MainS.StatBadge status="rejected">반려</MainS.StatBadge>
          </MainS.StatLabel>
          <MainS.StatValue>{stats.rejectedCount}건</MainS.StatValue>
          {selectedStatus === 'REJECTED' && <MainS.ChevronIcon><FaChevronUp /></MainS.ChevronIcon>}
        </MainS.StatCard>

        <MainS.StatCard
          status="approved"
          onClick={() => handleStatCardClick('APPROVED')}
          title="승인 상태 결의서 보기"
          selected={selectedStatus === 'APPROVED'}
        >
          <MainS.StatLabel>
            <MainS.StatBadge status="approved">승인</MainS.StatBadge>
          </MainS.StatLabel>
          <MainS.StatValue>{stats.approvedCount}건</MainS.StatValue>
          {selectedStatus === 'APPROVED' && <MainS.ChevronIcon><FaChevronUp /></MainS.ChevronIcon>}
        </MainS.StatCard>

        <MainS.StatCard
          onClick={() => handleStatCardClick('COLLECTED')}
          title="수집 상태 결의서 보기"
          selected={selectedStatus === 'COLLECTED'}
        >
          <MainS.StatLabel>
            <MainS.StatBadge status="default" style={{ backgroundColor: '#f8ebff', color: '#a133e0' }}>수집</MainS.StatBadge>
          </MainS.StatLabel>
          <MainS.StatValue>{stats.collectedCount}건</MainS.StatValue>
          {selectedStatus === 'COLLECTED' && <MainS.ChevronIcon><FaChevronUp /></MainS.ChevronIcon>}
        </MainS.StatCard>
      </MainS.StatsGrid>

      {/* 선택된 상태의 결의서 목록 */}
      {selectedStatus && (
        <MainS.StatusExpenseSection>
          <MainS.StatusExpenseHeader>
            <MainS.StatusExpenseTitle>
              최근 {selectedStatus === 'WAIT' ? '대기' : selectedStatus === 'REJECTED' ? '반려' : selectedStatus === 'APPROVED' ? '승인' : '수집'} 상태 결의서
            </MainS.StatusExpenseTitle>
            <MainS.ViewAllLink to={`/expenses?status=${selectedStatus === 'COLLECTED' ? 'APPROVED' : selectedStatus}${filters.startDate ? `&startDate=${filters.startDate}` : ''}${filters.endDate ? `&endDate=${filters.endDate}` : ''}`}>
              전체보기 →
            </MainS.ViewAllLink>
          </MainS.StatusExpenseHeader>

          {loadingStatusExpenses ? (
            <MainS.LoadingMessage>로딩 중...</MainS.LoadingMessage>
          ) : statusExpenses.length === 0 ? (
            <MainS.EmptyMessage>해당 상태의 결의서가 없습니다.</MainS.EmptyMessage>
          ) : (
            <MainS.RecentExpenseList>
              {statusExpenses.slice(0, 10).map((item) => (
                <MainS.RecentExpenseItem
                  key={item.expenseReportId}
                  onClick={() => navigate(`/detail/${item.expenseReportId}`)}
                  selected={false}
                >
                  <MainS.RecentExpenseDate>{item.reportDate}</MainS.RecentExpenseDate>
                  <MainS.RecentExpenseContent>
                    <MainS.RecentExpenseDescription>
                      {item.summaryDescription || item.firstDescription || '-'}
                    </MainS.RecentExpenseDescription>
                    <MainS.RecentExpenseMeta>
                      <span>{item.drafterName}</span>
                      <span>{item.totalAmount.toLocaleString()}원</span>
                    </MainS.RecentExpenseMeta>
                  </MainS.RecentExpenseContent>
                  {item.status && (
                    <MainS.StatusBadge status={item.status.toLowerCase()}>
                      {item.status === 'APPROVED' ? '승인' : item.status === 'WAIT' ? '대기' : item.status === 'REJECTED' ? '반려' : item.status}
                    </MainS.StatusBadge>
                  )}
                </MainS.RecentExpenseItem>
              ))}
            </MainS.RecentExpenseList>
          )}
        </MainS.StatusExpenseSection>
      )}

      {/* 미수집 결의서 알림 - 피그마 디자인 기반 */}
      {pendingReports.length > 0 && (
        <S.AlertSection style={{ 
          background: '#ffffff', 
          border: '1px solid #489bff', 
          borderRadius: '4px',
          padding: '20px 24px'
        }}>
          <S.AlertTitle style={{ color: '#333333', fontSize: '18px', fontWeight: '700' }}>
            미수집 결의서 {pendingReports.length}건
          </S.AlertTitle>
          <S.AlertButton 
            onClick={() => navigate('/tax/summary')}
            style={{
              background: '#ffffff',
              color: '#333333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            세무 요약 보기 →
          </S.AlertButton>
        </S.AlertSection>
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

      {/* 자료 수집 및 전표 다운로드 */}
      <S.ManagementSection>
        <S.SectionTitle>기간별 자료 수집</S.SectionTitle>
        <div style={{ padding: '20px', backgroundColor: '#fff9e6', borderRadius: '8px', border: '2px solid #ffc107' }}>
          <div style={{ marginBottom: '15px', color: '#e65100', fontWeight: '500' }}>
            ⚠️ 선택한 기간의 APPROVED 결의서를 수집하고 세무 전표를 다운로드합니다.
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

      {/* 다운로드 중일 때는 진행률 모달 표시 */}
      {loading && downloadProgress > 0 && (
        <LoadingOverlay 
          modal={true}
          message={progressMessage} 
          progress={downloadProgress}
        />
      )}
    </>
  );
};

export default TaxAccountantDashboardSection;


