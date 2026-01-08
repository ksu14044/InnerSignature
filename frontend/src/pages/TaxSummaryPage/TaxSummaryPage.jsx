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
    collectionStatus: null // null: 전체, true: 수집됨, false: 미수집
  });
  
  const [collectMode, setCollectMode] = useState('date'); // 'date' 또는 'month'
  const [monthRange, setMonthRange] = useState({
    startMonth: '',  // 'YYYY-MM' 형식
    endMonth: ''     // 'YYYY-MM' 형식
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
          taxProcessed: filters.collectionStatus,
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
  }, [filters.startDate, filters.endDate, filters.collectionStatus, isTaxAccountant]);

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
      alert('시작일과 종료일을 선택해주세요.');
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
    } catch (e) {
      console.error('세무 자료 수집 에러:', e);
      alert(e?.userMessage || e?.response?.data?.message || e?.message || '세무 자료 수집 중 오류가 발생했습니다.');
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
          <S.Title>세무사 상세 분석</S.Title>
          <S.SubTitle>결의서 검토 및 기간별 자료 수집</S.SubTitle>
        </div>
        <S.ButtonRow>
          <S.Button onClick={() => navigate('/dashboard')}>대시보드</S.Button>
          <S.Button onClick={() => navigate('/expenses')}>결의서 목록</S.Button>
          <S.Button variant="danger" onClick={async () => { await logout(); navigate('/'); }}>
            로그아웃
          </S.Button>
        </S.ButtonRow>
      </S.Header>

      {/* 조회 필터 */}
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
            <S.Label>수집 상태</S.Label>
            <S.Input
              as="select"
              value={filters.collectionStatus === null ? '' : filters.collectionStatus ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'true';
                setFilters(prev => ({ ...prev, collectionStatus: value }));
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">전체</option>
              <option value="true">수집됨</option>
              <option value="false">미수집</option>
            </S.Input>
          </div>
        </S.FilterGrid>
        <S.ButtonRow style={{ marginTop: 12 }}>
          <S.Button onClick={loadTaxData}>수동 새로고침</S.Button>
          <S.Button variant="secondary" onClick={() => setFilters({ startDate: '', endDate: '', collectionStatus: null })}>
            필터 초기화
          </S.Button>
        </S.ButtonRow>
      </S.FilterCard>

      {/* 자료 수집 섹션 */}
      <S.FilterCard style={{ marginTop: '20px', backgroundColor: '#fff9e6', border: '2px solid #ffc107' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            🗂️ 자료 수집 및 전표 다운로드
          </h3>
          <div style={{ fontSize: '13px', color: '#666' }}>
            ⚠️ 수집된 자료는 일반 사용자가 수정/삭제할 수 없으며, 세무사의 수정 요청 시에만 수정 가능합니다.
          </div>
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
            <S.FilterGrid>
              <div>
                <S.Label>수집 시작일</S.Label>
                <S.Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <S.Label>수집 종료일</S.Label>
                <S.Input
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate || undefined}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </S.FilterGrid>
            <S.ButtonRow style={{ marginTop: 12 }}>
              <S.Button
                variant="primary"
                onClick={handleCollectTaxData}
                disabled={!filters.startDate || !filters.endDate || loading}
                style={{ fontSize: '15px', padding: '12px 24px', fontWeight: '600' }}
              >
                {loading ? '처리 중...' : '📥 일별 자료 수집 및 전표 다운로드'}
              </S.Button>
            </S.ButtonRow>
            {(!filters.startDate || !filters.endDate) && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#d32f2f' }}>
                ※ 수집할 시작일과 종료일을 선택해주세요
              </div>
            )}
          </div>
        )}

        {/* 월별 수집 모드 */}
        {collectMode === 'month' && (
          <div>
            <S.FilterGrid>
              <div>
                <S.Label>수집 시작월</S.Label>
                <S.Input
                  type="month"
                  value={monthRange.startMonth}
                  onChange={(e) => setMonthRange(prev => ({ ...prev, startMonth: e.target.value }))}
                  placeholder="YYYY-MM"
                />
              </div>
              <div>
                <S.Label>수집 종료월</S.Label>
                <S.Input
                  type="month"
                  value={monthRange.endMonth}
                  min={monthRange.startMonth || undefined}
                  onChange={(e) => setMonthRange(prev => ({ ...prev, endMonth: e.target.value }))}
                  placeholder="YYYY-MM"
                />
              </div>
            </S.FilterGrid>
            <S.ButtonRow style={{ marginTop: 12 }}>
              <S.Button
                variant="primary"
                onClick={handleMonthCollect}
                disabled={!monthRange.startMonth || !monthRange.endMonth || loading}
                style={{ fontSize: '15px', padding: '12px 24px', fontWeight: '600' }}
              >
                {loading ? '처리 중...' : '📅 월별 자료 수집 및 전표 다운로드'}
              </S.Button>
            </S.ButtonRow>
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

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '13px', color: '#1565c0' }}>
          💡 <strong>수집 안내:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>선택한 기간의 PAID 결의서를 수집하고 세무사 전용 전표(Excel)를 다운로드합니다</li>
            <li>이미 수집된 자료도 전표에 포함됩니다</li>
            <li>월별 수집 시: 1월~3월처럼 연속된 여러 달을 한번에 수집 가능</li>
          </ul>
        </div>
      </S.FilterCard>

      {/* 자료 수집 현황 통계 카드 */}
      {!loading && taxStatus && (
        <S.StatCard data-tourid="tour-tax-status">
          <S.StatItem>
            <S.StatLabel>PAID 상태 결의서</S.StatLabel>
            <S.StatValue>{taxStatus.totalCount?.toLocaleString()}건</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>미수집</S.StatLabel>
            <S.StatValue style={{ color: '#dc3545' }}>{taxStatus.pendingCount?.toLocaleString()}건</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>수집 완료</S.StatLabel>
            <S.StatValue style={{ color: '#28a745' }}>{(taxStatus.completedCount || taxStatus.processedCount || 0)?.toLocaleString()}건</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>수집률</S.StatLabel>
            <S.StatValue>{((taxStatus.completionRate || 0) * 100).toFixed(1)}%</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>총 금액</S.StatLabel>
            <S.StatValue>{taxStatus.totalAmount?.toLocaleString()}원</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>미수집 금액</S.StatLabel>
            <S.StatValue>{taxStatus.pendingAmount?.toLocaleString()}원</S.StatValue>
          </S.StatItem>
        </S.StatCard>
      )}

      {/* PAID 상태 결의서 목록 */}
      <S.Card>
        <S.CardTitle data-tourid="tour-tax-pending">
          PAID 상태 결의서 ({pendingReports.length}건)
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666', marginLeft: '12px' }}>
            (증빙 확인 및 수집 대상)
          </span>
        </S.CardTitle>
        {loading ? (
          <S.Empty>불러오는 중...</S.Empty>
        ) : pendingReports.length === 0 ? (
          <S.Empty>PAID 상태 결의서가 없습니다.</S.Empty>
        ) : (
          <>
            <S.SummaryTable>
              <thead>
                <tr>
                  <S.Th>적요(내용)</S.Th>
                  <S.Th>작성자</S.Th>
                  <S.Th>작성일</S.Th>
                  <S.Th>금액</S.Th>
                  <S.Th>수집 상태</S.Th>
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
                      <S.Td data-label="수집 상태">
                        {item.taxCollectedAt ? (
                          <span style={{ color: '#28a745', fontSize: '12px' }}>
                            ✅ 수집됨 ({new Date(item.taxCollectedAt).toLocaleDateString('ko-KR')})
                          </span>
                        ) : (
                          <span style={{ color: '#dc3545', fontSize: '12px' }}>
                            ⏳ 미수집
                          </span>
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

      {/* 월별 집계 */}
      <S.Card>
        <S.CardTitle>월별 집계</S.CardTitle>
        {loading ? (
          <S.Empty>불러오는 중...</S.Empty>
        ) : monthlySummary.length === 0 ? (
          <S.Empty>데이터가 없습니다.</S.Empty>
        ) : (
          <S.SummaryTable>
            <thead>
              <tr>
                <S.Th>년월</S.Th>
                <S.Th>수집 완료 건수</S.Th>
                <S.Th>총 금액</S.Th>
                <S.Th>수집 완료 금액</S.Th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((row, index) => (
                <S.Tr key={row.yearMonth} even={index % 2 === 1}>
                  <S.Td data-label="년월">{row.yearMonth}</S.Td>
                  <S.Td align="right" data-label="수집 완료 건수">{row.completedCount}</S.Td>
                  <S.Td align="right" data-label="총 금액">{(row.totalAmount || 0).toLocaleString()}원</S.Td>
                  <S.Td align="right" data-label="수집 완료 금액">{(row.completedAmount || 0).toLocaleString()}원</S.Td>
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
