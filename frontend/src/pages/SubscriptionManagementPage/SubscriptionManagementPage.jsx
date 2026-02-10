import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import { getCurrentSubscription, cancelSubscription, updateSubscription, getPlans, createSubscription, getPayments } from '../../api/subscriptionApi';
import { getCredits, getTotalAvailableAmount } from '../../api/creditApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PaymentConfirmModal from '../../components/PaymentConfirmModal/PaymentConfirmModal';
import PageHeader from '../../components/PageHeader/PageHeader';
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
  const [totalCredit, setTotalCredit] = useState(0);
  const [activeTab, setActiveTab] = useState('subscription'); // 'subscription', 'plans', 'payments', 'credits'
  const [payments, setPayments] = useState([]);
  const [credits, setCredits] = useState([]);
  const [creating, setCreating] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'CEO' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subscriptionRes, plansRes, creditRes, totalCreditRes] = await Promise.all([
        getCurrentSubscription().catch(() => ({ success: false, data: null })),
        getPlans(),
        getCredits().catch(() => ({ success: false, data: [] })),
        getTotalAvailableAmount().catch(() => ({ success: false, data: null }))
      ]);
      
      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data);
        setCurrentSubscription(subscriptionRes.data);
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
      
      if (creditRes.success) {
        setCredits(creditRes.data || []);
      }
      
      if (totalCreditRes.success && totalCreditRes.data) {
        setTotalCredit(totalCreditRes.data.totalAmount || 0);
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const res = await getPayments();
      if (res.success) {
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error('결제 내역 로드 실패:', err);
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

  const handleSelectPlan = (planId) => {
    if (creating) return;
    
    if (subscription) {
      if (!window.confirm('이미 활성 구독이 있습니다. 플랜을 변경하시겠습니까?')) {
        setActiveTab('subscription');
        return;
      }
      setActiveTab('subscription');
      handleChangePlan(planId);
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
        setActiveTab('subscription');
        loadData();
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': '대기 중',
      'COMPLETED': '완료',
      'FAILED': '실패',
      'REFUNDED': '환불됨'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#ffc107',
      'COMPLETED': '#28a745',
      'FAILED': '#dc3545',
      'REFUNDED': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'CARD': '카드',
      'CREDIT_USED': '크레딧 사용',
      'BANK_TRANSFER': '계좌이체'
    };
    return labels[method] || method || '-';
  };

  const getPaymentMethodColor = (method) => {
    if (method === 'CREDIT_USED') {
      return '#28a745';
    }
    return '#6c757d';
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 30;
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <S.Container>
      <PageHeader title="구독" />
      
      {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

      {/* 탭 헤더 바 */}
      <S.TabHeaderBar>
        <S.TabSection>
          <S.TabButton active={activeTab === 'subscription'} onClick={() => setActiveTab('subscription')}>
            현재 구독
          </S.TabButton>
          <S.TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')}>
            플랜 선택
          </S.TabButton>
          <S.TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
            결제 내역
          </S.TabButton>
          <S.TabButton active={activeTab === 'credits'} onClick={() => setActiveTab('credits')}>
            크레딧 관리
          </S.TabButton>
        </S.TabSection>
      </S.TabHeaderBar>

      {/* 현재 구독 탭 */}
      {activeTab === 'subscription' && (subscription ? (
        <>
          {/* 현재 구독 정보 카드 */}
          <S.SubscriptionInfo>
            <S.SubscriptionCardHeader>
              <S.SubscriptionCardTitle>현재 구독</S.SubscriptionCardTitle>
            </S.SubscriptionCardHeader>
            <S.SubscriptionCardContent>
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
                          return <S.WarningBadge>{daysLeft}일 남음</S.WarningBadge>;
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

              <S.InfoSection>
                <S.InfoLabel>사용 가능한 크레딧</S.InfoLabel>
                <S.InfoValue>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <S.CreditAmount>{totalCredit.toLocaleString()}원</S.CreditAmount>
                    <S.CreditLink onClick={() => setActiveTab('credits')}>
                      크레딧 내역 보기
                    </S.CreditLink>
                  </div>
                </S.InfoValue>
              </S.InfoSection>
            </S.SubscriptionCardContent>
          </S.SubscriptionInfo>

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

          {/* 플랜 변경 섹션 */}
          <S.PlanChangeSection>
            <S.PlanChangeHeader>
              <S.SectionTitle>플랜 변경</S.SectionTitle>
            </S.PlanChangeHeader>
            <S.PlanChangeContent>
              <S.PlansGrid>
                {plans.map(plan => {
                  const isCurrent = plan.planId === subscription.planId;
                  return (
                    <S.PlanCardItemWrapper key={plan.planId}>
                      {plan.planCode === 'PRO' && (
                        <S.RecommendedBadge>
                          <S.RecommendedText>추천</S.RecommendedText>
                        </S.RecommendedBadge>
                      )}
                      <S.PlanCardContainer>
                        <S.PlanCardWrapper featured={plan.planCode === 'PRO'}>
                        <S.PlanCard 
                          featured={plan.planCode === 'PRO'}
                          onClick={() => !isCurrent && handleChangePlan(plan.planId)}
                        >
                        {isCurrent && <S.CurrentPlanBadge>현재 플랜</S.CurrentPlanBadge>}
                      <S.PlanHeader>
                        <S.PlanName>{plan.planName}</S.PlanName>
                        <S.PlanPrice>
                          {plan.price === 0 ? (
                            <S.FreePrice>무료</S.FreePrice>
                          ) : (
                            <>
                              <S.PriceAmount featured={plan.planCode === 'PRO'}>{plan.price.toLocaleString()}</S.PriceAmount>
                              <S.PriceUnit>/월</S.PriceUnit>
                            </>
                          )}
                        </S.PlanPrice>
                      </S.PlanHeader>
                      <S.PlanFeatures>
                        {plan.maxUsers && (
                          <S.Feature>
                            <S.FeatureIcon>ㆍ</S.FeatureIcon>
                            <S.FeatureText>사용자 최대 {plan.maxUsers}명</S.FeatureText>
                          </S.Feature>
                        )}
                        {!plan.maxUsers && (
                          <S.Feature>
                            <S.FeatureIcon>ㆍ</S.FeatureIcon>
                            <S.FeatureText>사용자 무제한</S.FeatureText>
                          </S.Feature>
                        )}
                        {plan.features && Object.entries(plan.features).map(([key, value]) => (
                          value && (
                            <S.Feature key={key}>
                              <S.FeatureIcon>ㆍ</S.FeatureIcon>
                              <S.FeatureText>
                                {key === 'expense_tracking' ? '지출 관리' :
                                 key === 'tax_report' ? '세무 보고서' :
                                 key === 'audit_log' ? '감사로그' :
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
                            featured={plan.planCode === 'PRO'}
                            onClick={(e) => { e.stopPropagation(); handleChangePlan(plan.planId); }}
                          >
                            플랜 변경
                          </S.SelectButton>
                        )}
                      </S.PlanAction>
                        </S.PlanCard>
                        </S.PlanCardWrapper>
                      </S.PlanCardContainer>
                    </S.PlanCardItemWrapper>
                  );
                })}
              </S.PlansGrid>
            </S.PlanChangeContent>
          </S.PlanChangeSection>

          {/* 구독 취소 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <S.CancelButton onClick={handleCancelSubscription}>
              구독 취소
            </S.CancelButton>
          </div>
        </>
      ) : (
        <S.NoSubscription>
          <S.NoSubscriptionText>활성 구독이 없습니다.</S.NoSubscriptionText>
          <S.CreateButton onClick={() => navigate('/subscriptions/plans')}>
            플랜 선택하기
          </S.CreateButton>
        </S.NoSubscription>
      ))}

      {/* 플랜 선택 탭 */}
      {activeTab === 'plans' && (
        <S.PlansTabContent>
          {plans.length === 0 ? (
            <S.EmptyState>
              <S.EmptyText>표시할 플랜이 없습니다. 관리자에게 문의해주세요.</S.EmptyText>
            </S.EmptyState>
          ) : (
            <S.PlansGrid>
              {plans.map(plan => {
                const isCurrent = currentSubscription?.planId === plan.planId;
                return (
                  <S.PlanCardItemWrapper key={plan.planId}>
                    {plan.planCode === 'PRO' && (
                      <S.RecommendedBadge>
                        <S.RecommendedText>추천</S.RecommendedText>
                      </S.RecommendedBadge>
                    )}
                    <S.PlanCardContainer>
                      <S.PlanCardWrapper featured={plan.planCode === 'PRO'}>
                        <S.PlanCard featured={plan.planCode === 'PRO'}>
                        {isCurrent && <S.CurrentPlanBadge>현재 플랜</S.CurrentPlanBadge>}
                    <S.PlanHeader>
                      <S.PlanName>{plan.planName}</S.PlanName>
                      <S.PlanPrice>
                        {plan.price === 0 ? (
                          <S.FreePrice>무료</S.FreePrice>
                        ) : (
                          <>
                            <S.PriceAmount featured={plan.planCode === 'PRO'}>{plan.price.toLocaleString()}</S.PriceAmount>
                            <S.PriceUnit>/월</S.PriceUnit>
                          </>
                        )}
                      </S.PlanPrice>
                    </S.PlanHeader>
                    <S.PlanFeatures>
                      {plan.maxUsers && (
                        <S.Feature>
                          <S.FeatureIcon>ㆍ</S.FeatureIcon>
                          <S.FeatureText>사용자 최대 {plan.maxUsers}명</S.FeatureText>
                        </S.Feature>
                      )}
                      {!plan.maxUsers && (
                        <S.Feature>
                          <S.FeatureIcon>ㆍ</S.FeatureIcon>
                          <S.FeatureText>사용자 무제한</S.FeatureText>
                        </S.Feature>
                      )}
                      {plan.features && Object.entries(plan.features).map(([key, value]) => (
                        value && (
                          <S.Feature key={key}>
                            <S.FeatureIcon>ㆍ</S.FeatureIcon>
                            <S.FeatureText>
                              {key === 'expense_tracking' ? '지출 관리' :
                               key === 'tax_report' ? '세무보고서' :
                               key === 'audit_log' ? '감사로그' :
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
                          featured={plan.planCode === 'PRO'}
                          onClick={() => handleSelectPlan(plan.planId)}
                          disabled={creating}
                        >
                          {creating ? '처리 중...' : plan.price === 0 ? '무료 플랜 이용하기' : '결제하기'}
                        </S.SelectButton>
                      )}
                    </S.PlanAction>
                        </S.PlanCard>
                      </S.PlanCardWrapper>
                    </S.PlanCardContainer>
                  </S.PlanCardItemWrapper>
                );
              })}
            </S.PlansGrid>
          )}
        </S.PlansTabContent>
      )}

      {/* 결제 내역 탭 */}
      {activeTab === 'payments' && (
        <S.PaymentsTabContent>
          {payments.length === 0 ? (
            <S.EmptyState>
              <S.EmptyText>결제 내역이 없습니다.</S.EmptyText>
            </S.EmptyState>
          ) : (
            <S.PaymentsTable>
              <S.TableHeader>
                <S.TableRow>
                  <S.TableHeaderCell>결제일</S.TableHeaderCell>
                  <S.TableHeaderCell>금액</S.TableHeaderCell>
                  <S.TableHeaderCell>결제수단</S.TableHeaderCell>
                  <S.TableHeaderCell>상태</S.TableHeaderCell>
                </S.TableRow>
              </S.TableHeader>
              <S.TableBody>
                {payments.map(payment => (
                  <S.TableRow key={payment.paymentId}>
                    <S.TableCell>{formatDate(payment.paymentDate)}</S.TableCell>
                    <S.TableCell style={{ fontWeight: '500', textAlign: 'right' }}>{payment.amount?.toLocaleString()}원</S.TableCell>
                    <S.TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</S.TableCell>
                    <S.TableCell>{getStatusLabel(payment.paymentStatus)}</S.TableCell>
                  </S.TableRow>
                ))}
              </S.TableBody>
            </S.PaymentsTable>
          )}
        </S.PaymentsTabContent>
      )}

      {/* 크레딧 관리 탭 */}
      {activeTab === 'credits' && (
        <S.CreditsTabContent>
          <S.TotalCreditCard>
            <S.TotalCreditLabel>사용 가능한 크레딧</S.TotalCreditLabel>
            <S.TotalCreditAmount>{totalCredit.toLocaleString()}원</S.TotalCreditAmount>
          </S.TotalCreditCard>
          {credits.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <S.EmptyText>크레딧 내역이 없습니다.</S.EmptyText>
            </div>
          ) : (
            <S.CreditsTable>
              <S.TableHeader>
                <S.TableRow>
                  <S.TableHeaderCell>발생 사유</S.TableHeaderCell>
                  <S.TableHeaderCell>총 금액</S.TableHeaderCell>
                  <S.TableHeaderCell>사용 금액</S.TableHeaderCell>
                  <S.TableHeaderCell>사용 가능</S.TableHeaderCell>
                  <S.TableHeaderCell>만료일</S.TableHeaderCell>
                  <S.TableHeaderCell>생성일</S.TableHeaderCell>
                </S.TableRow>
              </S.TableHeader>
              <S.TableBody>
                {credits.map(credit => {
                  const availableAmount = credit.amount - (credit.usedAmount || 0);
                  const expiringSoon = isExpiringSoon(credit.expiresAt);
                  const expired = isExpired(credit.expiresAt);
                  
                  return (
                    <S.TableRow key={credit.creditId}>
                      <S.TableCell>{credit.reason || '-'}</S.TableCell>
                      <S.TableCell>{credit.amount?.toLocaleString()}원</S.TableCell>
                      <S.TableCell>{credit.usedAmount?.toLocaleString() || 0}원</S.TableCell>
                      <S.TableCell>
                        <S.AvailableAmount available={availableAmount > 0 && !expired}>
                          {availableAmount > 0 && !expired 
                            ? `${availableAmount.toLocaleString()}원` 
                            : expired 
                            ? '만료됨' 
                            : '사용 완료'}
                        </S.AvailableAmount>
                      </S.TableCell>
                      <S.TableCell>
                        <S.ExpiryDate expired={expired} expiringSoon={expiringSoon && !expired}>
                          {credit.expiresAt 
                            ? new Date(credit.expiresAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })
                            : '만료 없음'}
                          {expiringSoon && !expired && (
                            <S.ExpiryWarning>
                              <FaExclamationTriangle /> 30일 이내 만료
                            </S.ExpiryWarning>
                          )}
                        </S.ExpiryDate>
                      </S.TableCell>
                      <S.TableCell>
                        {credit.createdAt 
                          ? new Date(credit.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : '-'}
                      </S.TableCell>
                    </S.TableRow>
                  );
                })}
              </S.TableBody>
            </S.CreditsTable>
          )}
        </S.CreditsTabContent>
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

