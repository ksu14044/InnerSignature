import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPendingApprovals, fetchExpenseList, downloadTaxReviewList, fetchPaymentMethodSummary, fetchCategoryRatio, fetchUserExpenseStats } from '../../api/expenseApi';
import MonthlyTrendChart from './MonthlyTrendChart';
import PaymentMethodSummaryTable from './PaymentMethodSummaryTable';
import CategoryRatioTable from './CategoryRatioTable';
import UserExpenseTable from './UserExpenseTable';
import ScrollableChartsGrid from './ScrollableChartsGrid';
import { FaChevronUp } from 'react-icons/fa';
import * as S from './style';
import * as MainS from '../../pages/MainDashboardPage/style';

const AccountantDashboardSection = ({ filters }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedExpenses, setApprovedExpenses] = useState([]);
  const [paymentMethodSummary, setPaymentMethodSummary] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [userExpenseData, setUserExpenseData] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    waitCount: 0,
    rejectedCount: 0,
    approvedCount: 0
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusExpenses, setStatusExpenses] = useState([]);
  const [loadingStatusExpenses, setLoadingStatusExpenses] = useState(false);

  // 지출 수단별 통계 로드
  const loadPaymentMethodSummary = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchPaymentMethodSummary(
        filters.startDate || null,
        filters.endDate || null,
        ['APPROVED'],
        null
      );
      if (response.success) {
        setPaymentMethodSummary(response.data || []);
      }
    } catch (error) {
      console.error('지출 수단별 통계 로드 실패:', error);
    }
  }, [user, filters.startDate, filters.endDate]);

  // 카테고리 데이터 로드
  const loadCategoryData = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchCategoryRatio(
        filters.startDate || null,
        filters.endDate || null
      );
      if (response.success) {
        setCategoryData(response.data || []);
      }
    } catch (error) {
      console.error('카테고리 데이터 로드 실패:', error);
    }
  }, [user, filters.startDate, filters.endDate]);

  // 사용자별 지출 통계 로드
  const loadUserExpenseStats = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchUserExpenseStats(
        filters.startDate || null,
        filters.endDate || null
      );
      if (response.success) {
        setUserExpenseData(response.data || []);
      }
    } catch (error) {
      console.error('사용자별 지출 통계 로드 실패:', error);
    }
  }, [user, filters.startDate, filters.endDate]);

  // 대기 중인 결재와 최근 승인된 결재 로드
  const loadAdditionalData = useCallback(async () => {
    if (!user) return;

    try {
      const [pendingRes, approvedRes, allExpensesRes] = await Promise.all([
        fetchPendingApprovals(user.userId).catch(() => ({ success: false, data: [] })),
        fetchExpenseList(1, 5, { status: ['APPROVED'] }).catch(() => ({ success: false, data: { content: [] } })),
        fetchExpenseList(1, 1000, filters).catch(() => ({ success: false, data: { content: [] } }))
      ]);

      if (pendingRes.success) {
        setPendingApprovals(pendingRes.data || []);
      }
      if (approvedRes.success && approvedRes.data) {
        setApprovedExpenses(approvedRes.data.content || []);
      }
      if (allExpensesRes.success && allExpensesRes.data) {
        const expenses = allExpensesRes.data.content || [];
        const approvedExpenses = expenses.filter(exp => exp.status === 'APPROVED');
        setStats({
          totalAmount: approvedExpenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0),
          waitCount: expenses.filter(exp => exp.status === 'WAIT').length,
          rejectedCount: expenses.filter(exp => exp.status === 'REJECTED').length,
          approvedCount: expenses.filter(exp => exp.status === 'APPROVED').length
        });
      }
    } catch (error) {
      console.error('추가 데이터 로드 실패:', error);
    }
  }, [user, filters]);

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
        status: [status]
      };

      const response = await fetchExpenseList(1, 100, filterParams);
      
      if (response.success && response.data) {
        setStatusExpenses(response.data.content || []);
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

  useEffect(() => {
    loadAdditionalData();
    loadPaymentMethodSummary();
    loadCategoryData();
    loadUserExpenseStats();
  }, [loadAdditionalData, loadPaymentMethodSummary, loadCategoryData, loadUserExpenseStats]);

  // 데스크톱 및 모바일 공통 버전 (CommonDashboardSection이 모바일 렌더링 자동 처리)
  return (
    <>
      {/* 통계 카드 - 피그마 디자인 기반 */}
      <MainS.StatsGrid>
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
      </MainS.StatsGrid>

      {/* 선택된 상태의 결의서 목록 */}
      {selectedStatus && (
        <MainS.StatusExpenseSection>
          <MainS.StatusExpenseHeader>
            <MainS.StatusExpenseTitle>
              최근 {selectedStatus === 'WAIT' ? '대기' : selectedStatus === 'REJECTED' ? '반려' : '승인'} 상태 결의서
            </MainS.StatusExpenseTitle>
            <MainS.ViewAllLink to={`/expenses?status=${selectedStatus}${filters.startDate ? `&startDate=${filters.startDate}` : ''}${filters.endDate ? `&endDate=${filters.endDate}` : ''}`}>
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

      {/* 대기 중인 결재 알림 - 피그마 디자인 기반 */}
      {pendingApprovals.length > 0 && (
        <S.AlertSection style={{ 
          background: '#ffffff', 
          border: '1px solid #489bff', 
          borderRadius: '4px',
          padding: '20px 24px'
        }}>
          <S.AlertTitle style={{ color: '#333333', fontSize: '18px', fontWeight: '700' }}>
            결재 대기 {pendingApprovals.length}건
          </S.AlertTitle>
          <S.AlertButton 
            onClick={() => navigate('/expenses?tab=MY_APPROVALS')}
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
            내 결재함 보기 →
          </S.AlertButton>
        </S.AlertSection>
      )}

      {/* 사용자별 지출 합계, 카테고리별 비율, 지출 수단별 합계를 한 줄에 배치 */}
      <ScrollableChartsGrid>
        <UserExpenseTable data={userExpenseData} />
        <CategoryRatioTable data={categoryData} />
        <PaymentMethodSummaryTable data={paymentMethodSummary} />
      </ScrollableChartsGrid>

      {/* 월별 지출 추이 차트 */}
      <MonthlyTrendChart filters={filters} />

      {/* 최근 승인된 결의서 - 선택된 상태가 없을 때만 표시 */}
      {!selectedStatus && approvedExpenses.length > 0 && (
        <MainS.RecentExpenseSection>
          <MainS.RecentExpenseHeader>
            <MainS.RecentExpenseTitle>최근 승인된 결의서</MainS.RecentExpenseTitle>
            <MainS.ViewAllLink to="/expenses?status=APPROVED">전체보기 →</MainS.ViewAllLink>
          </MainS.RecentExpenseHeader>
          <MainS.RecentExpenseList>
            {approvedExpenses.slice(0, 5).map((expense) => (
              <MainS.RecentExpenseItem
                key={expense.expenseReportId}
                onClick={() => navigate(`/detail/${expense.expenseReportId}`)}
                selected={false}
              >
                <MainS.RecentExpenseDate>{expense.reportDate}</MainS.RecentExpenseDate>
                <MainS.RecentExpenseContent>
                  <MainS.RecentExpenseDescription>
                    {expense.summaryDescription || expense.firstDescription || expense.title || '-'}
                  </MainS.RecentExpenseDescription>
                  <MainS.RecentExpenseMeta>
                    <span>{expense.drafterName}</span>
                    <span>{expense.totalAmount?.toLocaleString()}원</span>
                  </MainS.RecentExpenseMeta>
                </MainS.RecentExpenseContent>
                <MainS.StatusBadge status="approved">승인</MainS.StatusBadge>
              </MainS.RecentExpenseItem>
            ))}
          </MainS.RecentExpenseList>
        </MainS.RecentExpenseSection>
      )}

      
      
    </>
  );
};

export default AccountantDashboardSection;

