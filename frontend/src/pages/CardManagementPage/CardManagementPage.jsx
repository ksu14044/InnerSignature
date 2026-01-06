import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCreditCard, FaBuilding, FaUser } from 'react-icons/fa';
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
    cardNumber: '',
    isDefault: false
  });

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
      cardNumber: '',
      isDefault: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card) => {
    setIsEditMode(true);
    setEditingCard(card);
    setFormData({
      cardName: card.cardName || '',
      cardNumber: '', // 보안상 카드번호는 다시 입력받음
      isDefault: card.isDefault || false
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingCard(null);
    setFormData({
      cardName: '',
      cardNumber: '',
      isDefault: false
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
            cardNumber: formData.cardNumber || undefined,
            isDefault: formData.isDefault
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
            cardNumber: formData.cardNumber,
            isDefault: formData.isDefault
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
    // 마스킹된 카드번호 형식 (****-****-****-1234)
    return cardNumber;
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  const currentCards = activeTab === 'company' ? companyCards : userCards;
  const canManageCompanyCards = user?.role === 'ADMIN' || user?.role === 'CEO' || user?.role === 'ACCOUNTANT';

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>카드 관리</S.Title>
        </S.HeaderLeft>
        <S.HeaderRight>
          <S.BackButton onClick={() => navigate(-1)}>
            뒤로
          </S.BackButton>
        </S.HeaderRight>
      </S.Header>

      {/* 탭 */}
      <S.Tabs>
        <S.Tab 
          active={activeTab === 'company'} 
          onClick={() => setActiveTab('company')}
          disabled={!canManageCompanyCards}
        >
          <FaBuilding /> 회사 카드
        </S.Tab>
        <S.Tab 
          active={activeTab === 'user'} 
          onClick={() => setActiveTab('user')}
        >
          <FaUser /> 개인 카드
        </S.Tab>
      </S.Tabs>

      {/* 권한 안내 */}
      {activeTab === 'company' && !canManageCompanyCards && (
        <S.InfoMessage>
          회사 카드는 ADMIN, CEO, ACCOUNTANT 권한만 관리할 수 있습니다.
        </S.InfoMessage>
      )}

      {/* 카드 목록 */}
      {activeTab === 'company' && canManageCompanyCards && (
        <>
          <S.SectionHeader>
            <S.SectionTitle>회사 카드 목록</S.SectionTitle>
            <S.AddButton onClick={handleOpenAddModal}>
              <FaPlus /> 카드 추가
            </S.AddButton>
          </S.SectionHeader>

          {companyCards.length === 0 ? (
            <S.EmptyState>
              <S.EmptyText>등록된 회사 카드가 없습니다.</S.EmptyText>
            </S.EmptyState>
          ) : (
            <S.CardsGrid>
              {companyCards.map(card => (
                <S.CardItem key={card.cardId}>
                  <S.CardHeader>
                    <S.CardName>{card.cardName}</S.CardName>
                    <S.CardActions>
                      <S.EditButton onClick={() => handleOpenEditModal(card)} title="수정">
                        <FaEdit />
                      </S.EditButton>
                      <S.DeleteButton onClick={() => handleDelete(card.cardId)} title="삭제">
                        <FaTrash />
                      </S.DeleteButton>
                    </S.CardActions>
                  </S.CardHeader>
                  <S.CardBody>
                    <S.CardNumber>{formatCardNumber(card.cardNumber)}</S.CardNumber>
                    <S.CardInfo>
                      <S.CardInfoItem>
                        <strong>생성일:</strong> {card.createdAt ? new Date(card.createdAt).toLocaleDateString('ko-KR') : '-'}
                      </S.CardInfoItem>
                      {card.createdByName && (
                        <S.CardInfoItem>
                          <strong>생성자:</strong> {card.createdByName}
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
          <S.SectionHeader>
            <S.SectionTitle>개인 카드 목록</S.SectionTitle>
            <S.AddButton onClick={handleOpenAddModal}>
              <FaPlus /> 카드 추가
            </S.AddButton>
          </S.SectionHeader>

          {userCards.length === 0 ? (
            <S.EmptyState>
              <S.EmptyText>등록된 개인 카드가 없습니다.</S.EmptyText>
            </S.EmptyState>
          ) : (
            <S.CardsGrid>
              {userCards.map(card => (
                <S.CardItem key={card.cardId}>
                  <S.CardHeader>
                    <S.CardName>
                      {card.cardName}
                      {card.isDefault && <S.DefaultBadge>기본</S.DefaultBadge>}
                    </S.CardName>
                    <S.CardActions>
                      <S.EditButton onClick={() => handleOpenEditModal(card)} title="수정">
                        <FaEdit />
                      </S.EditButton>
                      <S.DeleteButton onClick={() => handleDelete(card.cardId)} title="삭제">
                        <FaTrash />
                      </S.DeleteButton>
                    </S.CardActions>
                  </S.CardHeader>
                  <S.CardBody>
                    <S.CardNumber>{formatCardNumber(card.cardNumber)}</S.CardNumber>
                    <S.CardInfo>
                      <S.CardInfoItem>
                        <strong>생성일:</strong> {card.createdAt ? new Date(card.createdAt).toLocaleDateString('ko-KR') : '-'}
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
              <S.CloseButton onClick={handleCloseModal}>×</S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <S.Form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.Label>카드 별칭 *</S.Label>
                  <S.Input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="예: 회사법인카드1, 개인신용카드"
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>카드번호 {isEditMode ? '(변경 시에만 입력)' : '*'}</S.Label>
                  <S.Input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="숫자만 입력 (13-19자리)"
                    maxLength={19}
                    required={!isEditMode}
                  />
                  <S.HelpText>
                    {isEditMode 
                      ? '카드번호를 변경하려면 새 카드번호를 입력하세요. 변경하지 않으려면 비워두세요.'
                      : '카드번호는 암호화되어 안전하게 저장됩니다.'}
                  </S.HelpText>
                </S.FormGroup>
                {activeTab === 'user' && (
                  <S.FormGroup>
                    <S.CheckboxLabel>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                      />
                      기본 카드로 설정
                    </S.CheckboxLabel>
                    <S.HelpText>기본 카드는 지출결의서 작성 시 기본으로 선택됩니다.</S.HelpText>
                  </S.FormGroup>
                )}
                <S.ModalFooter>
                  <S.CancelButton type="button" onClick={handleCloseModal}>
                    취소
                  </S.CancelButton>
                  <S.SubmitButton type="submit">
                    {isEditMode ? '수정' : '추가'}
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

