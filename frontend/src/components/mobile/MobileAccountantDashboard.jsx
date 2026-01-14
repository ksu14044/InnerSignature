import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { FaCheck, FaClock, FaDownload, FaSearch } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import * as S from './style';

const MobileAccountantDashboard = ({ pendingApprovals = [], approvedExpenses = [] }) => {
  const navigate = useNavigate();

  const pendingCount = pendingApprovals.length;
  const approvedCount = approvedExpenses.length;

  return (
    <S.MobileContainer>
      {/* 통계 카드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>결재 현황</S.SectionTitle>
        </S.SectionHeader>

        <S.SwiperWrapper>
          <Swiper
            slidesPerView={2.2}
            spaceBetween={12}
            pagination={{ clickable: true }}
            modules={[Pagination]}
          >
            <SwiperSlide>
              <S.StatCard color="#FF9800">
                <S.StatIcon><FaClock /></S.StatIcon>
                <S.StatLabel>대기 중</S.StatLabel>
                <S.StatValue>{pendingCount}건</S.StatValue>
              </S.StatCard>
            </SwiperSlide>

            <SwiperSlide>
              <S.StatCard color="#4CAF50">
                <S.StatIcon><FaCheck /></S.StatIcon>
                <S.StatLabel>승인 완료</S.StatLabel>
                <S.StatValue>{approvedCount}건</S.StatValue>
              </S.StatCard>
            </SwiperSlide>
          </Swiper>
        </S.SwiperWrapper>
      </S.Section>

      {/* 최근 활동 */}
      {pendingApprovals.length > 0 && (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>대기 중인 결재</S.SectionTitle>
          </S.SectionHeader>

          {pendingApprovals.slice(0, 3).map((approval, index) => (
            <S.PendingItem key={index} onClick={() => navigate(`/expense/${approval.expenseReportId}`)}>
              <S.PendingItemHeader>
                <S.PendingItemName>{approval.title || `결의서 #${approval.expenseReportId}`}</S.PendingItemName>
                <S.PendingItemAmount>{approval.totalAmount?.toLocaleString()}원</S.PendingItemAmount>
              </S.PendingItemHeader>
              <S.PendingItemInfo>
                {approval.drafterName} • {new Date(approval.reportDate).toLocaleDateString()}
              </S.PendingItemInfo>
            </S.PendingItem>
          ))}
        </S.Section>
      )}

      {/* 세무 검토 기능 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>세무 검토 기능</S.SectionTitle>
        </S.SectionHeader>

        <S.ActionGrid>
          <S.ActionCard onClick={() => navigate('/tax-review')}>
            <S.ActionIcon><FaDownload /></S.ActionIcon>
            <S.ActionLabel>엑셀 다운로드</S.ActionLabel>
          </S.ActionCard>

          <S.ActionCard onClick={() => navigate('/missing-receipts')}>
            <S.ActionIcon><FaSearch /></S.ActionIcon>
            <S.ActionLabel>증빙 누락</S.ActionLabel>
          </S.ActionCard>
        </S.ActionGrid>
      </S.Section>
    </S.MobileContainer>
  );
};

export default MobileAccountantDashboard;