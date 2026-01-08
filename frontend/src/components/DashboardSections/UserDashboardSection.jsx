import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchExpenseList } from '../../api/expenseApi';
import { FaPlus, FaList, FaEye } from 'react-icons/fa';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileUserDashboard from '../mobile/MobileUserDashboard';
import * as S from './style';

const UserDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    totalAmount: 0,
    waitCount: 0,
    rejectedCount: 0,
    approvedCount: 0,
    paidCount: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const filterParams = {
          ...filters,
          drafterName: user.koreanName
        };

        const response = await fetchExpenseList(1, 1000, filterParams);
        
        if (response.success && response.data) {
          const expenses = response.data.content || [];
          const filteredExpenses = expenses.filter(exp => exp.drafterId === user.userId);
          
          // 통계 계산
          const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
          const waitCount = filteredExpenses.filter(exp => exp.status === 'WAIT').length;
          const rejectedCount = filteredExpenses.filter(exp => exp.status === 'REJECTED').length;
          const approvedCount = filteredExpenses.filter(exp => exp.status === 'APPROVED').length;
          const paidCount = filteredExpenses.filter(exp => exp.status === 'PAID').length;
          
          setStats({
            totalAmount,
            waitCount,
            rejectedCount,
            approvedCount,
            paidCount
          });

          // 최근 결의서 (최대 5개)
          setRecentExpenses(
            filteredExpenses
              .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
              .slice(0, 5)
          );
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, filters]);

  if (loading) {
    return <S.LoadingMessage>로딩 중...</S.LoadingMessage>;
  }

  // 모바일 버전 렌더링
  if (isMobile) {
    return (
      <MobileUserDashboard
        stats={stats}
        recentExpenses={recentExpenses}
      />
    );
  }

  // 데스크톱 버전
  return (
    <>
      <S.SectionTitle>내 결의서 현황</S.SectionTitle>
      
      <S.StatsGrid>
        <S.StatCard>
          <S.StatLabel>총 금액</S.StatLabel>
          <S.StatValue>{stats.totalAmount.toLocaleString()}원</S.StatValue>
        </S.StatCard>
        <S.StatCard status="wait">
          <S.StatLabel>대기</S.StatLabel>
          <S.StatValue>{stats.waitCount}건</S.StatValue>
        </S.StatCard>
        <S.StatCard status="approved">
          <S.StatLabel>승인</S.StatLabel>
          <S.StatValue>{stats.approvedCount}건</S.StatValue>
        </S.StatCard>
        <S.StatCard status="paid">
          <S.StatLabel>지출완료</S.StatLabel>
          <S.StatValue>{stats.paidCount}건</S.StatValue>
        </S.StatCard>
      </S.StatsGrid>

      {recentExpenses.length > 0 && (
        <S.RecentSection>
          <S.SectionTitle>최근 작성한 결의서</S.SectionTitle>
          <S.ExpenseList>
            {recentExpenses.map((expense) => (
              <S.ExpenseItem
                key={expense.expenseReportId}
                onClick={() => navigate(`/detail/${expense.expenseReportId}`)}
              >
                <S.ExpenseItemDate>{expense.reportDate}</S.ExpenseItemDate>
                <S.ExpenseItemContent>
                  <S.ExpenseItemTitle>
                    {expense.summaryDescription || expense.firstDescription || '-'}
                  </S.ExpenseItemTitle>
                  <S.ExpenseItemMeta>
                    <span>{expense.totalAmount.toLocaleString()}원</span>
                    <span>{expense.status === 'WAIT' ? '대기' : 
                           expense.status === 'APPROVED' ? '승인' :
                           expense.status === 'PAID' ? '지출완료' : expense.status}</span>
                  </S.ExpenseItemMeta>
                </S.ExpenseItemContent>
                <S.ExpenseItemAction>
                  <FaEye />
                </S.ExpenseItemAction>
              </S.ExpenseItem>
            ))}
          </S.ExpenseList>
        </S.RecentSection>
      )}

      <S.ActionSection>
        <S.ActionButton onClick={() => navigate('/expenses/create')}>
          <FaPlus />
          <span>새 결의서 작성</span>
        </S.ActionButton>
        <S.ActionButton variant="secondary" onClick={() => navigate('/expenses')}>
          <FaList />
          <span>내 결의서 목록</span>
        </S.ActionButton>
      </S.ActionSection>
    </>
  );
};

export default UserDashboardSection;


