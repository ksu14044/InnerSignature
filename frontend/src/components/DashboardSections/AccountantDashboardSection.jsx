import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPendingApprovals, fetchExpenseList, downloadTaxReviewList, fetchPaymentMethodSummary, fetchCategoryRatio, fetchUserExpenseStats } from '../../api/expenseApi';
import MonthlyTrendChart from './MonthlyTrendChart';
import PaymentMethodSummaryTable from './PaymentMethodSummaryTable';
import CategoryRatioTable from './CategoryRatioTable';
import UserExpenseTable from './UserExpenseTable';
import ScrollableChartsGrid from './ScrollableChartsGrid';
import * as S from './style';

const AccountantDashboardSection = ({ filters }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedExpenses, setApprovedExpenses] = useState([]);
  const [paymentMethodSummary, setPaymentMethodSummary] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [userExpenseData, setUserExpenseData] = useState([]);

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
      const [pendingRes, approvedRes] = await Promise.all([
        fetchPendingApprovals(user.userId).catch(() => ({ success: false, data: [] })),
        fetchExpenseList(1, 5, { status: ['APPROVED'] }).catch(() => ({ success: false, data: { content: [] } }))
      ]);

      if (pendingRes.success) {
        setPendingApprovals(pendingRes.data || []);
      }
      if (approvedRes.success && approvedRes.data) {
        setApprovedExpenses(approvedRes.data.content || []);
      }
    } catch (error) {
      console.error('추가 데이터 로드 실패:', error);
    }
  }, [user]);

  useEffect(() => {
    loadAdditionalData();
    loadPaymentMethodSummary();
    loadCategoryData();
    loadUserExpenseStats();
  }, [loadAdditionalData, loadPaymentMethodSummary, loadCategoryData, loadUserExpenseStats]);

  // 데스크톱 및 모바일 공통 버전 (CommonDashboardSection이 모바일 렌더링 자동 처리)
  return (
    <>
      {/* 대기 중인 결재 알림 */}
      {pendingApprovals.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>⏳ 결재 대기: {pendingApprovals.length}건</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/expenses?tab=MY_APPROVALS')}>
            결재 대기 목록 보기 →
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

      {/* 최근 활동 */}
      <S.RecentActivitySection>
        <S.SectionTitle>최근 승인된 결의서</S.SectionTitle>
        <S.RecentActivityList>
          {approvedExpenses.slice(0, 5).map((expense, index) => (
            <S.RecentActivityItem 
              key={expense.expenseReportId || index}
              onClick={() => navigate(`/detail/${expense.expenseReportId}`)}
            >
              <S.ActivityInfo>
                <S.ActivityTitle title={expense.title || `결의서 #${expense.expenseReportId}`}>
                  {expense.title || `결의서 #${expense.expenseReportId}`}
                </S.ActivityTitle>
                <S.ActivityMeta title={`${expense.drafterName} • ${expense.totalAmount?.toLocaleString()}원`}>
                  {expense.drafterName} • {expense.totalAmount?.toLocaleString()}원
                </S.ActivityMeta>
              </S.ActivityInfo>
              <S.ActivityDate>
                {new Date(expense.reportDate).toLocaleDateString()}
              </S.ActivityDate>
            </S.RecentActivityItem>
          ))}
        </S.RecentActivityList>
      </S.RecentActivitySection>

      
      
    </>
  );
};

export default AccountantDashboardSection;

