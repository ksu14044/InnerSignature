import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategorySummary,
  fetchTaxPendingReports,
  fetchTaxStatus,
  fetchMonthlyTaxSummary,
  collectTaxData,
  getReceiptsByDetailIdOnly,
  downloadReceipt
} from '../../api/expenseApi';
import { useAuth } from '../../contexts/AuthContext';
import { showApiError } from '../../utils/errorHandler';
import PageHeader from '../../components/PageHeader/PageHeader';
import * as S from './style';

const TaxSummaryPage = () => {
  const { user } = useAuth();
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

  // 디바운스된 필터 적용
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // 영수증 검색 관련 상태
  const [receiptSearchId, setReceiptSearchId] = useState('');
  const [searchedReceipts, setSearchedReceipts] = useState([]);

  const isTaxAccountant = user?.role === 'TAX_ACCOUNTANT';

  // 최적화된 세무 데이터 로드 함수
  const loadTaxData = useCallback(async () => {
    if (!isTaxAccountant) return;
    try {
      setLoading(true);

      const [statusRes, pendingRes, summaryRes, monthlyRes] = await Promise.all([
        fetchTaxStatus(debouncedFilters.startDate || null, debouncedFilters.endDate || null),
        fetchTaxPendingReports(
          debouncedFilters.startDate || null, 
          debouncedFilters.endDate || null,
          debouncedFilters.collectionStatus
        ),
        fetchCategorySummary({
          startDate: debouncedFilters.startDate || null,
          endDate: debouncedFilters.endDate || null,
          status: ['APPROVED'], // APPROVED 상태만
          taxProcessed: debouncedFilters.collectionStatus
        }),
        fetchMonthlyTaxSummary(debouncedFilters.startDate || null, debouncedFilters.endDate || null)
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
      showApiError(e, '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [isTaxAccountant, debouncedFilters]);

  // 디바운스된 필터 변경 시 데이터 로드
  useEffect(() => {
    loadTaxData();
  }, [loadTaxData]);

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

    if (!confirm(`선택한 기간의 자료를 수집하시겠습니까?\n\n📅 ${filters.startDate} ~ ${filters.endDate}\n\n⚠️ 주의사항:\n- APPROVED 상태 결의서가 수집 처리됩니다\n- 수집 후에는 일반 사용자가 수정/삭제 불가능합니다`)) {
      return;
    }

    try {
      setLoading(true);
      await collectTaxData(filters.startDate, filters.endDate);
      alert('✅ 세무 자료가 수집되었고 전표가 다운로드되었습니다.');
      loadTaxData();
    } catch (e) {
      showApiError(e, '세무 자료 수집 중 오류가 발생했습니다.');
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
    
    if (!confirm(`선택한 기간을 수집하시겠습니까?\n\n📅 ${monthRange.startMonth} ~ ${monthRange.endMonth}\n(${startDate} ~ ${endDate})\n\n⚠️ 주의사항:\n- APPROVED 상태 결의서가 수집 처리됩니다\n- 수집 후에는 일반 사용자가 수정/삭제 불가능합니다`)) {
      return;
    }
    
    try {
      setLoading(true);
      await collectTaxData(startDate, endDate);
      alert('✅ 세무 자료가 수집되었고 전표가 다운로드되었습니다.');
      loadTaxData();
    } catch (e) {
      showApiError(e, '세무 자료 수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 영수증 검색 핸들러 (상세내역ID만 사용)
  const handleReceiptSearch = async () => {
    if (!receiptSearchId.trim()) {
      alert('상세내역 ID를 입력해주세요.');
      return;
    }

    try {
      const response = await getReceiptsByDetailIdOnly(receiptSearchId.trim());
      if (response.success) {
        setSearchedReceipts(response.data || []);
        if (!response.data || response.data.length === 0) {
          alert('해당 상세내역ID에 첨부된 영수증이 없습니다.');
        }
      } else {
        alert('영수증을 찾을 수 없습니다.');
        setSearchedReceipts([]);
      }
    } catch (error) {
      alert('영수증 검색 중 오류가 발생했습니다. 상세내역ID를 확인해주세요.');
      setSearchedReceipts([]);
    }
  };

  // 영수증 다운로드 핸들러
  const handleReceiptDownload = (receiptId, filename) => {
    if (!receiptId) return;
    downloadReceipt(receiptId, filename)
      .then(() => {
        // 다운로드 성공 (브라우저가 자동으로 다운로드 처리)
      })
      .catch((err) => {
        const msg = err?.userMessage || err?.message || "영수증 다운로드 중 오류가 발생했습니다.";
        alert(msg);
      });
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
      <PageHeader
        title="세무 요약"
      />

      {/* 자료 수집 및 전표 다운로드 섹션 */}
      <S.CollectCard>
        <S.CollectTitle>자료 수집 및 전표 다운로드</S.CollectTitle>
        
        {/* 수집 안내 박스 */}
        <S.InfoBox>
          <S.InfoTitle>수집 안내</S.InfoTitle>
          <S.InfoText>
            ·선택한 기간의 승인 결의서를 수집하고 세무사 전용 전표(Excel)를 다운로드합니다.<br />
            ·수집된 자료는 DB에 기록되며, 일반 사용자가 수정/삭제할 수 없습니다.<br />
            ·월별 수집 시: 1월 ~ 3월처럼 연속된 여러 달을 한 번에 수집 가능합니다.<br />
            ·이미 수집된 자료도 전표에 포함됩니다.
          </S.InfoText>
        </S.InfoBox>

        {/* 수집 모드 선택 */}
        <S.ModeSelector>
          <S.ModeOption>
            <S.RadioInput
              type="radio"
              name="collectMode"
              value="date"
              checked={collectMode === 'date'}
              onChange={(e) => setCollectMode(e.target.value)}
            />
            <S.RadioLabel>일별 수집</S.RadioLabel>
          </S.ModeOption>
          <S.ModeOption>
            <S.RadioInput
              type="radio"
              name="collectMode"
              value="month"
              checked={collectMode === 'month'}
              onChange={(e) => setCollectMode(e.target.value)}
            />
            <S.RadioLabel>월별 수집</S.RadioLabel>
          </S.ModeOption>
        </S.ModeSelector>

        {/* 일별 수집 모드 */}
        {collectMode === 'date' && (
          <S.DateCollectSection>
            <S.DateInputGroup>
              <S.DateInputWrapper>
                <S.DateLabel>수집 시작일</S.DateLabel>
                <S.DateInput
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </S.DateInputWrapper>
              <S.DateInputWrapper>
                <S.DateLabel>수집 종료일</S.DateLabel>
                <S.DateInput
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate || undefined}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </S.DateInputWrapper>
            </S.DateInputGroup>
            <S.DownloadButton
              onClick={handleCollectTaxData}
              disabled={!filters.startDate || !filters.endDate || loading}
            >
              {loading ? '처리 중...' : '일별 자료 수집 및 전표 다운로드'}
            </S.DownloadButton>
          </S.DateCollectSection>
        )}

        {/* 월별 수집 모드 */}
        {collectMode === 'month' && (
          <S.MonthCollectSection>
            <S.DateInputGroup>
              <S.DateInputWrapper>
                <S.DateLabel>수집 시작월</S.DateLabel>
                <S.DateInput
                  type="month"
                  value={monthRange.startMonth}
                  onChange={(e) => setMonthRange(prev => ({ ...prev, startMonth: e.target.value }))}
                  placeholder="YYYY-MM"
                />
              </S.DateInputWrapper>
              <S.DateInputWrapper>
                <S.DateLabel>수집 종료월</S.DateLabel>
                <S.DateInput
                  type="month"
                  value={monthRange.endMonth}
                  min={monthRange.startMonth || undefined}
                  onChange={(e) => setMonthRange(prev => ({ ...prev, endMonth: e.target.value }))}
                  placeholder="YYYY-MM"
                />
              </S.DateInputWrapper>
            </S.DateInputGroup>
            <S.DownloadButton
              onClick={handleMonthCollect}
              disabled={!monthRange.startMonth || !monthRange.endMonth || loading}
            >
              {loading ? '처리 중...' : '월별 자료 수집 및 전표 다운로드'}
            </S.DownloadButton>
          </S.MonthCollectSection>
        )}
      </S.CollectCard>

      {/* 필터 섹션 */}
      <S.FilterCard data-tourid="tour-tax-filter">
        <S.FilterGrid>
          <S.FilterGroup>
            <S.FilterLabel>시작일</S.FilterLabel>
            <S.FilterInput
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </S.FilterGroup>
          <S.FilterGroup>
            <S.FilterLabel>종료일</S.FilterLabel>
            <S.FilterInput
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </S.FilterGroup>
          <S.FilterGroup>
            <S.FilterLabel>수집 상태</S.FilterLabel>
            <S.FilterSelect
              value={filters.collectionStatus === null ? '' : filters.collectionStatus ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'true';
                setFilters(prev => ({ ...prev, collectionStatus: value }));
              }}
            >
              <option value="">전체</option>
              <option value="true">수집됨</option>
              <option value="false">미수집</option>
            </S.FilterSelect>
          </S.FilterGroup>
        </S.FilterGrid>
        <S.FilterActions>
          <S.ResetButton onClick={() => setFilters({ startDate: '', endDate: '', collectionStatus: null })}>
            초기화
          </S.ResetButton>
          <S.ApplyButton onClick={() => {}}>
            적용
          </S.ApplyButton>
        </S.FilterActions>
      </S.FilterCard>

      {/* 자료 수집 현황 통계 카드 */}
      {!loading && taxStatus && (
        <S.StatCard data-tourid="tour-tax-status">
          <S.StatBox>
            <S.StatLabel>승인 결의서</S.StatLabel>
            <S.StatValue>{taxStatus.totalCount?.toLocaleString()}건</S.StatValue>
          </S.StatBox>
          <S.StatBox>
            <S.StatLabel>수집</S.StatLabel>
            <S.StatValue>{(taxStatus.completedCount || taxStatus.processedCount || 0)?.toLocaleString()}건</S.StatValue>
          </S.StatBox>
          <S.StatBox>
            <S.StatLabel>미수집</S.StatLabel>
            <S.StatValue>{taxStatus.pendingCount?.toLocaleString()}건</S.StatValue>
          </S.StatBox>
          <S.StatBox>
            <S.StatLabel>수집률</S.StatLabel>
            <S.StatValue>{((taxStatus.completionRate || 0) * 100).toFixed(1)}%</S.StatValue>
          </S.StatBox>
          <S.StatBox>
            <S.StatLabel>합계 금액</S.StatLabel>
            <S.StatValue>{taxStatus.totalAmount?.toLocaleString()}원</S.StatValue>
          </S.StatBox>
          <S.StatBox>
            <S.StatLabel>미수집 금액</S.StatLabel>
            <S.StatValue>{taxStatus.pendingAmount?.toLocaleString()}원</S.StatValue>
          </S.StatBox>
        </S.StatCard>
      )}

      {/* APPROVED 상태 결의서 목록 */}
      <S.Card>
        <S.CardHeader>
          <S.CardTitle data-tourid="tour-tax-pending">
            승인 지출결의서 {pendingReports.length}건
            <S.CardSubtitle>(증빙 확인 및 수집 대상)</S.CardSubtitle>
          </S.CardTitle>
          <S.ViewAllButton onClick={() => navigate('/expenses')}>
            전체보기
          </S.ViewAllButton>
        </S.CardHeader>
        {loading ? (
          <S.Empty>불러오는 중...</S.Empty>
        ) : pendingReports.length === 0 ? (
          <S.Empty>승인 상태 결의서가 없습니다.</S.Empty>
        ) : (
          <>
            <S.PendingTable>
              <S.TableHeader>
                <S.TableHeaderCell>지급 요청일</S.TableHeaderCell>
                <S.TableHeaderCell>작성자</S.TableHeaderCell>
                <S.TableHeaderCell>적요(내용)</S.TableHeaderCell>
                <S.TableHeaderCell align="right">금액</S.TableHeaderCell>
                <S.TableHeaderCell>수집 상태</S.TableHeaderCell>
              </S.TableHeader>
              <S.TableBody>
                {pendingReports.map((item, index) => {
                  const descriptionDisplay =
                    item.summaryDescription && item.summaryDescription.trim() !== ''
                      ? item.summaryDescription
                      : item.firstDescription && item.firstDescription.trim() !== ''
                        ? item.firstDescription
                        : '-';
                  
                  const paymentReqDate = item.paymentReqDate || item.reportDate;

                  return (
                    <S.TableRow key={item.expenseReportId} even={index % 2 === 1}>
                      <S.TableCell>{paymentReqDate}</S.TableCell>
                      <S.TableCell>{item.drafterName}</S.TableCell>
                      <S.TableCell>
                        <S.LinkButton onClick={() => navigate(`/detail/${item.expenseReportId}`)}>
                          {descriptionDisplay}
                        </S.LinkButton>
                      </S.TableCell>
                      <S.TableCell align="right">{item.totalAmount?.toLocaleString()}원</S.TableCell>
                      <S.TableCell>
                        {item.taxCollectedAt ? (
                          <S.CollectedBadge>수집</S.CollectedBadge>
                        ) : (
                          <S.NotCollectedBadge>미수집</S.NotCollectedBadge>
                        )}
                      </S.TableCell>
                    </S.TableRow>
                  );
                })}
              </S.TableBody>
            </S.PendingTable>
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

      {/* 영수증 검색 섹션 */}
      <S.ReceiptSearchCard>
        <S.CardTitle>
          영수증 검색
          <S.CardSubtitle>(세무 자료 엑셀의 상세내역 ID로 영수증 찾기)</S.CardSubtitle>
        </S.CardTitle>

        <S.SearchInputGroup>
          <S.SearchInputWrapper>
            <S.SearchLabel>상세 내역 ID</S.SearchLabel>
            <S.SearchInput
              type="text"
              placeholder="예: 92(엑셀의 상세 내역 ID)"
              value={receiptSearchId}
              onChange={(e) => setReceiptSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleReceiptSearch()}
            />
          </S.SearchInputWrapper>
          <S.SearchButton
            onClick={handleReceiptSearch}
            disabled={!receiptSearchId.trim()}
          >
            검색
          </S.SearchButton>
        </S.SearchInputGroup>

        {searchedReceipts.length > 0 && (
          <S.ReceiptList>
            {searchedReceipts.map((receipt) => (
              <S.ReceiptItem key={receipt.receiptId}>
                <S.ReceiptInfo>
                  <S.ReceiptFileName>{receipt.originalFilename}</S.ReceiptFileName>
                  <S.ReceiptMeta>
                    {receipt.expenseDetailId && (
                      <>
                        상세내역ID: {receipt.expenseDetailId} |{' '}
                      </>
                    )}
                    업로드: {receipt.uploadedByName} |{' '}
                    {receipt.uploadedAt ? new Date(receipt.uploadedAt).toLocaleString('ko-KR') : ''}
                    {receipt.fileSize && ` | ${(receipt.fileSize / 1024).toFixed(2)} KB`}
                  </S.ReceiptMeta>
                </S.ReceiptInfo>
                <S.DownloadReceiptButton
                  onClick={() => handleReceiptDownload(receipt.receiptId, receipt.originalFilename)}
                  title="다운로드"
                >
                  <img
                    src="/이너사인_이미지 (1)/아이콘/20px_추가_검색_다운로드_임시저장_내지출결의서/영수증다운로드.png"
                    alt="다운로드"
                    style={{ width: '20px', height: '20px' }}
                  />
                </S.DownloadReceiptButton>
              </S.ReceiptItem>
            ))}
          </S.ReceiptList>
        )}

        {/* 사용법 안내 - 카드 하단 */}
        <S.UsageInfoBox>
          <S.UsageTitle>사용법</S.UsageTitle>
          <S.UsageText>
            ·세무 자료 엑셀의 '상세내역 ID' 컬럼에서 확인한 값을 입력하세요.<br />
            ·Enter 키 또는 검색 버튼으로 해당 상세내역의 영수증을 찾을 수 있습니다.<br />
            ·영수증은 행 단위(상세 내역별)로 조회됩니다.<br />
            ·영수증이 없으면 '첨부된 영수증이 없습니다' 메시지가 표시됩니다.
          </S.UsageText>
        </S.UsageInfoBox>
      </S.ReceiptSearchCard>
    </S.Container>
  );
};

export default TaxSummaryPage;
