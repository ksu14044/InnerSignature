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
          <S.ModalTitle>결제하기</S.ModalTitle>
          <S.CloseButton onClick={onClose} disabled={isProcessing}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <S.PlanInfoBox>
            <S.PlanInfoLeft>
              <S.PlanName>{plan.planName}</S.PlanName>
              <S.PriceRow>
                <S.PriceAmount>{plan.price.toLocaleString()}원</S.PriceAmount>
                <S.PriceUnit>/월</S.PriceUnit>
              </S.PriceRow>
              <S.TaxIncluded>부가세 포함</S.TaxIncluded>
            </S.PlanInfoLeft>
            <S.FeaturesGrid>
              <S.FeaturesColumn>
                {plan.maxUsers ? (
                  <S.FeatureText>ㆍ사용자 최대 {plan.maxUsers}명</S.FeatureText>
                ) : (
                  <S.FeatureText>ㆍ사용자 무제한</S.FeatureText>
                )}
                {plan.features && plan.features.audit_log && (
                  <S.FeatureText>ㆍ감사로그</S.FeatureText>
                )}
                {plan.features && plan.features.tax_report && (
                  <S.FeatureText>ㆍ세무보고서</S.FeatureText>
                )}
              </S.FeaturesColumn>
              <S.FeaturesColumn>
                {plan.features && plan.features.expense_tracking && (
                  <S.FeatureText>ㆍ지출 관리</S.FeatureText>
                )}
                {plan.features && plan.features.priority_support && (
                  <S.FeatureText>ㆍ우선 지원</S.FeatureText>
                )}
                {plan.features && plan.features.advanced_analytics && (
                  <S.FeatureText>ㆍ고급 분석</S.FeatureText>
                )}
              </S.FeaturesColumn>
            </S.FeaturesGrid>
          </S.PlanInfoBox>

          <S.NoticeBox>
            <S.NoticeTitle>안내사항</S.NoticeTitle>
            <S.NoticeText>
              ·구독은 매월 자동으로 갱신됩니다.<br/>
              ·언제든지 구독을 취소할 수 있습니다.<br/>
              ·결제 케이트웨이 연동 전까지는 테스트 모드로 진행됩니다.
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
              {isProcessing ? '처리 중...' : '결제하기'}
            </S.ConfirmButton>
          </S.ButtonGroup>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default PaymentConfirmModal;

