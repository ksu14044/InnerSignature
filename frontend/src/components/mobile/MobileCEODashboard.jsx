import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { fetchUserExpenseStats, fetchDashboardStats } from '../../api/expenseApi';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingUsers } from '../../api/userApi';
import 'swiper/css';
import 'swiper/css/pagination';
import * as S from './style';

const MobileCEODashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userExpenseStats, setUserExpenseStats] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [statsRes, userStatsRes, usersRes] = await Promise.all([
        fetchDashboardStats(),
        fetchUserExpenseStats(),
        getPendingUsers().catch(() => ({ success: false, data: [] }))
      ]);

      if (statsRes.success) {
        setDashboardStats(statsRes.data || {});
      }
      if (userStatsRes.success) {
        setUserExpenseStats(userStatsRes.data || []);
      }
      if (usersRes.success) {
        setPendingUsers(usersRes.data || []);
      }
    } catch (error) {
      console.error('모바일 대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // 사용자별 지출 차트 데이터 변환
  const userExpenseChartData = userExpenseStats.map(item => ({
    name: item.userName,
    amount: item.totalAmount
  }));

  if (loading) {
    return (
      <S.MobileContainer>
        <S.LoadingMessage>로딩 중...</S.LoadingMessage>
      </S.MobileContainer>
    );
  }

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

      {/* 사용자별 지출 합계 차트 */}
      {userExpenseChartData.length > 0 && (
        <S.Section>
          <S.SectionTitle>사용자별 지출 합계</S.SectionTitle>
          <S.ChartSection>
            {userExpenseChartData.map((user, idx) => {
              const maxAmount = Math.max(...userExpenseChartData.map(u => u.amount));
              const barWidth = maxAmount > 0 ? (user.amount / maxAmount) * 100 : 0;

              return (
                <S.StatusItem key={user.name}>
                  <S.StatusInfo>
                    <S.StatusName>{user.name}</S.StatusName>
                    <S.StatusCount></S.StatusCount>
                  </S.StatusInfo>
                  <S.StatusBar>
                    <S.StatusBarFill
                      width={barWidth}
                      color={getStatusColor(idx)}
                    />
                  </S.StatusBar>
                  <S.StatusAmount>
                    {user.amount.toLocaleString()}원
                  </S.StatusAmount>
                </S.StatusItem>
              );
            })}
          </S.ChartSection>
        </S.Section>
      )}

      {/* 빈 상태 */}
      {userExpenseChartData.length === 0 && (
        <S.Section>
          <S.EmptyState>
            <S.EmptyIcon>📊</S.EmptyIcon>
            <S.EmptyText>표시할 통계가 없습니다</S.EmptyText>
          </S.EmptyState>
        </S.Section>
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


