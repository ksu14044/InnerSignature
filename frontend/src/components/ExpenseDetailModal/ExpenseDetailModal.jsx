import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaFileUpload, FaTrash } from 'react-icons/fa';
import * as S from './style';
import { getCompanyCards, getUserCards } from '../../api/cardApi';
import { formatNumber, parseFormattedNumber } from '../../utils/numberUtils';
import { splitCardNumber, combineCardNumber } from '../../utils/cardUtils';

const ExpenseDetailModal = ({ 
  isOpen, 
  onClose, 
  detail, 
  onSave, 
  availableCategories,
  descriptionInputRef,
  amountInputRef
}) => {
  const [formData, setFormData] = useState({
    category: '',
    merchantName: '',
    description: '',
    amount: '',
    paymentMethod: '',
    paymentReqDate: new Date().toISOString().split('T')[0], // 오늘 날짜로 기본값 설정
    selectedCardId: '',
    cardNumber1: '',
    cardNumber2: '',
    cardNumber3: '',
    cardNumber4: '',
    note: ''
  });
  
  const [companyCards, setCompanyCards] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [receiptFiles, setReceiptFiles] = useState([]); // 선택된 영수증 파일들
  const receiptFileInputRef = useRef(null);


  // 카드 목록 불러오기
  useEffect(() => {
    const loadCards = async () => {
      if (!isOpen) return;
      
      setIsLoadingCards(true);
      try {
        // 회사 카드와 개인 카드 모두 불러오기
        const [companyCardsRes, userCardsRes] = await Promise.all([
          getCompanyCards().catch(() => ({ success: false, data: [] })),
          getUserCards().catch(() => ({ success: false, data: [] }))
        ]);
        
        if (companyCardsRes.success) {
          setCompanyCards(companyCardsRes.data || []);
        }
        if (userCardsRes.success) {
          setUserCards(userCardsRes.data || []);
        }
      } catch (error) {
        console.error('카드 목록 불러오기 실패:', error);
      } finally {
        setIsLoadingCards(false);
      }
    };
    
    loadCards();
  }, [isOpen]);

  useEffect(() => {
    if (detail) {
      const cardNumberParts = splitCardNumber(detail.cardNumber || '');
      setFormData({
        category: detail.category || '',
        merchantName: detail.merchantName || '',
        description: detail.description || '',
        amount: detail.amount || '',
        paymentMethod: detail.paymentMethod || '',
        paymentReqDate: detail.paymentReqDate || new Date().toISOString().split('T')[0],
        selectedCardId: '',
        ...cardNumberParts,
        note: detail.note || ''
      });
      // 기존 카드번호가 있으면 직접 입력 모드로 설정
      if (detail.cardNumber) {
        setUseSavedCard(false);
      }
      // 기존 영수증 파일 초기화 (수정 모드에서는 서버에 저장된 영수증 사용)
      setReceiptFiles([]);
    } else {
      // 새 항목 추가 시 초기화
      setFormData({
        category: '',
        merchantName: '',
        description: '',
        amount: '',
        paymentMethod: '',
        paymentReqDate: new Date().toISOString().split('T')[0], // 오늘 날짜로 기본값 설정
        selectedCardId: '',
        cardNumber1: '',
        cardNumber2: '',
        cardNumber3: '',
        cardNumber4: '',
        note: ''
      });
      setUseSavedCard(true);
      setReceiptFiles([]);
    }
  }, [detail, isOpen]);

  const handleCardNumberChange = (e, index) => {
    const { value } = e.target;
    // 숫자만 입력받기
    const numericValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    const fieldName = `cardNumber${index}`;
    
    setFormData({ ...formData, [fieldName]: numericValue });

    // 4자리가 입력되면 다음 필드로 포커스 이동
    if (numericValue.length === 4 && index < 4) {
      const nextField = document.querySelector(`input[name="cardNumber${index + 1}"]`);
      if (nextField) {
        nextField.focus();
      }
    }
  };

  const handleCardNumberKeyDown = (e, index) => {
    // 백스페이스 키를 눌렀을 때 현재 필드가 비어있으면 이전 필드로 이동
    if (e.key === 'Backspace' && !e.target.value && index > 1) {
      const prevField = document.querySelector(`input[name="cardNumber${index - 1}"]`);
      if (prevField) {
        prevField.focus();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      // 입력값을 숫자로 변환하여 저장 (콤마 제거 후)
      const numericValue = parseFormattedNumber(value);
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === 'selectedCardId') {
      // 저장된 카드 선택 시
      setFormData({ ...formData, [name]: value, cardNumber1: '', cardNumber2: '', cardNumber3: '', cardNumber4: '' });
      setUseSavedCard(true);
    } else if (name === 'paymentMethod') {
      // 결제수단 변경 시 카드 선택 초기화
      setFormData({ ...formData, [name]: value, selectedCardId: '', cardNumber1: '', cardNumber2: '', cardNumber3: '', cardNumber4: '' });
      setUseSavedCard(true);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // 저장된 카드 선택 시 카드번호 자동 입력
  useEffect(() => {
    if (formData.selectedCardId && formData.paymentMethod) {
      let selectedCard = null;
      
      if (formData.paymentMethod === 'COMPANY_CARD') {
        selectedCard = companyCards.find(card => card.cardId === Number(formData.selectedCardId));
      } else if (formData.paymentMethod === 'CARD') {
        selectedCard = userCards.find(card => card.cardId === Number(formData.selectedCardId));
      }
      
      if (selectedCard && selectedCard.cardNumber) {
        // 마스킹된 카드번호에서 숫자만 추출 (마지막 4자리만 사용)
        const numericValue = selectedCard.cardNumber.replace(/[^0-9]/g, '');
        if (numericValue.length >= 4) {
          const lastFour = numericValue.substring(numericValue.length - 4);
          // 마지막 4자리만 표시하고 나머지는 빈 값으로 설정
          setFormData(prev => ({
            ...prev,
            cardNumber1: '',
            cardNumber2: '',
            cardNumber3: '',
            cardNumber4: lastFour
          }));
        }
      }
    }
  }, [formData.selectedCardId, formData.paymentMethod, companyCards, userCards]);
  
  // 직접 입력 모드로 전환
  const handleUseManualInput = () => {
    setUseSavedCard(false);
    setFormData(prev => ({ ...prev, selectedCardId: '' }));
  };

  // 영수증 파일 선택 처리
  const handleReceiptFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) {
      return;
    }

    // 각 파일 검증
    const validFiles = [];
    for (const file of files) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}: 파일 크기는 10MB를 초과할 수 없습니다.`);
        continue;
      }

      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: 지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, pdf만 허용)`);
        continue;
      }

      validFiles.push(file);
    }

    // 유효한 파일들을 receiptFiles에 추가
    setReceiptFiles([...receiptFiles, ...validFiles]);
    event.target.value = '';
  };

  // 영수증 파일 제거
  const handleRemoveReceiptFile = (index) => {
    const newReceiptFiles = receiptFiles.filter((_, i) => i !== index);
    setReceiptFiles(newReceiptFiles);
  };

  const handleSave = () => {
    // 영수증 필수 검증
    if (receiptFiles.length === 0) {
      alert('영수증을 첨부해주세요.');
      return;
    }

    let cardNumber = '';
    
    // 저장된 카드 선택 시
    if (useSavedCard && formData.selectedCardId) {
      let selectedCard = null;
      
      if (formData.paymentMethod === 'COMPANY_CARD') {
        selectedCard = companyCards.find(card => card.cardId === Number(formData.selectedCardId));
      } else if (formData.paymentMethod === 'CARD') {
        selectedCard = userCards.find(card => card.cardId === Number(formData.selectedCardId));
      }
      
      // 저장된 카드의 경우 카드번호는 서버에서 처리하므로 빈 값으로 전송
      // 실제 카드번호는 백엔드에서 selectedCardId로 조회하여 사용
      cardNumber = selectedCard ? selectedCard.cardNumber : '';
    } else {
      // 직접 입력 시
      cardNumber = combineCardNumber(
        formData.cardNumber1,
        formData.cardNumber2,
        formData.cardNumber3,
        formData.cardNumber4
      );
    }
    
    // cardNumber1-4, selectedCardId 필드를 제외하고 저장
    const { cardNumber1, cardNumber2, cardNumber3, cardNumber4, selectedCardId, ...restFormData } = formData;
    
    const savedData = {
      ...restFormData,
      amount: formData.amount ? Number(parseFormattedNumber(formData.amount)) : 0,
      cardNumber: cardNumber,
      cardId: useSavedCard && formData.selectedCardId ? Number(formData.selectedCardId) : null,
      receiptFiles: receiptFiles // 영수증 파일들 포함
    };
    onSave(savedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>지출 상세 내역 {detail ? '수정' : '추가'}</S.ModalTitle>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <S.FormGrid>
          <S.FormGroup>
              <S.Label>사용일자 *</S.Label>
              <S.Input
                type="date"
                name="paymentReqDate"
                value={formData.paymentReqDate}
                onChange={handleChange}
                required
              />
            </S.FormGroup>
            <div></div>

            <S.FormGroup>
              <S.Label>항목 *</S.Label>
              <S.Select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
              >
                <option value="">선택하세요</option>
                {availableCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </S.Select>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>상호명</S.Label>
              <S.Input
                type="text"
                name="merchantName"
                value={formData.merchantName}
                onChange={handleChange}
                placeholder="상호명/업체명"
                maxLength={200}
              />
            </S.FormGroup>

            <S.FormGroup fullWidth>
              <S.Label>적요 (내용) *</S.Label>
              <S.Input
                ref={descriptionInputRef}
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="지출 내용을 입력하세요"
              />
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>금액 *</S.Label>
              <S.Input
                ref={amountInputRef}
                type="text"
                name="amount"
                value={formData.amount ? formatNumber(formData.amount) : ''}
                onChange={handleChange}
                placeholder="금액을 입력하세요"
                onWheel={(e) => e.target.blur()}
              />
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>결제수단 *</S.Label>
              <S.Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="">선택하세요</option>
                <option value="CASH">현금</option>
                <option value="BANK_TRANSFER">계좌이체</option>
                <option value="CARD">개인카드</option>
                <option value="COMPANY_CARD">회사카드</option>
              </S.Select>
            </S.FormGroup>

            {(formData.paymentMethod === 'CARD' || formData.paymentMethod === 'COMPANY_CARD') && (
              <S.FormGroup fullWidth>
                <S.Label>카드번호 *</S.Label>
                
                {/* 저장된 카드 선택 */}
                {useSavedCard && (
                  <>
                    <S.Select 
                      name="selectedCardId" 
                      value={formData.selectedCardId} 
                      onChange={handleChange}
                      style={{ marginBottom: '8px' }}
                    >
                      <option value="">카드를 선택하세요</option>
                      {formData.paymentMethod === 'COMPANY_CARD' && companyCards.map(card => (
                        <option key={card.cardId} value={card.cardId}>
                          {card.cardName} ({card.cardNumber})
                        </option>
                      ))}
                      {formData.paymentMethod === 'CARD' && userCards.map(card => (
                        <option key={card.cardId} value={card.cardId}>
                          {card.cardName} ({card.cardNumber})
                        </option>
                      ))}
                    </S.Select>
                    <button
                      type="button"
                      onClick={handleUseManualInput}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#007bff',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      직접 입력하기
                    </button>
                  </>
                )}
                
                {/* 직접 입력 */}
                {!useSavedCard && (
                  <>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <S.Input
                        type="text"
                        name="cardNumber1"
                        value={formData.cardNumber1}
                        onChange={(e) => handleCardNumberChange(e, 1)}
                        onKeyDown={(e) => handleCardNumberKeyDown(e, 1)}
                        maxLength={4}
                        style={{ width: '80px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '18px', color: '#666' }}>-</span>
                      <S.Input
                        type="text"
                        name="cardNumber2"
                        value={formData.cardNumber2}
                        onChange={(e) => handleCardNumberChange(e, 2)}
                        onKeyDown={(e) => handleCardNumberKeyDown(e, 2)}
                        maxLength={4}
                        style={{ width: '80px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '18px', color: '#666' }}>-</span>
                      <S.Input
                        type="text"
                        name="cardNumber3"
                        value={formData.cardNumber3}
                        onChange={(e) => handleCardNumberChange(e, 3)}
                        onKeyDown={(e) => handleCardNumberKeyDown(e, 3)}
                        maxLength={4}
                        style={{ width: '80px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '18px', color: '#666' }}>-</span>
                      <S.Input
                        type="text"
                        name="cardNumber4"
                        value={formData.cardNumber4}
                        onChange={(e) => handleCardNumberChange(e, 4)}
                        onKeyDown={(e) => handleCardNumberKeyDown(e, 4)}
                        maxLength={4}
                        style={{ width: '80px', textAlign: 'center' }}
                      />
                    </div>
                    {(companyCards.length > 0 || userCards.length > 0) && (
                      <button
                        type="button"
                        onClick={() => setUseSavedCard(true)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          color: '#007bff',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        저장된 카드 사용하기
                      </button>
                    )}
                  </>
                )}
              </S.FormGroup>
            )}

            <S.FormGroup fullWidth>
              <S.Label>비고</S.Label>
              <S.TextArea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="비고를 입력하세요 (선택사항)"
                rows={3}
              />
            </S.FormGroup>

            <S.FormGroup fullWidth>
              <S.Label>
                영수증 <span style={{ color: 'red' }}>*</span>
              </S.Label>
              <input
                ref={receiptFileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleReceiptFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => receiptFileInputRef.current?.click()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}
              >
                <FaFileUpload />
                <span>영수증 선택</span>
              </button>
              {receiptFiles.length > 0 ? (
                <div style={{ marginTop: '8px' }}>
                  {receiptFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginBottom: '4px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '500' }}>{file.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          크기: {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReceiptFile(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="제거"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                  영수증을 선택해주세요. (필수)
                </div>
              )}
            </S.FormGroup>
          </S.FormGrid>
        </S.ModalBody>

        <S.ModalFooter>
          <S.CancelButton onClick={onClose}>취소</S.CancelButton>
          <S.SaveButton onClick={handleSave}>저장</S.SaveButton>
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default ExpenseDetailModal;

