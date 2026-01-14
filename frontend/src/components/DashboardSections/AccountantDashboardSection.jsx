import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPendingApprovals, fetchExpenseList, downloadTaxReviewList } from '../../api/expenseApi';
import CommonDashboardSection from './CommonDashboardSection';
import * as S from './style';

const AccountantDashboardSection = ({ filters }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // 데스크톱 및 모바일 공통 버전 (CommonDashboardSection이 모바일 렌더링 자동 처리)
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

      {/* 메인 차트 - 월별 추이, 사용자별 지출 합계, 카테고리별 비율 */}
      <CommonDashboardSection
        chartTypes={['monthly', 'user']}
        showCategoryChart={true}
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

      
      
    </>
  );
};

export default AccountantDashboardSection;

