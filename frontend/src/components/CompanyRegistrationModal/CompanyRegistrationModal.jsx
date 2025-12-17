import { useState } from 'react';
import { createCompany } from '../../api/companyApi';
import { FaTimes, FaBuilding, FaCreditCard, FaTicketAlt } from 'react-icons/fa';
import * as S from './style';

const CompanyRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [companyName, setCompanyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCreating || !companyName.trim()) return;

    try {
      setIsCreating(true);
      const response = await createCompany(companyName.trim());
      if (response.success) {
        alert('회사가 등록되었습니다.');
        setCompanyName('');
        onClose();
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        alert(response.message || '회사 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 등록 실패:', error);
      alert(error?.response?.data?.message || '회사 등록 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePayment = () => {
    alert('결제 기능은 준비 중입니다.');
  };

  const handleCoupon = () => {
    alert('쿠폰 사용 기능은 준비 중입니다.');
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>회사 등록</S.ModalTitle>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <form onSubmit={handleSubmit}>
            <S.InputGroup>
              <label>회사명 *</label>
              <S.Input
                type="text"
                placeholder="회사명을 입력하세요"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                autoFocus
              />
            </S.InputGroup>

            <S.PaymentSection>
              <S.PaymentTitle>
                <FaCreditCard />
                <span>결제</span>
              </S.PaymentTitle>
              <S.PaymentButton type="button" onClick={handlePayment}>
                결제하기
              </S.PaymentButton>
            </S.PaymentSection>

            <S.PaymentSection>
              <S.PaymentTitle>
                <FaTicketAlt />
                <span>쿠폰 사용</span>
              </S.PaymentTitle>
              <S.PaymentButton type="button" onClick={handleCoupon}>
                쿠폰 사용하기
              </S.PaymentButton>
            </S.PaymentSection>

            <S.ButtonGroup>
              <S.CancelButton type="button" onClick={onClose} disabled={isCreating}>
                취소
              </S.CancelButton>
              <S.SubmitButton type="submit" disabled={isCreating || !companyName.trim()}>
                <FaBuilding />
                <span>{isCreating ? '등록 중...' : '회사 등록'}</span>
              </S.SubmitButton>
            </S.ButtonGroup>
          </form>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default CompanyRegistrationModal;

