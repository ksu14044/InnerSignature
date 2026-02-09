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
  const [approvedExpenses, setApprovedExpenses] = useState([]);
  const [selectedTaxStatus, setSelectedTaxStatus] = useState(null); // 합계금액, 승인, 수집, 미수집
  const [taxStatusExpenses, setTaxStatusExpenses] = useState([]);
  const [loadingTaxStatusExpenses, setLoadingTaxStatusExpenses] = useState(false);
  
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
        const approvedExpensesList = expenses
          .filter(exp => exp.status === 'APPROVED')
          .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate)); // 최신순 정렬
        const collectedExpenses = expenses.filter(exp => exp.taxProcessed === true);
        setApprovedExpenses(approvedExpensesList.slice(0, 3)); // 최근 3개만 저장
        setStats({
          totalAmount: approvedExpensesList.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0),
          waitCount: expenses.filter(exp => exp.status === 'WAIT').length,
          rejectedCount: expenses.filter(exp => exp.status === 'REJECTED').length,
          approvedCount: approvedExpensesList.length,
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

  // 세무 상태 카드 클릭 핸들러 (합계금액, 승인, 수집, 미수집)
  const handleTaxStatusCardClick = async (taxStatus) => {
    if (selectedTaxStatus === taxStatus) {
      setSelectedTaxStatus(null);
      setTaxStatusExpenses([]);
      return;
    }

    setSelectedTaxStatus(taxStatus);
    setLoadingTaxStatusExpenses(true);

    try {
      let expenses = [];
      
      if (taxStatus === 'TOTAL') {
        // 합계금액: 모든 APPROVED 결의서
        const response = await fetchTaxPendingReports(filters.startDate || null, filters.endDate || null, null);
        if (response.success) {
          expenses = response.data || [];
        }
      } else if (taxStatus === 'APPROVED') {
        // 승인: APPROVED 상태 결의서 (수집 여부 무관)
        const response = await fetchTaxPendingReports(filters.startDate || null, filters.endDate || null, null);
        if (response.success) {
          expenses = response.data || [];
        }
      } else if (taxStatus === 'COLLECTED') {
        // 수집: tax_collected_at이 NOT NULL인 APPROVED 결의서
        const response = await fetchTaxPendingReports(filters.startDate || null, filters.endDate || null, true);
        if (response.success) {
          expenses = response.data || [];
        }
      } else if (taxStatus === 'UNCOLLECTED') {
        // 미수집: tax_collected_at이 NULL인 APPROVED 결의서
        const response = await fetchTaxPendingReports(filters.startDate || null, filters.endDate || null, false);
        if (response.success) {
          expenses = response.data || [];
        }
      }
      
      setTaxStatusExpenses(expenses);
    } catch (error) {
      console.error('세무 상태 결의서 목록 로드 실패:', error);
      setTaxStatusExpenses([]);
    } finally {
      setLoadingTaxStatusExpenses(false);
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
      {/* 통계 카드 - 피그마 디자인 기반 */}
      <S.StatsGridContainer>
        <S.StatCardContainer>
          <S.StatCardContent>
            <S.StatBadgeContainer>
              <S.StatBadge style={{ backgroundColor: '#ebf4ff', color: '#489bff' }}>합계 금액</S.StatBadge>
            </S.StatBadgeContainer>
            <S.StatValueLarge>{stats.totalAmount.toLocaleString()}원</S.StatValueLarge>
          </S.StatCardContent>
          <S.StatCardChevron><FaChevronUp /></S.StatCardChevron>
        </S.StatCardContainer>

        <S.StatCardContainer
          onClick={() => handleStatCardClick('APPROVED')}
          selected={selectedStatus === 'APPROVED'}
          style={{ borderColor: selectedStatus === 'APPROVED' ? '#14804a' : '#e4e4e4' }}
        >
          <S.StatCardContent>
            <S.StatBadgeContainer>
              <S.StatBadge style={{ backgroundColor: '#edfff6', color: '#14804a' }}>승인</S.StatBadge>
            </S.StatBadgeContainer>
            <S.StatValueLarge>{stats.approvedCount}건</S.StatValueLarge>
          </S.StatCardContent>
          <S.StatCardChevron><FaChevronUp /></S.StatCardChevron>
        </S.StatCardContainer>

        <S.StatCardContainer
          onClick={() => handleStatCardClick('WAIT')}
          selected={selectedStatus === 'WAIT'}
        >
          <S.StatCardContent>
            <S.StatBadgeContainer>
              <S.StatBadge style={{ backgroundColor: '#fff7d7', color: '#ffa310' }}>대기</S.StatBadge>
            </S.StatBadgeContainer>
            <S.StatValueLarge>{stats.waitCount}건</S.StatValueLarge>
          </S.StatCardContent>
          <S.StatCardChevron><FaChevronUp /></S.StatCardChevron>
        </S.StatCardContainer>

        <S.StatCardContainer
          onClick={() => handleStatCardClick('REJECTED')}
          selected={selectedStatus === 'REJECTED'}
        >
          <S.StatCardContent>
            <S.StatBadgeContainer>
              <S.StatBadge style={{ backgroundColor: '#ffefef', color: '#d72d30' }}>반려</S.StatBadge>
            </S.StatBadgeContainer>
            <S.StatValueLarge>{stats.rejectedCount}건</S.StatValueLarge>
          </S.StatCardContent>
          <S.StatCardChevron><FaChevronUp /></S.StatCardChevron>
        </S.StatCardContainer>
      </S.StatsGridContainer>

      {/* 승인 지출결의서 목록 - 피그마 디자인 */}
      {approvedExpenses.length > 0 && (
        <S.ApprovedExpenseSection>
          <S.ApprovedExpenseHeader>
            <S.ApprovedExpenseTitle>
              승인 지출결의서 {stats.approvedCount}건
            </S.ApprovedExpenseTitle>
            <S.ViewAllButton onClick={() => navigate('/expenses?status=APPROVED')}>
              전체보기 →
            </S.ViewAllButton>
          </S.ApprovedExpenseHeader>
          <MainS.RecentExpenseList>
            {approvedExpenses.map((item) => (
              <MainS.RecentExpenseItem key={item.expenseReportId} onClick={() => navigate(`/detail/${item.expenseReportId}`)}>
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
                <MainS.StatusBadge status="approved">승인</MainS.StatusBadge>
              </MainS.RecentExpenseItem>
            ))}
          </MainS.RecentExpenseList>
        </S.ApprovedExpenseSection>
      )}

      {/* 선택된 상태의 결의서 목록 (승인 외 다른 상태) */}
      {selectedStatus && selectedStatus !== 'APPROVED' && (
        <MainS.StatusExpenseSection>
          <MainS.StatusExpenseHeader>
            <MainS.StatusExpenseTitle>
              최근 {selectedStatus === 'WAIT' ? '대기' : selectedStatus === 'REJECTED' ? '반려' : '수집'} 상태 결의서
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
        <S.UncollectedAlertSection>
          <S.UncollectedAlertTitle>미수집 결의서 {pendingReports.length}건</S.UncollectedAlertTitle>
          <S.UncollectedAlertButton onClick={() => navigate('/tax/summary')}>
            세무 요약 보기 →
          </S.UncollectedAlertButton>
        </S.UncollectedAlertSection>
      )}

      {/* 세무 상태 카드 섹션 */}
      <S.TaxStatusCardsGrid>
        <S.TaxStatusCard
          onClick={() => handleTaxStatusCardClick('TOTAL')}
          selected={selectedTaxStatus === 'TOTAL'}
        >
          <S.TaxStatusCardContent>
            <S.TaxStatusBadge style={{ backgroundColor: '#ebf4ff', color: '#489bff' }}>합계금액</S.TaxStatusBadge>
            <S.TaxStatusValue>{stats.totalAmount.toLocaleString()}원</S.TaxStatusValue>
          </S.TaxStatusCardContent>
          {selectedTaxStatus === 'TOTAL' && <S.TaxStatusChevron><FaChevronUp /></S.TaxStatusChevron>}
        </S.TaxStatusCard>

        <S.TaxStatusCard
          onClick={() => handleTaxStatusCardClick('APPROVED')}
          selected={selectedTaxStatus === 'APPROVED'}
        >
          <S.TaxStatusCardContent>
            <S.TaxStatusBadge style={{ backgroundColor: '#edfff6', color: '#14804a' }}>승인</S.TaxStatusBadge>
            <S.TaxStatusValue>{stats.approvedCount}건</S.TaxStatusValue>
          </S.TaxStatusCardContent>
          {selectedTaxStatus === 'APPROVED' && <S.TaxStatusChevron><FaChevronUp /></S.TaxStatusChevron>}
        </S.TaxStatusCard>

        <S.TaxStatusCard
          onClick={() => handleTaxStatusCardClick('COLLECTED')}
          selected={selectedTaxStatus === 'COLLECTED'}
        >
          <S.TaxStatusCardContent>
            <S.TaxStatusBadge style={{ backgroundColor: '#f8ebff', color: '#a133e0' }}>수집</S.TaxStatusBadge>
            <S.TaxStatusValue>{stats.collectedCount}건</S.TaxStatusValue>
          </S.TaxStatusCardContent>
          {selectedTaxStatus === 'COLLECTED' && <S.TaxStatusChevron><FaChevronUp /></S.TaxStatusChevron>}
        </S.TaxStatusCard>

        <S.TaxStatusCard
          onClick={() => handleTaxStatusCardClick('UNCOLLECTED')}
          selected={selectedTaxStatus === 'UNCOLLECTED'}
        >
          <S.TaxStatusCardContent>
            <S.TaxStatusBadge style={{ backgroundColor: '#f4f4f4', color: '#666666' }}>미수집</S.TaxStatusBadge>
            <S.TaxStatusValue>{pendingReports.length}건</S.TaxStatusValue>
          </S.TaxStatusCardContent>
          {selectedTaxStatus === 'UNCOLLECTED' && <S.TaxStatusChevron><FaChevronUp /></S.TaxStatusChevron>}
        </S.TaxStatusCard>
      </S.TaxStatusCardsGrid>

      {/* 선택된 세무 상태의 결의서 목록 */}
      {selectedTaxStatus && (
        <MainS.StatusExpenseSection>
          <MainS.StatusExpenseHeader>
            <MainS.StatusExpenseTitle>
              {selectedTaxStatus === 'TOTAL' ? '전체' : 
               selectedTaxStatus === 'APPROVED' ? '승인' : 
               selectedTaxStatus === 'COLLECTED' ? '수집' : '미수집'} 상태 결의서
            </MainS.StatusExpenseTitle>
            <MainS.ViewAllLink to={`/tax/summary${filters.startDate ? `?startDate=${filters.startDate}` : ''}${filters.endDate ? `&endDate=${filters.endDate}` : ''}`}>
              전체보기 →
            </MainS.ViewAllLink>
          </MainS.StatusExpenseHeader>

          {loadingTaxStatusExpenses ? (
            <MainS.LoadingMessage>로딩 중...</MainS.LoadingMessage>
          ) : taxStatusExpenses.length === 0 ? (
            <MainS.EmptyMessage>해당 상태의 결의서가 없습니다.</MainS.EmptyMessage>
          ) : (
            <MainS.RecentExpenseList>
              {taxStatusExpenses.slice(0, 10).map((item) => (
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
                  <MainS.StatusBadge status="approved">승인</MainS.StatusBadge>
                </MainS.RecentExpenseItem>
              ))}
            </MainS.RecentExpenseList>
          )}
        </MainS.StatusExpenseSection>
      )}

      {/* 세무 자료 현황 - 피그마 디자인 */}
      <S.SectionTitle>세무 자료 현황</S.SectionTitle>

      {/* 주요 카테고리 Top 5 - 피그마 디자인 */}
      {summary.length > 0 && (
        <S.CategoryTableSection>
          <S.CategoryTableTitle>주요 카테고리(Top 5)</S.CategoryTableTitle>
          <S.CategoryTable>
            <S.CategoryTableHeader>
              <S.CategoryTableHeaderCell>카테고리</S.CategoryTableHeaderCell>
              <S.CategoryTableHeaderCell style={{ textAlign: 'right' }}>총 결제 금액</S.CategoryTableHeaderCell>
              <S.CategoryTableHeaderCell style={{ textAlign: 'right' }}>건수</S.CategoryTableHeaderCell>
            </S.CategoryTableHeader>
            <S.CategoryTableBody>
              {summary.slice(0, 5).map((item, index) => (
                <S.CategoryTableRow key={index}>
                  <S.CategoryTableCell>{item.category || '-'}</S.CategoryTableCell>
                  <S.CategoryTableCell style={{ textAlign: 'right', fontWeight: '500' }}>
                    {item.totalAmount?.toLocaleString() || 0}원
                  </S.CategoryTableCell>
                  <S.CategoryTableCell style={{ textAlign: 'right' }}>
                    {item.reportCount || 0}건
                  </S.CategoryTableCell>
                </S.CategoryTableRow>
              ))}
            </S.CategoryTableBody>
          </S.CategoryTable>
        </S.CategoryTableSection>
      )}


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


