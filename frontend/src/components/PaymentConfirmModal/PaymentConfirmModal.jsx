import { FaTimes, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import * as S from './style';

const PaymentConfirmModal = ({ isOpen, onClose, plan, onConfirm, isProcessing }) => {
  if (!isOpen || !plan) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>결제 확인</S.ModalTitle>
          <S.CloseButton onClick={onClose} disabled={isProcessing}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <S.PlanInfo>
            <S.PlanName>{plan.planName} 플랜</S.PlanName>
            <S.PriceSection>
              <S.PriceLabel>월간 요금</S.PriceLabel>
              <S.PriceAmount>{plan.price.toLocaleString()}원</S.PriceAmount>
            </S.PriceSection>
            
            <S.FeaturesList>
              <S.FeatureItem>
                <FaCheckCircle />
                <span>최대 {plan.maxUsers ? `${plan.maxUsers}명` : '무제한'} 사용자</span>
              </S.FeatureItem>
              {plan.features && Object.entries(plan.features).map(([key, value]) => (
                value && (
                  <S.FeatureItem key={key}>
                    <FaCheckCircle />
                    <span>
                      {key === 'expense_tracking' ? '지출 관리' :
                       key === 'tax_report' ? '세무 보고서' :
                       key === 'audit_log' ? '감사 로그' :
                       key === 'advanced_analytics' ? '고급 분석' :
                       key === 'priority_support' ? '우선 지원' : key}
                    </span>
                  </S.FeatureItem>
                )
              ))}
            </S.FeaturesList>
          </S.PlanInfo>

          <S.NoticeBox>
            <S.NoticeTitle>안내사항</S.NoticeTitle>
            <S.NoticeText>
              • 구독은 매월 자동으로 갱신됩니다.<br/>
              • 언제든지 구독을 취소할 수 있습니다.<br/>
              • 결제 게이트웨이 연동 전까지는 테스트 모드로 진행됩니다.
            </S.NoticeText>
          </S.NoticeBox>

          <S.ButtonGroup>
            <S.CancelButton 
              type="button" 
              onClick={onClose} 
              disabled={isProcessing}
            >
              취소
            </S.CancelButton>
            <S.ConfirmButton 
              type="button" 
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              <FaCreditCard />
              <span>{isProcessing ? '처리 중...' : '결제하기'}</span>
            </S.ConfirmButton>
          </S.ButtonGroup>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default PaymentConfirmModal;

