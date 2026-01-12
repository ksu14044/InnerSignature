import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { fetchUserExpenseStats, fetchDashboardStats } from '../../api/expenseApi';
import { useAuth } from '../../contexts/AuthContext';
import 'swiper/css';
import 'swiper/css/pagination';
import * as S from './style';

const MobileAccountantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userExpenseStats, setUserExpenseStats] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(false);
  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [statsRes, userStatsRes] = await Promise.all([
        fetchDashboardStats(),
        fetchUserExpenseStats()
      ]);

      if (statsRes.success) {
        setDashboardStats(statsRes.data || {});
      }
      if (userStatsRes.success) {
        setUserExpenseStats(userStatsRes.data || []);
      }
    } catch (error) {
      console.error('모바일 세무 담당자 대시보드 데이터 로드 실패:', error);
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

  // 카테고리 차트 데이터 변환
  const categoryChartData = categoryRatio.map(item => ({
    name: item.category,
    amount: item.amount,
    ratio: item.ratio
  }));

  return (
    <S.MobileContainer>
      {/* 결재 대기 알림 */}
      {pendingApprovals && pendingApprovals.length > 0 && (
        <S.AlertBanner 
          onClick={() => navigate('/expenses?tab=MY_APPROVALS')}
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' }}
        >
          <S.AlertIcon>⚠️</S.AlertIcon>
          <S.AlertContent>
            <S.AlertTitle>결재 대기 건</S.AlertTitle>
            <S.AlertCount>{pendingApprovals.length}건</S.AlertCount>
          </S.AlertContent>
          <S.AlertArrow>→</S.AlertArrow>
        </S.AlertBanner>
      )}

      {/* 결제 대기 건 (APPROVED 상태) */}
      {approvedExpenses && approvedExpenses.length > 0 && (
        <S.PendingSection>
          <S.PendingHeader>
            <S.PendingTitle>
              💰 결제 대기
              <S.PendingBadge>{approvedExpenses.length}+</S.PendingBadge>
            </S.PendingTitle>
          </S.PendingHeader>
          
          {approvedExpenses.slice(0, 3).map((expense) => (
            <S.PendingItem 
              key={expense.expenseReportId}
              onClick={() => navigate(`/expenses/${expense.expenseReportId}`)}
            >
              <S.PendingItemHeader>
                <S.PendingItemName>{expense.drafterName}</S.PendingItemName>
                <S.PendingItemAmount>
                  {expense.totalAmount.toLocaleString()}원
                </S.PendingItemAmount>
              </S.PendingItemHeader>
              <S.PendingItemInfo>
                {expense.reportDate} | {expense.firstDescription || '적요 없음'}
              </S.PendingItemInfo>
            </S.PendingItem>
          ))}
          
          {approvedExpenses.length > 3 && (
            <S.ViewAllButton onClick={() => navigate('/expenses?status=APPROVED')}>
              전체 {approvedExpenses.length}건 보기 →
            </S.ViewAllButton>
          )}
        </S.PendingSection>
      )}

      {/* 스와이프 가능한 통계 카드 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>요약 통계</S.SectionTitle>
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
                  <S.StatLabel>총 금액</S.StatLabel>
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
                  <S.StatIcon>⏳</S.StatIcon>
                  <S.StatLabel>진행 중</S.StatLabel>
                  <S.StatValue>
                    {(dashboardStats.pendingCount || 0).toLocaleString()}건
                  </S.StatValue>
                </S.StatCard>
              </SwiperSlide>
              
              <SwiperSlide>
                <S.StatCard color="#9C27B0">
                  <S.StatIcon>📈</S.StatIcon>
                  <S.StatLabel>평균 금액</S.StatLabel>
                  <S.StatValue>
                    {Math.round(dashboardStats.averageAmount || 0).toLocaleString()}원
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
              사용자별 합계
            </S.Tab>
            <S.Tab 
              active={activeTab === 'category'} 
              onClick={() => setActiveTab('category')}
            >
              카테고리 비율
            </S.Tab>
          </S.TabContainer>

          {/* 차트 영역 */}
          <S.Section>
            {activeTab === 'stats' && userExpenseChartData.length > 0 && (
              <S.ChartSection>
                {userExpenseChartData.map((user, idx) => {
                  const maxAmount = Math.max(...userExpenseChartData.map(u => u.totalAmount));
                  const barWidth = maxAmount > 0 ? (user.totalAmount / maxAmount) * 100 : 0;

                  return (
                    <S.StatusItem key={user.name}>
                      <S.StatusInfo>
                        <S.StatusName>{user.name}</S.StatusName>
                        <S.StatusCount>{user.totalCount}건</S.StatusCount>
                      </S.StatusInfo>
                      <S.StatusBar>
                        <S.StatusBarFill
                          width={barWidth}
                          color={getStatusColor(idx)}
                        />
                      </S.StatusBar>
                      <S.StatusAmount>
                        {user.totalAmount.toLocaleString()}원
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

            {activeTab === 'stats' && userExpenseChartData.length === 0 && (
              <S.ChartSection>
                <S.EmptyState>
                  <S.EmptyIcon>📊</S.EmptyIcon>
                  <S.EmptyText>표시할 사용자별 통계가 없습니다</S.EmptyText>
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
          <S.SectionTitle>빠른 액션</S.SectionTitle>
        </S.SectionHeader>
        
        <S.ActionGrid>
          <S.ActionCard onClick={() => navigate('/missing-receipts')}>
            <S.ActionIcon>⚠️</S.ActionIcon>
            <S.ActionLabel>증빙 누락 관리</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/expenses?tab=MY_APPROVALS')}>
            <S.ActionIcon>📋</S.ActionIcon>
            <S.ActionLabel>결재 대기 목록</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/audit-logs')}>
            <S.ActionIcon>📊</S.ActionIcon>
            <S.ActionLabel>감사 로그</S.ActionLabel>
          </S.ActionCard>
          
          <S.ActionCard onClick={() => navigate('/tax/summary')}>
            <S.ActionIcon>📄</S.ActionIcon>
            <S.ActionLabel>세무 요약</S.ActionLabel>
          </S.ActionCard>
        </S.ActionGrid>
      </S.Section>
    </S.MobileContainer>
  );
};

export default MobileAccountantDashboard;


