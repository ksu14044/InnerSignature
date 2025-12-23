import { useState } from 'react';
import { createCompany, checkBusinessRegNoDuplicate } from '../../api/companyApi';
import { FaTimes, FaBuilding, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import * as S from './style';

const CompanyRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [companyName, setCompanyName] = useState('');
  const [businessRegNo, setBusinessRegNo] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateCheckStatus, setDuplicateCheckStatus] = useState(null); // null, 'checking', 'available', 'duplicate'

  // 사업자등록번호 포맷팅 (하이픈 자동 추가)
  const formatBusinessRegNo = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  const handleBusinessRegNoChange = (e) => {
    const formatted = formatBusinessRegNo(e.target.value);
    setBusinessRegNo(formatted);
    setDuplicateCheckStatus(null); // 입력 변경 시 중복 확인 상태 초기화
  };

  const handleCheckDuplicate = async () => {
    if (!businessRegNo.trim()) {
      alert('사업자등록번호를 입력해주세요.');
      return;
    }

    const numbersOnly = businessRegNo.replace(/[^0-9]/g, '');
    if (numbersOnly.length !== 10) {
      alert('사업자등록번호는 10자리 숫자여야 합니다.');
      return;
    }

    try {
      setIsCheckingDuplicate(true);
      setDuplicateCheckStatus('checking');
      const response = await checkBusinessRegNoDuplicate(numbersOnly);
      if (response.success && response.data?.isDuplicate === false) {
        setDuplicateCheckStatus('available');
      } else {
        setDuplicateCheckStatus('duplicate');
      }
    } catch (error) {
      if (error?.response?.data?.message?.includes('이미 등록된')) {
        setDuplicateCheckStatus('duplicate');
      } else {
        console.error('중복 확인 실패:', error);
        alert('중복 확인 중 오류가 발생했습니다.');
        setDuplicateCheckStatus(null);
      }
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCreating || !companyName.trim() || !businessRegNo.trim() || !representativeName.trim()) return;

    const numbersOnly = businessRegNo.replace(/[^0-9]/g, '');
    if (numbersOnly.length !== 10) {
      alert('사업자등록번호는 10자리 숫자여야 합니다.');
      return;
    }

    // 중복 확인을 하지 않았거나 중복인 경우 경고
    if (duplicateCheckStatus !== 'available') {
      if (duplicateCheckStatus === null) {
        const proceed = window.confirm('사업자등록번호 중복 확인을 하지 않았습니다. 계속하시겠습니까?');
        if (!proceed) return;
      } else if (duplicateCheckStatus === 'duplicate') {
        alert('이미 등록된 사업자등록번호입니다. 다른 번호를 입력해주세요.');
        return;
      }
    }

    try {
      setIsCreating(true);
      const response = await createCompany(companyName.trim(), numbersOnly, representativeName.trim());
      if (response.success) {
        alert('회사가 등록되었습니다. 기본 무료 플랜이 자동으로 할당되었습니다.');
        setCompanyName('');
        setBusinessRegNo('');
        setRepresentativeName('');
        setDuplicateCheckStatus(null);
        onClose();
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        alert(response.message || '회사 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 등록 실패:', error);
      const errorMessage = error?.response?.data?.message || '회사 등록 중 오류가 발생했습니다.';
      alert(errorMessage);
      // 중복 에러인 경우 상태 업데이트
      if (errorMessage.includes('이미 등록된 사업자등록번호')) {
        setDuplicateCheckStatus('duplicate');
      }
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

            <S.InputGroup>
              <label>사업자등록번호 *</label>
              <S.InputWithButton>
                <S.Input
                  type="text"
                  placeholder="123-45-67890"
                  value={businessRegNo}
                  onChange={handleBusinessRegNoChange}
                  maxLength="12"
                  required
                  style={{
                    borderColor: duplicateCheckStatus === 'duplicate' ? '#dc3545' : 
                                 duplicateCheckStatus === 'available' ? '#28a745' : undefined
                  }}
                />
                <S.CheckButton 
                  type="button" 
                  onClick={handleCheckDuplicate}
                  disabled={isCheckingDuplicate || !businessRegNo.trim()}
                  status={duplicateCheckStatus}
                >
                  {isCheckingDuplicate ? '확인 중...' : '중복확인'}
                </S.CheckButton>
              </S.InputWithButton>
              {duplicateCheckStatus === 'available' && (
                <S.StatusMessage status="success">
                  <FaCheck /> 사용 가능한 사업자등록번호입니다.
                </S.StatusMessage>
              )}
              {duplicateCheckStatus === 'duplicate' && (
                <S.StatusMessage status="error">
                  <FaExclamationTriangle /> 이미 등록된 사업자등록번호입니다.
                </S.StatusMessage>
              )}
            </S.InputGroup>

            <S.InputGroup>
              <label>대표자 이름 *</label>
              <S.Input
                type="text"
                placeholder="대표자 이름을 입력하세요"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                required
              />
            </S.InputGroup>

            <S.InfoText>
              회사 등록 시 기본 무료 플랜(최대 3명)이 자동으로 할당됩니다.
              플랜 변경은 구독 관리 페이지에서 가능합니다.
            </S.InfoText>

            <S.ButtonGroup>
              <S.CancelButton type="button" onClick={onClose} disabled={isCreating}>
                취소
              </S.CancelButton>
              <S.SubmitButton type="submit" disabled={isCreating || !companyName.trim() || !businessRegNo.trim() || !representativeName.trim()}>
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

