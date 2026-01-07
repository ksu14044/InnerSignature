import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSubscription } from '../../api/subscriptionApi';
import { getTotalAvailableAmount } from '../../api/creditApi';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import UserDashboardSection from '../../components/DashboardSections/UserDashboardSection';
import AccountantDashboardSection from '../../components/DashboardSections/AccountantDashboardSection';
import TaxAccountantDashboardSection from '../../components/DashboardSections/TaxAccountantDashboardSection';
import AdminDashboardSection from '../../components/DashboardSections/AdminDashboardSection';
import CEODashboardSection from '../../components/DashboardSections/CEODashboardSection';
import * as S from './style';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const [subscription, setSubscription] = useState(null);
  const [totalCredit, setTotalCredit] = useState(0);

  // 구독 및 크레딧 정보 로드
  useEffect(() => {
    const loadCommonData = async () => {
      try {
        const [subscriptionRes, creditRes] = await Promise.all([
          getCurrentSubscription().catch(() => ({ success: false, data: null })),
          getTotalAvailableAmount().catch(() => ({ success: false, data: null }))
        ]);

        if (subscriptionRes.success && subscriptionRes.data) {
          setSubscription(subscriptionRes.data);
        }
        if (creditRes.success && creditRes.data) {
          setTotalCredit(creditRes.data.totalAmount || 0);
        }
      } catch (err) {
        console.error('공통 데이터 로드 실패:', err);
      }
    };

    if (user) {
      loadCommonData();
    }
  }, [user]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <S.Container>
        <S.Alert>로그인이 필요합니다.</S.Alert>
        <S.Button onClick={() => navigate('/')}>로그인 페이지로 이동</S.Button>
      </S.Container>
    );
  }

  // 구독 카드 렌더링 함수
  const renderSubscriptionCard = () => {
    if (!subscription) return null;
    
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let daysLeft = null;
    if (endDate) {
      endDate.setHours(0, 0, 0, 0);
      daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    }
    
    return (
      <S.SubscriptionCard 
        data-tourid="tour-subscription-card"
        warning={daysLeft !== null && daysLeft <= 7 && daysLeft >= 0}
        danger={daysLeft !== null && daysLeft < 0}
        onClick={() => navigate('/subscriptions/manage')}
      >
        <S.SubscriptionCardHeader>
          <S.SubscriptionCardTitle>구독 상태</S.SubscriptionCardTitle>
          {subscription.status === 'ACTIVE' && (
            <S.SubscriptionStatusBadge status={subscription.status}>활성</S.SubscriptionStatusBadge>
          )}
        </S.SubscriptionCardHeader>
        <S.SubscriptionPlanName>{subscription.plan?.planName || '알 수 없음'} 플랜</S.SubscriptionPlanName>
        {subscription.endDate && (
          <S.SubscriptionExpiry>
            <S.SubscriptionExpiryLabel>만료일:</S.SubscriptionExpiryLabel>
            <S.SubscriptionExpiryDate>{subscription.endDate}</S.SubscriptionExpiryDate>
            {daysLeft !== null && (
              <>
                {daysLeft < 0 && (
                  <S.SubscriptionExpiryWarning danger>⚠️ 만료됨</S.SubscriptionExpiryWarning>
                )}
                {daysLeft >= 0 && daysLeft <= 7 && (
                  <S.SubscriptionExpiryWarning>⚠️ {daysLeft}일 남음</S.SubscriptionExpiryWarning>
                )}
                {daysLeft > 7 && daysLeft <= 30 && (
                  <S.SubscriptionExpiryInfo>{daysLeft}일 남음</S.SubscriptionExpiryInfo>
                )}
              </>
            )}
          </S.SubscriptionExpiry>
        )}
        <S.SubscriptionCardFooter>구독 관리로 이동 →</S.SubscriptionCardFooter>
      </S.SubscriptionCard>
    );
  };

  return (
    <DashboardLayout
      title="대시보드"
      showFilters={true}
      filters={filters}
      onFilterChange={handleFilterChange}
      showBackButton={true}
    >
      {/* 크레딧 카드 */}
      {totalCredit > 0 && (
        <S.CreditCard onClick={() => navigate('/credits')}>
          <S.CreditCardHeader>
            <S.CreditCardTitle>사용 가능한 크레딧</S.CreditCardTitle>
          </S.CreditCardHeader>
          <S.CreditAmount>{totalCredit.toLocaleString()}원</S.CreditAmount>
          <S.CreditCardFooter>크레딧 내역 보기 →</S.CreditCardFooter>
        </S.CreditCard>
      )}

      {/* 구독 상태 카드 */}
      {renderSubscriptionCard()}

      {/* 권한별 대시보드 섹션 */}
      {user?.role === 'USER' && <UserDashboardSection filters={filters} />}
      {user?.role === 'ACCOUNTANT' && <AccountantDashboardSection filters={filters} />}
      {user?.role === 'TAX_ACCOUNTANT' && <TaxAccountantDashboardSection filters={filters} />}
      {user?.role === 'ADMIN' && <AdminDashboardSection filters={filters} />}
      {user?.role === 'CEO' && <CEODashboardSection filters={filters} />}
    </DashboardLayout>
  );
};

export default DashboardPage;

