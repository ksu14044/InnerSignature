import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import * as S from './style';

const MobileTaxAccountantDashboard = ({ taxStatus, pendingReports, summary }) => {
  const navigate = useNavigate();

  // 총 통계 계산
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

  return (
    <S.MobileContainer>
      {/* 미수집 결의서 알림 */}
      {pendingReports && pendingReports.length > 0 && (
        <S.AlertBanner onClick={() => navigate('/tax/summary')}>
          <S.AlertIcon>📋</S.AlertIcon>
          <S.AlertContent>
            <S.AlertTitle>미수집 결의서</S.AlertTitle>
            <S.AlertCount>{pendingReports.length}건</S.AlertCount>
          </S.AlertContent>
          <S.AlertArrow>→</S.AlertArrow>
        </S.AlertBanner>
      )}

      {/* 통계 카드 */}
      {taxStatus && (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>세무 자료 현황</S.SectionTitle>
          </S.SectionHeader>
          
          <S.SwiperWrapper>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '0 16px' }}>
              <S.StatCard color="#007bff">
                <S.StatIcon>📊</S.StatIcon>
                <S.StatLabel>APPROVED 상태</S.StatLabel>
                <S.StatValue>{taxStatus.totalCount || 0}건</S.StatValue>
              </S.StatCard>
              
              <S.StatCard color="#dc3545">
                <S.StatIcon>⏳</S.StatIcon>
                <S.StatLabel>미수집</S.StatLabel>
                <S.StatValue>{taxStatus.pendingCount || 0}건</S.StatValue>
              </S.StatCard>
              
              <S.StatCard color="#28a745">
                <S.StatIcon>✅</S.StatIcon>
                <S.StatLabel>수집 완료</S.StatLabel>
                <S.StatValue>{taxStatus.completedCount || 0}건</S.StatValue>
              </S.StatCard>
              
              <S.StatCard color="#ff6f00">
                <S.StatIcon>💰</S.StatIcon>
                <S.StatLabel>총 금액</S.StatLabel>
                <S.StatValue>{totalStats.totalAmount.toLocaleString()}원</S.StatValue>
              </S.StatCard>
            </div>
          </S.SwiperWrapper>
        </S.Section>
      )}

      {/* 주요 카테고리 Top 5 */}
      {summary && summary.length > 0 && (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>주요 카테고리 (Top 5)</S.SectionTitle>
          </S.SectionHeader>
          
          <S.ChartSection>
            {summary.slice(0, 5).map((item, index) => (
              <S.CategoryItem key={index}>
                <S.CategoryIcon color="#007bff">
                  {index + 1}
                </S.CategoryIcon>
                <S.CategoryInfo>
                  <S.CategoryName>{item.category || '-'}</S.CategoryName>
                  <S.CategoryAmount>
                    {item.reportCount || 0}건
                  </S.CategoryAmount>
                </S.CategoryInfo>
                <S.CategoryRatio>
                  {item.totalAmount?.toLocaleString() || 0}원
                </S.CategoryRatio>
              </S.CategoryItem>
            ))}
            
            {summary.length > 5 && (
              <S.ViewAllButton onClick={() => navigate('/tax/summary')}>
                전체 보기 ({summary.length}개 카테고리) →
              </S.ViewAllButton>
            )}
          </S.ChartSection>
        </S.Section>
      )}

      {/* 빈 상태 */}
      {(!taxStatus && (!summary || summary.length === 0)) && (
        <S.Section>
          <S.ChartSection>
            <S.EmptyState>
              <S.EmptyIcon>📊</S.EmptyIcon>
              <S.EmptyText>세무 자료가 없습니다</S.EmptyText>
            </S.EmptyState>
          </S.ChartSection>
        </S.Section>
      )}
    </S.MobileContainer>
  );
};

export default MobileTaxAccountantDashboard;
