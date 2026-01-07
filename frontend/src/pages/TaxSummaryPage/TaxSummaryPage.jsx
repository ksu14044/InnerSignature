import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchCategorySummary, 
  fetchTaxPendingReports,
  fetchTaxStatus,
  fetchMonthlyTaxSummary,
  collectTaxData
} from '../../api/expenseApi';
import { useAuth } from '../../contexts/AuthContext';
import * as S from './style';

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

  // 기간별 자료 수집 및 전표 다운로드 핸들러
  const handleCollectTaxData = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert('시작일과 종료일을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 기간(${filters.startDate} ~ ${filters.endDate})의 자료를 수집하고 전표를 다운로드하시겠습니까?\n수집된 자료는 수정/삭제가 불가능합니다.`)) {
      return;
    }

    try {
      setLoading(true);
      await collectTaxData(filters.startDate, filters.endDate);
      alert('세무 자료가 수집되었고 전표가 다운로드되었습니다.');
      loadTaxData();
    } catch (e) {
      console.error('세무 자료 수집 에러:', e);
      alert(e?.userMessage || e?.response?.data?.message || e?.message || '세무 자료 수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
          <S.SubTitle>기간별 자료 수집 및 세무처리 현황</S.SubTitle>
        </div>
        <S.ButtonRow>
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
          <S.Button 
            variant="primary" 
            onClick={handleCollectTaxData} 
            disabled={!filters.startDate || !filters.endDate || loading}
            style={{ fontSize: '16px', padding: '10px 20px', fontWeight: 'bold' }}
          >
            {loading ? '처리 중...' : '기간별 자료 수집 및 전표 다운로드'}
          </S.Button>
          <S.Button variant="secondary" onClick={() => setFilters({ startDate: '', endDate: '', taxProcessed: null })}>
            필터 초기화
          </S.Button>
        </S.ButtonRow>
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '14px', color: '#0066cc' }}>
          💡 <strong>안내:</strong> 기간별 자료 수집 버튼을 클릭하면 해당 기간의 PAID 상태 문서들이 수집 처리되고, 세무사 전용 전표가 자동으로 다운로드됩니다. 
          이미 수집된 자료도 포함되어 전표에 포함됩니다.
        </div>
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

      {/* PAID 상태 문서 목록 (참고용) */}
      <S.Card>
        <S.CardTitle data-tourid="tour-tax-pending">
          PAID 상태 문서 목록 ({pendingReports.length}건)
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666', marginLeft: '12px' }}>
            (기간별 자료 수집 대상)
          </span>
        </S.CardTitle>
        {loading ? (
          <S.Empty>불러오는 중...</S.Empty>
        ) : pendingReports.length === 0 ? (
          <S.Empty>PAID 상태 문서가 없습니다.</S.Empty>
        ) : (
          <>
            <S.SummaryTable>
              <thead>
                <tr>
                  <S.Th>적요(내용)</S.Th>
                  <S.Th>작성자</S.Th>
                  <S.Th>작성일</S.Th>
                  <S.Th>금액</S.Th>
                  <S.Th>세무 수집</S.Th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.map((item, index) => {
                  const descriptionDisplay =
                    item.summaryDescription && item.summaryDescription.trim() !== ''
                      ? item.summaryDescription
                      : item.firstDescription && item.firstDescription.trim() !== ''
                        ? item.firstDescription
                        : '-';

                  return (
                    <S.Tr key={item.expenseReportId} even={index % 2 === 1}>
                      <S.Td data-label="적요(내용)">
                        <S.LinkButton onClick={() => navigate(`/detail/${item.expenseReportId}`)}>
                          {descriptionDisplay}
                        </S.LinkButton>
                      </S.Td>
                      <S.Td data-label="작성자">{item.drafterName}</S.Td>
                      <S.Td data-label="작성일">{item.reportDate}</S.Td>
                      <S.Td align="right" data-label="금액">{item.totalAmount?.toLocaleString()}원</S.Td>
                      <S.Td data-label="세무 수집">
                        {item.taxCollectedAt ? (
                          <span style={{ color: '#28a745', fontSize: '12px' }}>
                            수집됨 ({new Date(item.taxCollectedAt).toLocaleDateString('ko-KR')})
                          </span>
                        ) : (
                          <span style={{ color: '#dc3545', fontSize: '12px' }}>미수집</span>
                        )}
                      </S.Td>
                    </S.Tr>
                  );
                })}
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
