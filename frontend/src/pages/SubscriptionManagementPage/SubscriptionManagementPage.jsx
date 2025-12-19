import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const [subscriptionRes, plansRes] = await Promise.all([
        getCurrentSubscription().catch(() => ({ success: false, data: null })),
        getPlans()
      ]);
      
      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data);
      }
      if (plansRes.success) {
        setPlans(plansRes.data || []);
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

    // 무료 플랜으로 변경하는 경우 바로 변경
    if (plan.price === 0) {
      if (window.confirm('무료 플랜으로 변경하시겠습니까?')) {
        handleUpdateSubscription(planId);
      }
      return;
    }

    // 유료 플랜으로 변경하는 경우 결제 확인 모달 표시
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleUpdateSubscription = async (planId) => {
    if (!subscription) return;

    try {
      setUpdating(true);
      const res = await updateSubscription(subscription.subscriptionId, planId, subscription.autoRenew);
      if (res.success) {
        alert('플랜이 변경되었습니다.');
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
        <S.Title>구독 관리</S.Title>
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

