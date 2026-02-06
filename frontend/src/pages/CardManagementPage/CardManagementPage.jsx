import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCreditCard, FaBuilding, FaUser, FaTimes } from 'react-icons/fa';
import { 
  getCompanyCards, 
  createCompanyCard, 
  updateCompanyCard, 
  deleteCompanyCard,
  getUserCards,
  createUserCard,
  updateUserCard,
  deleteUserCard
} from '../../api/cardApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PageHeader from '../../components/PageHeader/PageHeader';
import * as S from './style';

const CardManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company'); // 'company' or 'user'
  const [companyCards, setCompanyCards] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: ''
  });
  const [cardNumberFocused, setCardNumberFocused] = useState(false);

  useEffect(() => {
    loadCards();
  }, [activeTab]);

  const loadCards = async () => {
    try {
      setLoading(true);
      if (activeTab === 'company') {
        const response = await getCompanyCards();
        if (response.success) {
          setCompanyCards(response.data || []);
        }
      } else {
        const response = await getUserCards();
        if (response.success) {
          setUserCards(response.data || []);
        }

      }
    } catch (error) {
      console.error('카드 목록 로드 실패:', error);
      alert('카드 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingCard(null);
    setFormData({
      cardName: '',
      cardNumber: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card) => {
    setIsEditMode(true);
    setEditingCard(card);
    setFormData({
      cardName: card.cardName || '',
      cardNumber: '' // 보안상 카드번호는 다시 입력받음
    });
    setIsModalOpen(true);
  };

  const handleClearCardNumber = () => {
    setFormData(prev => ({ ...prev, cardNumber: '' }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingCard(null);
    setCardNumberFocused(false);
    setFormData({
      cardName: '',
      cardNumber: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    setFormData(prev => ({
      ...prev,
      cardNumber: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cardName.trim()) {
      alert('카드 별칭을 입력해주세요.');
      return;
    }

    if (!isEditMode && !formData.cardNumber.trim()) {
      alert('카드번호를 입력해주세요.');
      return;
    }

    // 카드번호 유효성 검사 (13-19자리)
    if (!isEditMode) {
      const numericCardNumber = formData.cardNumber.replace(/[^0-9]/g, '');
      if (numericCardNumber.length < 13 || numericCardNumber.length > 19) {
        alert('카드번호는 13자리 이상 19자리 이하여야 합니다.');
        return;
      }
    }

    try {
      if (activeTab === 'company') {
        if (isEditMode) {
          const response = await updateCompanyCard(editingCard.cardId, {
            cardName: formData.cardName,
            cardNumber: formData.cardNumber || undefined, // 수정 시 카드번호는 선택사항
            isActive: true
          });
          if (response.success) {
            alert('회사 카드가 수정되었습니다.');
            loadCards();
            handleCloseModal();
          } else {
            alert('수정 실패: ' + response.message);
          }
        } else {
          const response = await createCompanyCard({
            cardName: formData.cardName,
            cardNumber: formData.cardNumber
          });
          if (response.success) {
            alert('회사 카드가 추가되었습니다.');
            loadCards();
            handleCloseModal();
          } else {
            alert('추가 실패: ' + response.message);
          }
        }
      } else {
        if (isEditMode) {
          const response = await updateUserCard(editingCard.cardId, {
            cardName: formData.cardName,
            cardNumber: formData.cardNumber || undefined
          });
          if (response.success) {
            alert('개인 카드가 수정되었습니다.');
            loadCards();
            handleCloseModal();
          } else {
            alert('수정 실패: ' + response.message);
          }
        } else {
          const response = await createUserCard({
            cardName: formData.cardName,
            cardNumber: formData.cardNumber
          });
          if (response.success) {
            alert('개인 카드가 추가되었습니다.');
            loadCards();
            handleCloseModal();
          } else {
            alert('추가 실패: ' + response.message);
          }
        }
      }
    } catch (error) {
      console.error('카드 저장 실패:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '카드 저장 중 오류가 발생했습니다.';
      alert(errorMessage);
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      let response;
      if (activeTab === 'company') {
        response = await deleteCompanyCard(cardId);
      } else {
        response = await deleteUserCard(cardId);
      }

      if (response.success) {
        alert('카드가 삭제되었습니다.');
        loadCards();
      } else {
        alert('삭제 실패: ' + response.message);
      }
    } catch (error) {
      console.error('카드 삭제 실패:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '카드 삭제 중 오류가 발생했습니다.';
      alert(errorMessage);
    }
  };

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    // 카드번호가 이미 마스킹되어 있으면 그대로 반환
    if (cardNumber.includes('*')) {
      return cardNumber;
    }
    // 숫자만 추출
    const numericCardNumber = cardNumber.replace(/[^0-9]/g, '');
    if (numericCardNumber.length < 4) return cardNumber;
    
    // 마지막 4자리만 표시하고 나머지는 마스킹
    const last4 = numericCardNumber.slice(-4);
    const masked = '****-****-****';
    return `${masked}-${last4}`;
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  const currentCards = activeTab === 'company' ? companyCards : userCards;
  const canManageCompanyCards = user?.role === 'ADMIN' || user?.role === 'CEO' || user?.role === 'ACCOUNTANT';

  return (
    <S.Container>
      <PageHeader title="카드" />
      
      {/* 탭 헤더 바 */}
      <S.TabHeaderBar>
        <S.TabSection>
          <S.TabText
            active={activeTab === 'company'}
            onClick={() => canManageCompanyCards && setActiveTab('company')}
            style={{ 
              cursor: canManageCompanyCards ? 'pointer' : 'not-allowed',
              opacity: canManageCompanyCards ? 1 : 0.5
            }}
          >
            회사 카드
          </S.TabText>
          <S.TabText
            active={activeTab === 'user'}
            onClick={() => setActiveTab('user')}
          >
            개인 카드
          </S.TabText>
        </S.TabSection>
        <S.TabHeaderActions>
          {((activeTab === 'company' && canManageCompanyCards) || activeTab === 'user') && (
            <S.AddButton 
              onClick={handleOpenAddModal}
              variant={activeTab === 'company' ? 'gray' : 'blue'}
            >
              <FaPlus /> 카드 추가
            </S.AddButton>
          )}
        </S.TabHeaderActions>
      </S.TabHeaderBar>

      {/* 권한 안내 */}
      {activeTab === 'company' && !canManageCompanyCards && (
        <S.InfoMessage>
          <S.WarningIcon>
            <img 
              src="/이너사인_이미지 (1)/아이콘/계정매핑_알림_40px.png" 
              alt="경고" 
              width="40" 
              height="40"
            />
          </S.WarningIcon>
          <S.WarningText>회사 카드는 <strong>관리자, 대표, 담당 결재자 권한만</strong> 관리할 수 있습니다.</S.WarningText>
        </S.InfoMessage>
      )}

      {/* 카드 목록 */}
      {activeTab === 'company' && canManageCompanyCards && (
        <>
          {companyCards.length === 0 ? (
            <S.EmptyState>
              <S.EmptyText>등록된 회사 카드가 없습니다.</S.EmptyText>
            </S.EmptyState>
          ) : (
            <S.CardsGrid>
              {companyCards && companyCards.map(card => (
                <S.CardItem key={card.cardId}>
                  <S.CardActions>
                    <S.EditButton onClick={() => handleOpenEditModal(card)} title="수정">
                      <img 
                        src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/도장카드수정.png" 
                        alt="수정" 
                        width="24" 
                        height="24"
                      />
                    </S.EditButton>
                    <S.DeleteButton onClick={() => handleDelete(card.cardId)} title="삭제">
                      <img 
                        src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/도장카드삭제.png" 
                        alt="삭제" 
                        width="24" 
                        height="24"
                      />
                    </S.DeleteButton>
                  </S.CardActions>
                  <S.CardHeader>
                    <S.CardName>{card.cardName}</S.CardName>
                  </S.CardHeader>
                  <S.CardBody>
                    <S.CardNumberGroup>
                      {formatCardNumber(card.cardNumber).split('-').map((part, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span>-</span>}
                          <span>{part}</span>
                        </React.Fragment>
                      ))}
                    </S.CardNumberGroup>
                    <S.CardInfo>
                      <S.CardInfoItem>
                        <span>생성일</span>
                        <span>{card.createdAt ? new Date(card.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
                      </S.CardInfoItem>
                      {card.createdByName && (
                        <S.CardInfoItem>
                          <span>생성자</span>
                          <span>{card.createdByName}</span>
                        </S.CardInfoItem>
                      )}
                    </S.CardInfo>
                  </S.CardBody>
                </S.CardItem>
              ))}
            </S.CardsGrid>
          )}
        </>
      )}

      {activeTab === 'user' && (
        <>
          {userCards.length === 0 ? (
            <S.EmptyState>
              <S.EmptyText>등록된 개인 카드가 없습니다.</S.EmptyText>
            </S.EmptyState>
          ) : (
            <S.CardsGrid>
              {userCards && userCards.map(card => (
                <S.CardItem key={card.cardId}>
                  <S.CardActions>
                    <S.EditButton onClick={() => handleOpenEditModal(card)} title="수정">
                      <img 
                        src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/도장카드수정.png" 
                        alt="수정" 
                        width="24" 
                        height="24"
                      />
                    </S.EditButton>
                    <S.DeleteButton onClick={() => handleDelete(card.cardId)} title="삭제">
                      <img 
                        src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/도장카드삭제.png" 
                        alt="삭제" 
                        width="24" 
                        height="24"
                      />
                    </S.DeleteButton>
                  </S.CardActions>
                  <S.CardHeader>
                    <S.CardName>
                      {card.cardName}
                    </S.CardName>
                  </S.CardHeader>
                  <S.CardBody>
                    <S.CardNumberGroup>
                      {formatCardNumber(card.cardNumber).split('-').map((part, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span>-</span>}
                          <span>{part}</span>
                        </React.Fragment>
                      ))}
                    </S.CardNumberGroup>
                    <S.CardInfo>
                      <S.CardInfoItem>
                        <span>생성일</span>
                        <span>{card.createdAt ? new Date(card.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
                      </S.CardInfoItem>
                    </S.CardInfo>
                  </S.CardBody>
                </S.CardItem>
              ))}
            </S.CardsGrid>
          )}
        </>
      )}

      {/* 카드 추가/수정 모달 */}
      {isModalOpen && (
        <S.ModalOverlay onClick={handleCloseModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>
                {isEditMode ? '카드 수정' : '카드 추가'}
              </S.ModalTitle>
              <S.CloseButton onClick={handleCloseModal}>
                <img 
                  src="/이너사인_이미지 (1)/아이콘/24px_알림_사이드바/x-02.png" 
                  alt="닫기" 
                  width="24" 
                  height="24"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.textContent = '×';
                  }}
                />
                <span style={{ display: 'none' }}>×</span>
              </S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <S.Form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.Label>카드 별칭<S.RequiredAsterisk>*</S.RequiredAsterisk></S.Label>
                  <S.InputWrapper>
                    <S.Input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="예: 회사법인카드1, 개인신용카드"
                      required
                    />
                    {formData.cardName && (
                      <S.ClearInputButton
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cardName: '' }))}
                      >
                        <S.XCircleIcon>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="9" stroke="#333333" strokeWidth="1.5"/>
                            <path d="M7 7L13 13M13 7L7 13" stroke="#333333" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </S.XCircleIcon>
                      </S.ClearInputButton>
                    )}
                  </S.InputWrapper>
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>
                    {isEditMode ? (
                      <>카드번호(변경 시에만 입력)<S.RequiredAsterisk>*</S.RequiredAsterisk></>
                    ) : (
                      <>카드번호<S.RequiredAsterisk>*</S.RequiredAsterisk></>
                    )}
                  </S.Label>
                  <S.InputWrapper>
                    <S.Input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => setCardNumberFocused(true)}
                      onBlur={() => setCardNumberFocused(false)}
                      placeholder={isEditMode ? '' : '숫자만 입력(13-19자리)'}
                      maxLength={19}
                      required={!isEditMode}
                    />
                    {formData.cardNumber && (
                      <S.ClearInputButton
                        type="button"
                        onClick={handleClearCardNumber}
                      >
                        <S.XCircleIcon>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="9" stroke="#333333" strokeWidth="1.5"/>
                            <path d="M7 7L13 13M13 7L7 13" stroke="#333333" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </S.XCircleIcon>
                      </S.ClearInputButton>
                    )}
                    {isEditMode && !formData.cardNumber && !cardNumberFocused && editingCard && (
                      <S.PlaceholderText>{editingCard.cardNumber ? formatCardNumber(editingCard.cardNumber).replace(/-/g, '').slice(-11) : '123456789101'}</S.PlaceholderText>
                    )}
                  </S.InputWrapper>
                  <S.HelpText>
                    {isEditMode 
                      ? '카드번호를 변경하려면 새 카드번호를 입력하세요. 변경하지 않으려면 비워두세요.'
                      : '카드번호는 암호화되어 안전하게 저장됩니다.'}
                  </S.HelpText>
                </S.FormGroup>
                <S.ModalFooter>
                  <S.CancelButton type="button" onClick={handleCloseModal}>
                    취소
                  </S.CancelButton>
                  <S.SubmitButton 
                    type="submit"
                    disabled={!formData.cardName || (!isEditMode && !formData.cardNumber)}
                  >
                    저장
                  </S.SubmitButton>
                </S.ModalFooter>
              </S.Form>
            </S.ModalBody>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default CardManagementPage;




