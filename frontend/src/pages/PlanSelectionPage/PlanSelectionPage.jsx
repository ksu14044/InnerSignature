import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlans, createSubscription, getCurrentSubscription } from '../../api/subscriptionApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PaymentConfirmModal from '../../components/PaymentConfirmModal/PaymentConfirmModal';
import * as S from './style';

const PlanSelectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      const [plansRes, subscriptionRes] = await Promise.all([
        getPlans(),
        getCurrentSubscription().catch(() => ({ success: false, data: null }))
      ]);
      
      if (plansRes.success) {
        setPlans(plansRes.data || []);
      }
      if (subscriptionRes.success && subscriptionRes.data) {
        setCurrentSubscription(subscriptionRes.data);
      }
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId) => {
    if (creating) return;
    
    if (currentSubscription) {
      if (!window.confirm('이미 활성 구독이 있습니다. 플랜을 변경하시겠습니까?')) {
        return;
      }
      navigate('/subscriptions/manage');
      return;
    }

    const plan = plans.find(p => p.planId === planId);
    if (!plan) return;

    // 무료 플랜인 경우 바로 구독 생성
    if (plan.price === 0) {
      if (window.confirm('무료 플랜으로 구독을 시작하시겠습니까?')) {
        handleCreateSubscription(planId);
      }
      return;
    }

    // 유료 플랜인 경우 결제 확인 모달 표시
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleCreateSubscription = async (planId) => {
    try {
      setCreating(true);
      const res = await createSubscription(planId, true);
      if (res.success) {
        alert('구독이 생성되었습니다.');
        setShowPaymentModal(false);
        setSelectedPlan(null);
        navigate('/subscriptions/manage');
      } else {
        alert(res.message || '구독 생성에 실패했습니다.');
      }
    } catch (err) {
      alert('구독 생성 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handlePaymentConfirm = () => {
    if (selectedPlan) {
      handleCreateSubscription(selectedPlan.planId);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>플랜 선택</S.Title>
        <S.Subtitle>회사에 맞는 플랜을 선택하세요</S.Subtitle>
      </S.Header>

      <S.PlansGrid>
        {plans.map(plan => {
          const isCurrent = currentSubscription?.planId === plan.planId;
          return (
            <S.PlanCard key={plan.planId} featured={plan.planCode === 'PRO'}>
              {plan.planCode === 'PRO' && <S.FeaturedBadge>추천</S.FeaturedBadge>}
              <S.PlanHeader>
                <S.PlanName>{plan.planName}</S.PlanName>
                <S.PlanPrice>
                  {plan.price === 0 ? (
                    <S.FreePrice>무료</S.FreePrice>
                  ) : (
                    <>
                      <S.PriceAmount>{plan.price.toLocaleString()}</S.PriceAmount>
                      <S.PriceUnit>원/월</S.PriceUnit>
                    </>
                  )}
                </S.PlanPrice>
              </S.PlanHeader>

              <S.PlanFeatures>
                <S.Feature>
                  <S.FeatureIcon>✓</S.FeatureIcon>
                  <S.FeatureText>
                    최대 {plan.maxUsers ? `${plan.maxUsers}명` : '무제한'} 사용자
                  </S.FeatureText>
                </S.Feature>
                {plan.features && Object.entries(plan.features).map(([key, value]) => (
                  value && (
                    <S.Feature key={key}>
                      <S.FeatureIcon>✓</S.FeatureIcon>
                      <S.FeatureText>
                        {key === 'expense_tracking' ? '지출 관리' :
                         key === 'tax_report' ? '세무 보고서' :
                         key === 'audit_log' ? '감사 로그' :
                         key === 'advanced_analytics' ? '고급 분석' :
                         key === 'priority_support' ? '우선 지원' : key}
                      </S.FeatureText>
                    </S.Feature>
                  )
                ))}
              </S.PlanFeatures>

              <S.PlanAction>
                {isCurrent ? (
                  <S.CurrentButton disabled>현재 플랜</S.CurrentButton>
                ) : (
                  <S.SelectButton 
                    onClick={() => handleSelectPlan(plan.planId)}
                    disabled={creating}
                  >
                    {creating ? '처리 중...' : plan.price === 0 ? '무료로 시작하기' : '결제하기'}
                  </S.SelectButton>
                )}
              </S.PlanAction>
            </S.PlanCard>
          );
        })}
      </S.PlansGrid>

      <PaymentConfirmModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onConfirm={handlePaymentConfirm}
        isProcessing={creating}
      />
    </S.Container>
  );
};

export default PlanSelectionPage;

