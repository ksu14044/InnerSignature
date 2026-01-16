import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchExpenseList } from '../../api/expenseApi';
import { FaPlus, FaList, FaEye } from 'react-icons/fa';
import { useIsMobile } from '../../hooks/useMediaQuery';
import * as S from './style';

// Lazy load 모바일 컴포넌트
const MobileUserDashboard = lazy(() => import('../mobile/MobileUserDashboard'));

const UserDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // 모바일 버전 렌더링 (Suspense로 래핑)
  if (isMobile) {
    return (
      <Suspense fallback={<S.LoadingMessage>로딩 중...</S.LoadingMessage>}>
        <MobileUserDashboard
          recentExpenses={recentExpenses}
        />
      </Suspense>
    );
  }

  // 데스크톱 버전
  return (
    <>
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
                           expense.status}</span>
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


