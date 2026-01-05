import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchCategorySummary, 
  fetchTaxPendingReports,
  fetchTaxStatus,
  fetchMonthlyTaxSummary,
  batchCompleteTaxProcessing,
  completeTaxProcessing,
  downloadTaxReport
} from '../../api/expenseApi';
import { useAuth } from '../../contexts/AuthContext';
import * as S from './style';
import TourButton from '../../components/TourButton/TourButton';

const TaxSummaryPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    taxProcessed: null // null: 전체, true: 완료, false: 미완료
  });
  
  const [taxStatus, setTaxStatus] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);
  const [summary, setSummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [processingExpenseId, setProcessingExpenseId] = useState(null);
  const debounceTimer = useRef(null);

  const isTaxAccountant = user?.role === 'TAX_ACCOUNTANT';

  const loadTaxData = async () => {
    if (!isTaxAccountant) return;
    try {
      setLoading(true);
      
      const [statusRes, pendingRes, summaryRes, monthlyRes] = await Promise.all([
        fetchTaxStatus(filters.startDate || null, filters.endDate || null),
        fetchTaxPendingReports(filters.startDate || null, filters.endDate || null),
        fetchCategorySummary({
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: ['PAID'], // PAID 상태만
          taxProcessed: filters.taxProcessed,
          isSecret: null // 비밀글 필터 제거
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
    } catch (e) {
      console.error(e);
      alert(e?.userMessage || '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 자동 적용 (debounce)
  useEffect(() => {
    if (!isTaxAccountant) return;
    
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.taxProcessed, isTaxAccountant]);

  // 초기 로드
  useEffect(() => {
    if (isTaxAccountant) {
      loadTaxData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isTaxAccountant]);

  // 전체 통계 계산
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

  // 정렬된 요약 데이터
  const sortedSummary = useMemo(() => {
    if (!summary || summary.length === 0) return [];
    return [...summary].sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
  }, [summary]);

  // 일괄 처리 핸들러
  const handleBatchComplete = async () => {
    if (isBatchProcessing || processingExpenseId !== null) return;
    if (selectedIds.size === 0) {
      alert('처리할 건을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedIds.size}건을 세무처리 완료 처리하시겠습니까?`)) {
      return;
    }

    try {
      setIsBatchProcessing(true);
      const ids = Array.from(selectedIds);
      const res = await batchCompleteTaxProcessing(ids);
      if (res.success) {
        alert('세무처리 완료 처리되었습니다.');
        setSelectedIds(new Set());
        loadTaxData();
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || '세무처리 일괄 완료 중 오류가 발생했습니다.');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // 개별 처리 핸들러
  const handleSingleComplete = async (expenseId) => {
    if (processingExpenseId === expenseId || isBatchProcessing) return;
    if (!confirm('이 건을 세무처리 완료 처리하시겠습니까?')) {
      return;
    }

    try {
      setProcessingExpenseId(expenseId);
      const res = await completeTaxProcessing(expenseId);
      if (res.success) {
        alert('세무처리 완료 처리되었습니다.');
        loadTaxData();
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || '세무처리 완료 중 오류가 발생했습니다.');
    } finally {
      setProcessingExpenseId(null);
    }
  };

  // 체크박스 토글
  const toggleSelection = (expenseId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId);
    } else {
      newSelected.add(expenseId);
    }
    setSelectedIds(newSelected);
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedIds.size === pendingReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingReports.map(r => r.expenseReportId)));
    }
  };

  if (!user) {
    return (
      <S.Container>
        <S.Alert>로그인이 필요합니다.</S.Alert>
        <S.Button onClick={() => navigate('/')}>로그인 페이지로 이동</S.Button>
      </S.Container>
    );
  }

  if (!isTaxAccountant) {
    return (
      <S.Container>
        <S.Alert>접근 권한이 없습니다. (TAX_ACCOUNTANT 전용)</S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header data-tourid="tour-tax-header">
        <div>
          <S.Title>세무사 전용 요약</S.Title>
          <S.SubTitle>세무처리 현황 및 집계 데이터</S.SubTitle>
        </div>
        <S.ButtonRow>
          <TourButton />
          <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
          <S.Button variant="danger" onClick={async () => { await logout(); navigate('/'); }}>
            로그아웃
          </S.Button>
        </S.ButtonRow>
      </S.Header>

      <S.FilterCard data-tourid="tour-tax-filter">
        <S.FilterGrid>
          <div>
            <S.Label>시작일</S.Label>
            <S.Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <S.Label>종료일</S.Label>
            <S.Input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div>
            <S.Label>세무처리</S.Label>
            <S.Input
              as="select"
              value={filters.taxProcessed === null ? '' : filters.taxProcessed ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'true';
                setFilters(prev => ({ ...prev, taxProcessed: value }));
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">전체</option>
              <option value="true">완료</option>
              <option value="false">미완료</option>
            </S.Input>
          </div>
        </S.FilterGrid>
        <S.ButtonRow style={{ marginTop: 12 }}>
          <S.Button onClick={loadTaxData}>수동 새로고침</S.Button>
          <S.Button variant="secondary" onClick={() => setFilters({ startDate: '', endDate: '', taxProcessed: null })}>
            필터 초기화
          </S.Button>
        </S.ButtonRow>
      </S.FilterCard>

      {/* 세무처리 현황 통계 카드 */}
      {!loading && taxStatus && (
        <S.StatCard data-tourid="tour-tax-status">
          <S.StatItem>
            <S.StatLabel>총 처리 대상 건수</S.StatLabel>
            <S.StatValue>{taxStatus.totalCount?.toLocaleString()}건</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>세무처리 대기 건수</S.StatLabel>
            <S.StatValue style={{ color: '#dc3545' }}>{taxStatus.pendingCount?.toLocaleString()}건</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>세무처리 완료 건수</S.StatLabel>
            <S.StatValue style={{ color: '#28a745' }}>{taxStatus.completedCount?.toLocaleString()}건</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>세무처리 완료율</S.StatLabel>
            <S.StatValue>{((taxStatus.completionRate || 0) * 100).toFixed(1)}%</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>총 금액</S.StatLabel>
            <S.StatValue>{taxStatus.totalAmount?.toLocaleString()}원</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>대기 건 총 금액</S.StatLabel>
            <S.StatValue>{taxStatus.pendingAmount?.toLocaleString()}원</S.StatValue>
          </S.StatItem>
        </S.StatCard>
      )}

      {/* 세무처리 대기 건 목록 */}
      <S.Card>
        <S.CardTitle data-tourid="tour-tax-pending">
          세무처리 대기 건 ({pendingReports.length}건)
          {pendingReports.length > 0 && (
            <S.Button 
              variant="primary" 
              onClick={handleBatchComplete}
              disabled={isBatchProcessing || processingExpenseId !== null}
              style={{ marginLeft: '12px', fontSize: '14px', padding: '6px 12px' }}
            >
              {isBatchProcessing ? '처리 중...' : `선택한 건 일괄 처리 (${selectedIds.size})`}
            </S.Button>
          )}
        </S.CardTitle>
        {loading ? (
          <S.Empty>불러오는 중...</S.Empty>
        ) : pendingReports.length === 0 ? (
          <S.Empty>세무처리 대기 건이 없습니다.</S.Empty>
        ) : (
          <>
            <S.SummaryTable>
              <thead>
                <tr>
                  <S.Th>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === pendingReports.length && pendingReports.length > 0}
                      onChange={toggleSelectAll}
                    />
                    제목
                  </S.Th>
                  <S.Th>작성자</S.Th>
                  <S.Th>작성일</S.Th>
                  <S.Th>금액</S.Th>
                  <S.Th>처리</S.Th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.map((item, index) => (
                  <S.Tr key={item.expenseReportId} even={index % 2 === 1}>
                    <S.Td data-label="제목">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.expenseReportId)}
                          onChange={() => toggleSelection(item.expenseReportId)}
                          style={{ margin: 0, flexShrink: 0 }}
                        />
                        <S.LinkButton onClick={() => navigate(`/detail/${item.expenseReportId}`)}>
                          {item.title}
                        </S.LinkButton>
                      </div>
                    </S.Td>
                    <S.Td data-label="작성자">{item.drafterName}</S.Td>
                    <S.Td data-label="작성일">{item.reportDate}</S.Td>
                    <S.Td align="right" data-label="금액">{item.totalAmount?.toLocaleString()}원</S.Td>
                    <S.Td data-label="처리">
                      <S.Button
                        variant="secondary"
                        onClick={() => handleSingleComplete(item.expenseReportId)}
                        disabled={isBatchProcessing || processingExpenseId === item.expenseReportId || processingExpenseId !== null}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        {processingExpenseId === item.expenseReportId ? '처리 중...' : '처리'}
                      </S.Button>
                    </S.Td>
                  </S.Tr>
                ))}
              </tbody>
            </S.SummaryTable>
          </>
        )}
      </S.Card>

      {/* 카테고리별 집계 */}
      <S.Card>
        <S.CardTitle data-tourid="tour-tax-summary">카테고리별 집계</S.CardTitle>
        {loading ? (
          <S.Empty>불러오는 중...</S.Empty>
        ) : sortedSummary.length === 0 ? (
          <S.Empty>데이터가 없습니다.</S.Empty>
        ) : (
          <S.SummaryTable>
            <thead>
              <tr>
                <S.Th>카테고리</S.Th>
                <S.Th>총 금액</S.Th>
                <S.Th>상세 건수</S.Th>
                <S.Th>결의서 수</S.Th>
              </tr>
            </thead>
            <tbody>
              {sortedSummary.map((row, index) => (
                <S.Tr key={row.category} even={index % 2 === 1}>
                  <S.Td data-label="카테고리">{row.category}</S.Td>
                  <S.Td align="right" data-label="총 금액">{(row.totalAmount || 0).toLocaleString()}원</S.Td>
                  <S.Td align="right" data-label="상세 건수">{row.itemCount}</S.Td>
                  <S.Td align="right" data-label="결의서 수">{row.reportCount}</S.Td>
                </S.Tr>
              ))}
            </tbody>
          </S.SummaryTable>
        )}
      </S.Card>

      {/* 월별 세무처리 집계 */}
      <S.Card>
        <S.CardTitle>월별 세무처리 집계</S.CardTitle>
        {loading ? (
          <S.Empty>불러오는 중...</S.Empty>
        ) : monthlySummary.length === 0 ? (
          <S.Empty>데이터가 없습니다.</S.Empty>
        ) : (
          <S.SummaryTable>
            <thead>
              <tr>
                <S.Th>년월</S.Th>
                <S.Th>세무처리 완료 건수</S.Th>
                <S.Th>총 금액</S.Th>
                <S.Th>세무처리 완료 금액</S.Th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((row, index) => (
                <S.Tr key={row.yearMonth} even={index % 2 === 1}>
                  <S.Td data-label="년월">{row.yearMonth}</S.Td>
                  <S.Td align="right" data-label="세무처리 완료 건수">{row.completedCount}</S.Td>
                  <S.Td align="right" data-label="총 금액">{(row.totalAmount || 0).toLocaleString()}원</S.Td>
                  <S.Td align="right" data-label="세무처리 완료 금액">{(row.completedAmount || 0).toLocaleString()}원</S.Td>
                </S.Tr>
              ))}
            </tbody>
          </S.SummaryTable>
        )}
      </S.Card>
    </S.Container>
  );
};

export default TaxSummaryPage;
