import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { STATUS_KOREAN } from '../../constants/status';
import 'swiper/css';
import 'swiper/css/pagination';
import * as S from './style';

const MobileCEODashboard = ({ 
  dashboardStats, 
  statusStats, 
  categoryRatio, 
  pendingUsers,
  monthlyTrend 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');

  // 상태별 색상 매핑
  const getStatusColor = (index) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'];
    return colors[index % colors.length];
  };

  // 카테고리별 색상 매핑
  const getCategoryColor = (index) => {
    const colors = ['#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#FF9800'];
    return colors[index % colors.length];
  };

  // 카테고리별 아이콘 매핑
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

  // 상태별 차트 데이터 변환
  const statusChartData = statusStats.map(item => ({
    name: STATUS_KOREAN[item.status] || item.status,
    count: item.count,
    totalAmount: item.totalAmount,
    status: item.status
  }));

  // 카테고리 차트 데이터 변환
  const categoryChartData = categoryRatio.map(item => ({
    name: item.category,
    amount: item.amount,
    ratio: item.ratio
  }));

  // 전체 금액 계산 (비율 표시용)
  const totalCategoryAmount = categoryChartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <S.MobileContainer>
      {/* 승인 대기 사용자 알림 배너 */}
      {pendingUsers && pendingUsers.length > 0 && (
        <S.AlertBanner onClick={() => navigate('/users')}>
          <S.AlertIcon>👥</S.AlertIcon>
          <S.AlertContent>
            <S.AlertTitle>승인 대기 사용자</S.AlertTitle>
            <S.AlertCount>{pendingUsers.length}명</S.AlertCount>
          </S.AlertContent>
          <S.AlertArrow>→</S.AlertArrow>
        </S.AlertBanner>
      )}

      {/* 스와이프 가능한 통계 카드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>경영 지표</S.SectionTitle>
        </S.SectionHeader>
        
        {dashboardStats && (
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
                    {(dashboardStats.totalAmount || 0).toLocaleString()}원
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
              
              <SwiperSlide>
                <S.StatCard color="#2196F3">
                  <S.StatIcon>📊</S.StatIcon>
                  <S.StatLabel>총 건수</S.StatLabel>
                  <S.StatValue>
                    {(dashboardStats.totalCount || 0).toLocaleString()}건
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
              
              <SwiperSlide>
                <S.StatCard color="#FF9800">
                  <S.StatIcon>📈</S.StatIcon>
                  <S.StatLabel>평균 금액</S.StatLabel>
                  <S.StatValue>
                    {Math.round(dashboardStats.averageAmount || 0).toLocaleString()}원
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
              
              <SwiperSlide>
                <S.StatCard color="#F44336">
                  <S.StatIcon>⏳</S.StatIcon>
                  <S.StatLabel>진행 중</S.StatLabel>
                  <S.StatValue>
                    {(dashboardStats.pendingCount || 0).toLocaleString()}건
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
            </Swiper>
          </S.SwiperWrapper>
        )}
      </S.Section>

      {/* 탭 네비게이션 */}
      {(statusChartData.length > 0 || categoryChartData.length > 0) && (
        <>
          <S.TabContainer>
            <S.Tab 
              active={activeTab === 'stats'} 
              onClick={() => setActiveTab('stats')}
            >
              상태별 통계
            </S.Tab>
            <S.Tab 
              active={activeTab === 'category'} 
              onClick={() => setActiveTab('category')}
            >
              카테고리 비중
            </S.Tab>
          </S.TabContainer>

          {/* 차트 영역 - 모바일 최적화된 간단한 형태 */}
          <S.Section>
            {activeTab === 'stats' && statusChartData.length > 0 && (
              <S.ChartSection>
                {statusChartData.map((stat, idx) => {
                  const maxAmount = Math.max(...statusChartData.map(s => s.totalAmount));
                  const barWidth = maxAmount > 0 ? (stat.totalAmount / maxAmount) * 100 : 0;
                  
                  return (
                    <S.StatusItem key={stat.status}>
                      <S.StatusInfo>
                        <S.StatusName>{stat.name}</S.StatusName>
                        <S.StatusCount>{stat.count}건</S.StatusCount>
                      </S.StatusInfo>
                      <S.StatusBar>
                        <S.StatusBarFill 
                          width={barWidth}
                          color={getStatusColor(idx)}
                        />
                      </S.StatusBar>
                      <S.StatusAmount>
                        {stat.totalAmount.toLocaleString()}원
                      </S.StatusAmount>
                    </S.StatusItem>
                  );
                })}
              </S.ChartSection>
            )}

            {activeTab === 'category' && categoryChartData.length > 0 && (
              <S.ChartSection>
                {categoryChartData.map((cat, idx) => (
                  <S.CategoryItem key={cat.name}>
                    <S.CategoryIcon color={getCategoryColor(idx)}>
                      {getCategoryIcon(cat.name)}
                    </S.CategoryIcon>
                    <S.CategoryInfo>
                      <S.CategoryName>{cat.name}</S.CategoryName>
                      <S.CategoryAmount>
                        {cat.amount.toLocaleString()}원
                      </S.CategoryAmount>
                    </S.CategoryInfo>
                    <S.CategoryRatio>
                      {(cat.ratio * 100).toFixed(1)}%
                    </S.CategoryRatio>
                  </S.CategoryItem>
                ))}
              </S.ChartSection>
            )}

            {activeTab === 'stats' && statusChartData.length === 0 && (
              <S.ChartSection>
                <S.EmptyState>
                  <S.EmptyIcon>📊</S.EmptyIcon>
                  <S.EmptyText>표시할 상태별 통계가 없습니다</S.EmptyText>
                </S.EmptyState>
              </S.ChartSection>
            )}

            {activeTab === 'category' && categoryChartData.length === 0 && (
              <S.ChartSection>
                <S.EmptyState>
                  <S.EmptyIcon>📦</S.EmptyIcon>
                  <S.EmptyText>표시할 카테고리 통계가 없습니다</S.EmptyText>
                </S.EmptyState>
              </S.ChartSection>
            )}
          </S.Section>
        </>
      )}

      {/* 빠른 액션 그리드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>관리 기능</S.SectionTitle>
        </S.SectionHeader>
        
        <S.ActionGrid>
          <S.ActionCard onClick={() => navigate('/users')}>
            <S.ActionIcon>👥</S.ActionIcon>
            <S.ActionLabel>사용자 관리</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/subscriptions/manage')}>
            <S.ActionIcon>💳</S.ActionIcon>
            <S.ActionLabel>구독 관리</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/budget')}>
            <S.ActionIcon>💰</S.ActionIcon>
            <S.ActionLabel>예산 관리</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/audit-rules')}>
            <S.ActionIcon>🛡️</S.ActionIcon>
            <S.ActionLabel>감사 규칙</S.ActionLabel>
          </S.ActionCard>
        </S.ActionGrid>
      </S.Section>
    </S.MobileContainer>
  );
};

export default MobileCEODashboard;


