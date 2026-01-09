import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { FaPlus, FaList } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import * as S from './style';

const MobileUserDashboard = ({ stats, recentExpenses }) => {
  const navigate = useNavigate();

  return (
    <S.MobileContainer>
      {/* 스와이프 가능한 통계 카드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>내 지출 현황</S.SectionTitle>
        </S.SectionHeader>
        
        <S.SwiperWrapper>
          <Swiper
            slidesPerView={2.2}
            spaceBetween={12}
            pagination={{ clickable: true }}
            modules={[Pagination]}
          >
            <SwiperSlide>
              <S.StatCard color="#4CAF50">
                <S.StatIcon>💰</S.StatIcon>
                <S.StatLabel>총 지출</S.StatLabel>
                <S.StatValue>
                  {(stats.totalAmount || 0).toLocaleString()}원
                </S.StatValue>
              </S.StatCard>
            </SwiperSlide>
            
            <SwiperSlide>
              <S.StatCard color="#FF9800">
                <S.StatIcon>⏳</S.StatIcon>
                <S.StatLabel>대기 중</S.StatLabel>
                <S.StatValue>
                  {(stats.waitCount || 0)}건
                </S.StatValue>
              </S.StatCard>
            </SwiperSlide>
            
            <SwiperSlide>
              <S.StatCard color="#2196F3">
                <S.StatIcon>✅</S.StatIcon>
                <S.StatLabel>승인 완료</S.StatLabel>
                <S.StatValue>
                  {(stats.approvedCount || 0)}건
                </S.StatValue>
              </S.StatCard>
            </SwiperSlide>
            
            <SwiperSlide>
              <S.StatCard color="#F44336">
                <S.StatIcon>❌</S.StatIcon>
                <S.StatLabel>반려</S.StatLabel>
                <S.StatValue>
                  {(stats.rejectedCount || 0)}건
                </S.StatValue>
              </S.StatCard>
            </SwiperSlide>
            
            <SwiperSlide>
              <S.StatCard color="#9C27B0">
                <S.StatIcon>💳</S.StatIcon>
                <S.StatLabel>결제 완료</S.StatLabel>
                <S.StatValue>
                  {(stats.paidCount || 0)}건
                </S.StatValue>
              </S.StatCard>
            </SwiperSlide>
          </Swiper>
        </S.SwiperWrapper>
      </S.Section>

      {/* 최근 내역 */}
      {recentExpenses && recentExpenses.length > 0 && (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>최근 작성한 지출결의서</S.SectionTitle>
          </S.SectionHeader>
          
          <S.PendingSection>
            {recentExpenses.slice(0, 5).map((expense) => (
              <S.PendingItem 
                key={expense.expenseReportId}
                onClick={() => navigate(`/detail/${expense.expenseReportId}`)}
              >
                <S.PendingItemHeader>
                  <S.PendingItemName>
                    {expense.summaryDescription || expense.firstDescription || '제목 없음'}
                  </S.PendingItemName>
                  <S.PendingItemAmount>
                    {expense.totalAmount.toLocaleString()}원
                  </S.PendingItemAmount>
                </S.PendingItemHeader>
                <S.PendingItemInfo>
                  {expense.reportDate} | {getStatusText(expense.status)}
                </S.PendingItemInfo>
              </S.PendingItem>
            ))}
            
            {recentExpenses.length > 5 && (
              <S.ViewAllButton onClick={() => navigate('/expenses')}>
                전체 {recentExpenses.length}건 보기 →
              </S.ViewAllButton>
            )}
          </S.PendingSection>
        </S.Section>
      )}

      {/* 빠른 액션 그리드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>빠른 액션</S.SectionTitle>
        </S.SectionHeader>
        
        <S.ActionGrid>
          <S.ActionCard onClick={() => navigate('/expenses/create')}>
            <S.ActionIcon>
              <FaPlus size={32} />
            </S.ActionIcon>
            <S.ActionLabel>새 결의서 작성</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/expenses')}>
            <S.ActionIcon>
              <FaList size={32} />
            </S.ActionIcon>
            <S.ActionLabel>내 결의서 목록</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/cards')}>
            <S.ActionIcon>💳</S.ActionIcon>
            <S.ActionLabel>카드 관리</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/signatures')}>
            <S.ActionIcon>✍️</S.ActionIcon>
            <S.ActionLabel>도장/서명 관리</S.ActionLabel>
          </S.ActionCard>
        </S.ActionGrid>
      </S.Section>

      {(!recentExpenses || recentExpenses.length === 0) && (
        <S.Section>
          <S.ChartSection>
            <S.EmptyState>
              <S.EmptyIcon>📝</S.EmptyIcon>
              <S.EmptyText>아직 작성한 지출결의서가 없습니다</S.EmptyText>
              <S.ViewAllButton 
                onClick={() => navigate('/expenses/create')}
                style={{ marginTop: '16px' }}
              >
                지출결의서 작성하기
              </S.ViewAllButton>
            </S.EmptyState>
          </S.ChartSection>
        </S.Section>
      )}
    </S.MobileContainer>
  );
};

const getStatusText = (status) => {
  const statusMap = {
    'WAIT': '결재 대기',
    'APPROVED': '승인 완료',
    'REJECTED': '반려'
  };
  return statusMap[status] || status;
};

export default MobileUserDashboard;

