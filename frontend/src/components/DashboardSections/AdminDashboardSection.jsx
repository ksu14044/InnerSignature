import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingUsers } from '../../api/userApi';
import { fetchPaymentMethodSummary, fetchCategoryRatio, fetchUserExpenseStats } from '../../api/expenseApi';
import MonthlyTrendChart from './MonthlyTrendChart';
import PaymentMethodSummaryTable from './PaymentMethodSummaryTable';
import CategoryRatioTable from './CategoryRatioTable';
import UserExpenseTable from './UserExpenseTable';
import ScrollableChartsGrid from './ScrollableChartsGrid';
import * as S from './style';

const AdminDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
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

  // 승인 대기 사용자 데이터 로드
  const loadPendingUsers = useCallback(async () => {
    try {
      const response = await getPendingUsers();
      if (response.success) {
        setPendingUsers(response.data || []);
      }
    } catch (error) {
      console.error('승인 대기 사용자 조회 실패:', error);
    }
  }, []);

  useEffect(() => {
    loadPendingUsers();
    loadPaymentMethodSummary();
    loadCategoryData();
    loadUserExpenseStats();
  }, [loadPendingUsers, loadPaymentMethodSummary, loadCategoryData, loadUserExpenseStats]);

  return (
    <>
      {/* 승인 대기 사용자 */}
      {pendingUsers.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>👥 승인 대기 사용자: {pendingUsers.length}명</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/users')}>
            사용자 관리로 이동 →
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
    </>
  );
};

export default AdminDashboardSection;
