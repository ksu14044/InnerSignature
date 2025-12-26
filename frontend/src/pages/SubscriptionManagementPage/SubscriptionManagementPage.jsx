import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { getCurrentSubscription, cancelSubscription, updateSubscription } from '../../api/subscriptionApi';
import { getPlans } from '../../api/subscriptionApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PaymentConfirmModal from '../../components/PaymentConfirmModal/PaymentConfirmModal';
import * as S from './style';

const SubscriptionManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'CEO' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subscriptionRes, plansRes] = await Promise.all([
        getCurrentSubscription().catch(() => ({ success: false, data: null })),
        getPlans()
      ]);
      
      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data);
      } else if (subscriptionRes.success === false && subscriptionRes.message) {
        // 구독이 없는 경우는 정상적인 상태이므로 에러로 처리하지 않음
      }
      
      if (plansRes.success) {
        setPlans(plansRes.data || []);
        if (!plansRes.data || plansRes.data.length === 0) {
          setError('표시할 플랜이 없습니다. 관리자에게 문의해주세요.');
        }
      } else {
        setError(plansRes.message || '플랜 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !window.confirm('정말로 구독을 취소하시겠습니까?')) {
      return;
    }

    try {
      const res = await cancelSubscription(subscription.subscriptionId);
      if (res.success) {
        alert('구독이 취소되었습니다.');
        loadData();
      } else {
        alert(res.message || '구독 취소에 실패했습니다.');
      }
    } catch (err) {
      alert('구독 취소 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleChangePlan = (planId) => {
    if (!subscription || updating) return;

    const plan = plans.find(p => p.planId === planId);
    if (!plan) return;

    // 현재 플랜과 같은 경우
    if (plan.planId === subscription.planId) {
      return;
    }

    // 현재 플랜 가격 확인
    const currentPlanPrice = subscription.plan?.price || 0;
    const isDowngrade = plan.price < currentPlanPrice;

    // 다운그레이드인 경우 (가격 하락)
    if (isDowngrade) {
      const changeDate = subscription.endDate || new Date().toISOString().split('T')[0];
      if (window.confirm(
        `플랜을 ${plan.planName}로 변경하시겠습니까?\n\n` +
        `현재 플랜은 ${changeDate}까지 유지되며, 이후 ${plan.planName}로 자동 전환됩니다.`
      )) {
        handleUpdateSubscription(planId);
      }
      return;
    }

    // 무료 플랜으로 변경하는 경우 (업그레이드가 아닌 특수 케이스)
    if (plan.price === 0) {
      if (window.confirm('무료 플랜으로 변경하시겠습니까?')) {
        handleUpdateSubscription(planId);
      }
      return;
    }

    // 업그레이드인 경우 (가격 상승) - 결제 확인 모달 표시
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleUpdateSubscription = async (planId) => {
    if (!subscription) return;

    try {
      setUpdating(true);
      const res = await updateSubscription(subscription.subscriptionId, planId, subscription.autoRenew);
      if (res.success) {
        // 다운그레이드인 경우 다른 메시지 표시
        const currentPlanPrice = subscription.plan?.price || 0;
        const newPlan = plans.find(p => p.planId === planId);
        const isDowngrade = newPlan && newPlan.price < currentPlanPrice;
        
        if (isDowngrade) {
          const changeDate = res.data?.endDate || subscription.endDate;
          alert(`플랜 변경이 예약되었습니다.\n\n현재 플랜은 ${changeDate}까지 유지되며, 이후 ${newPlan?.planName || '새 플랜'}으로 자동 전환됩니다.`);
        } else {
          alert('플랜이 변경되었습니다.');
        }
        setShowPaymentModal(false);
        setSelectedPlan(null);
        loadData();
      } else {
        alert(res.message || '플랜 변경에 실패했습니다.');
      }
    } catch (err) {
      alert('플랜 변경 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentConfirm = () => {
    if (selectedPlan) {
      handleUpdateSubscription(selectedPlan.planId);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>구독 관리</S.Title>
        </S.HeaderLeft>
        <S.HeaderRight>
          <S.ProfileButton onClick={() => navigate('/profile')}>
            <FaUser /> 내 정보
          </S.ProfileButton>
        </S.HeaderRight>
      </S.Header>

      {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

      {subscription ? (
        <S.SubscriptionInfo>
          <S.InfoSection>
            <S.InfoLabel>현재 플랜</S.InfoLabel>
            <S.InfoValue>{subscription.plan?.planName || '알 수 없음'}</S.InfoValue>
          </S.InfoSection>
          
          <S.InfoSection>
            <S.InfoLabel>구독 상태</S.InfoLabel>
            <S.InfoValue>
              <S.StatusBadge status={subscription.status}>
                {subscription.status === 'ACTIVE' ? '활성' : 
                 subscription.status === 'EXPIRED' ? '만료' : 
                 subscription.status === 'CANCELLED' ? '취소됨' : subscription.status}
              </S.StatusBadge>
            </S.InfoValue>
          </S.InfoSection>

          <S.InfoSection>
            <S.InfoLabel>시작일</S.InfoLabel>
            <S.InfoValue>{subscription.startDate || '-'}</S.InfoValue>
          </S.InfoSection>

          <S.InfoSection>
            <S.InfoLabel>만료일</S.InfoLabel>
            <S.InfoValue>
              {subscription.endDate ? (
                <S.ExpiryContainer>
                  <span>{subscription.endDate}</span>
                  {(() => {
                    const endDate = new Date(subscription.endDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    endDate.setHours(0, 0, 0, 0);
                    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (daysLeft < 0) {
                      return <S.DangerBadge>만료됨</S.DangerBadge>;
                    } else if (daysLeft <= 7) {
                      return <S.WarningBadge>⚠️ {daysLeft}일 남음</S.WarningBadge>;
                    } else if (daysLeft <= 30) {
                      return <S.InfoBadge>{daysLeft}일 남음</S.InfoBadge>;
                    }
                    return null;
                  })()}
                </S.ExpiryContainer>
              ) : (
                '-'
              )}
            </S.InfoValue>
          </S.InfoSection>

          <S.InfoSection>
            <S.InfoLabel>자동 갱신</S.InfoLabel>
            <S.InfoValue>{subscription.autoRenew ? '예' : '아니오'}</S.InfoValue>
          </S.InfoSection>

          {subscription.plan && (
            <S.InfoSection>
              <S.InfoLabel>최대 사용자 수</S.InfoLabel>
              <S.InfoValue>
                {subscription.plan.maxUsers ? `${subscription.plan.maxUsers}명` : '무제한'}
              </S.InfoValue>
            </S.InfoSection>
          )}

          {/* 다운그레이드 예정 안내 */}
          {subscription.pendingPlanId && subscription.pendingPlan && subscription.pendingChangeDate && (
            <S.PendingPlanNotice>
              <S.NoticeIcon>ℹ️</S.NoticeIcon>
              <S.NoticeContent>
                <S.NoticeTitle>플랜 변경 예정</S.NoticeTitle>
                <S.NoticeText>
                  {subscription.pendingChangeDate}부터 <strong>{subscription.pendingPlan.planName}</strong>로 자동 전환됩니다.
                  <br />
                  현재는 <strong>{subscription.plan?.planName}</strong>이 {subscription.pendingChangeDate}까지 유지됩니다.
                </S.NoticeText>
              </S.NoticeContent>
            </S.PendingPlanNotice>
          )}

          <S.Actions>
            <S.PlanChangeSection>
              <S.SectionTitle>플랜 변경</S.SectionTitle>
              {plans.map(plan => (
                <S.PlanCard 
                  key={plan.planId}
                  selected={plan.planId === subscription.planId}
                  onClick={() => plan.planId !== subscription.planId && handleChangePlan(plan.planId)}
                >
                  <S.PlanName>{plan.planName}</S.PlanName>
                  <S.PlanPrice>
                    {plan.price === 0 ? '무료' : `월 ${plan.price.toLocaleString()}원`}
                  </S.PlanPrice>
                  <S.PlanUsers>
                    최대 {plan.maxUsers ? `${plan.maxUsers}명` : '무제한'}
                  </S.PlanUsers>
                </S.PlanCard>
              ))}
            </S.PlanChangeSection>

            <S.CancelButton onClick={handleCancelSubscription}>
              구독 취소
            </S.CancelButton>
          </S.Actions>
        </S.SubscriptionInfo>
      ) : (
        <S.NoSubscription>
          <S.NoSubscriptionText>활성 구독이 없습니다.</S.NoSubscriptionText>
          <S.CreateButton onClick={() => navigate('/subscriptions/plans')}>
            플랜 선택하기
          </S.CreateButton>
        </S.NoSubscription>
      )}

      <PaymentConfirmModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onConfirm={handlePaymentConfirm}
        isProcessing={updating}
      />
    </S.Container>
  );
};

export default SubscriptionManagementPage;

