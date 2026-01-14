import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPendingApprovals, fetchExpenseList, downloadTaxReviewList } from '../../api/expenseApi';
import { useIsMobile } from '../../hooks/useMediaQuery';
import CommonDashboardSection from './CommonDashboardSection';
import * as S from './style';

// Lazy load 모바일 컴포넌트
const MobileAccountantDashboard = lazy(() => import('../mobile/MobileAccountantDashboard'));

const AccountantDashboardSection = ({ filters }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedExpenses, setApprovedExpenses] = useState([]);

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
  }, [loadAdditionalData]);

  // 모바일 버전
  if (isMobile) {
    return (
      <Suspense fallback={<S.LoadingMessage>로딩 중...</S.LoadingMessage>}>
        <MobileAccountantDashboard
          pendingApprovals={pendingApprovals}
          approvedExpenses={approvedExpenses}
        />
      </Suspense>
    );
  }

  // 데스크톱 버전
  return (
    <>
      {/* 대기 중인 결재 알림 */}
      {pendingApprovals.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>⏳ 결재 대기: {pendingApprovals.length}건</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/expenses')}>
            결재 대기 목록 보기 →
          </S.AlertButton>
        </S.AlertSection>
      )}

      {/* 메인 차트 - 월별 추이 */}
      <CommonDashboardSection
        chartTypes={['monthly']}
        showPendingUsers={false}
        filters={filters} // 필터 적용
      />

      {/* 최근 활동 */}
      <S.RecentActivitySection>
        <S.SectionTitle>최근 승인된 결의서</S.SectionTitle>
        <S.RecentActivityList>
          {approvedExpenses.slice(0, 5).map((expense, index) => (
            <S.RecentActivityItem key={expense.expenseReportId || index}>
              <S.ActivityInfo>
                <S.ActivityTitle>{expense.title || `결의서 #${expense.expenseReportId}`}</S.ActivityTitle>
                <S.ActivityMeta>
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

      {/* 세무 검토 기능 */}
      <S.ManagementSection>
        <S.SectionTitle>세무 검토 기능</S.SectionTitle>
        <S.ManagementGrid>
          <S.ManagementCard onClick={() => downloadTaxReviewList()}>
            <S.ManagementIcon>📥</S.ManagementIcon>
            <S.ManagementTitle>엑셀 다운로드</S.ManagementTitle>
            <S.ManagementDesc>세무 검토용 엑셀 파일</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/missing-receipts')}>
            <S.ManagementIcon>🔍</S.ManagementIcon>
            <S.ManagementTitle>증빙 누락</S.ManagementTitle>
            <S.ManagementDesc>영수증 없는 결의서 조회</S.ManagementDesc>
          </S.ManagementCard>
        </S.ManagementGrid>
      </S.ManagementSection>
    </>
  );
};

export default AccountantDashboardSection;

