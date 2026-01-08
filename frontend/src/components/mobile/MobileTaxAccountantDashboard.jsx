import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import * as S from './style';

const MobileTaxAccountantDashboard = ({ 
  taxStatus,
  pendingReports,
  summary
}) => {
  const navigate = useNavigate();

  return (
    <S.MobileContainer>
      {/* 세무 처리 현황 알림 */}
      {pendingReports && pendingReports.length > 0 && (
        <S.AlertBanner 
          onClick={() => navigate('/tax/summary')}
          style={{ background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)' }}
        >
          <S.AlertIcon>📋</S.AlertIcon>
          <S.AlertContent>
            <S.AlertTitle>세무 처리 대기</S.AlertTitle>
            <S.AlertCount>{pendingReports.length}건</S.AlertCount>
          </S.AlertContent>
          <S.AlertArrow>→</S.AlertArrow>
        </S.AlertBanner>
      )}

      {/* 스와이프 가능한 통계 카드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>세무 현황</S.SectionTitle>
        </S.SectionHeader>
        
        {taxStatus && (
          <S.SwiperWrapper>
            <Swiper
              slidesPerView={2.2}
              spaceBetween={12}
              pagination={{ clickable: true }}
              modules={[Pagination]}
            >
              <SwiperSlide>
                <S.StatCard color="#4CAF50">
                  <S.StatIcon>📊</S.StatIcon>
                  <S.StatLabel>총 처리 건수</S.StatLabel>
                  <S.StatValue>
                    {(taxStatus.totalCount || 0).toLocaleString()}건
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
              
              <SwiperSlide>
                <S.StatCard color="#FF9800">
                  <S.StatIcon>⏳</S.StatIcon>
                  <S.StatLabel>미처리</S.StatLabel>
                  <S.StatValue>
                    {(taxStatus.unprocessedCount || 0)}건
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
              
              <SwiperSlide>
                <S.StatCard color="#2196F3">
                  <S.StatIcon>✅</S.StatIcon>
                  <S.StatLabel>처리 완료</S.StatLabel>
                  <S.StatValue>
                    {(taxStatus.processedCount || 0)}건
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
              
              <SwiperSlide>
                <S.StatCard color="#9C27B0">
                  <S.StatIcon>💰</S.StatIcon>
                  <S.StatLabel>총 금액</S.StatLabel>
                  <S.StatValue>
                    {(taxStatus.totalAmount || 0).toLocaleString()}원
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
            </Swiper>
          </S.SwiperWrapper>
        )}
      </S.Section>

      {/* 세무 처리 대기 목록 */}
      {pendingReports && pendingReports.length > 0 && (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>세무 처리 대기</S.SectionTitle>
          </S.SectionHeader>
          
          <S.PendingSection>
            {pendingReports.slice(0, 5).map((report) => (
              <S.PendingItem 
                key={report.expenseReportId}
                onClick={() => navigate(`/detail/${report.expenseReportId}`)}
              >
                <S.PendingItemHeader>
                  <S.PendingItemName>
                    {report.drafterName || '작성자 미상'}
                  </S.PendingItemName>
                  <S.PendingItemAmount>
                    {(report.totalAmount || 0).toLocaleString()}원
                  </S.PendingItemAmount>
                </S.PendingItemHeader>
                <S.PendingItemInfo>
                  {report.reportDate} | {report.firstDescription || '적요 없음'}
                </S.PendingItemInfo>
              </S.PendingItem>
            ))}
            
            {pendingReports.length > 5 && (
              <S.ViewAllButton onClick={() => navigate('/tax/summary')}>
                전체 {pendingReports.length}건 보기 →
              </S.ViewAllButton>
            )}
          </S.PendingSection>
        </S.Section>
      )}

      {/* 카테고리별 요약 */}
      {summary && summary.length > 0 && (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>카테고리별 요약</S.SectionTitle>
          </S.SectionHeader>
          
          <S.ChartSection>
            {summary.map((item, idx) => (
              <S.CategoryItem key={idx}>
                <S.CategoryIcon color={getCategoryColor(idx)}>
                  {getCategoryIcon(item.category)}
                </S.CategoryIcon>
                <S.CategoryInfo>
                  <S.CategoryName>{item.category}</S.CategoryName>
                  <S.CategoryAmount>
                    {item.count}건
                  </S.CategoryAmount>
                </S.CategoryInfo>
                <S.CategoryRatio>
                  {item.totalAmount.toLocaleString()}원
                </S.CategoryRatio>
              </S.CategoryItem>
            ))}
          </S.ChartSection>
        </S.Section>
      )}

      {/* 빠른 액션 그리드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>빠른 액션</S.SectionTitle>
        </S.SectionHeader>
        
        <S.ActionGrid>
          <S.ActionCard onClick={() => navigate('/tax/summary')}>
            <S.ActionIcon>📊</S.ActionIcon>
            <S.ActionLabel>세무 요약</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/expenses')}>
            <S.ActionIcon>📋</S.ActionIcon>
            <S.ActionLabel>지출결의서</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/expense-categories')}>
            <S.ActionIcon>🏷️</S.ActionIcon>
            <S.ActionLabel>지출 항목 관리</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/account-codes')}>
            <S.ActionIcon>🔢</S.ActionIcon>
            <S.ActionLabel>계정과목 매핑</S.ActionLabel>
          </S.ActionCard>
        </S.ActionGrid>
      </S.Section>
    </S.MobileContainer>
  );
};

const getCategoryColor = (index) => {
  const colors = ['#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#FF9800'];
  return colors[index % colors.length];
};

const getCategoryIcon = (category) => {
  const icons = {
    '식비': '🍽️',
    '교통비': '🚗',
    '통신비': '📱',
    '사무용품': '📎',
    '접대비': '🍷',
    '출장비': '✈️',
    '복리후생비': '🎁',
    '광고선전비': '📢',
    '기타': '📦'
  };
  return icons[category] || '📊';
};

export default MobileTaxAccountantDashboard;

