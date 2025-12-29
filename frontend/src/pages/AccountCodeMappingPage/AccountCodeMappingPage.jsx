import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAccountCodeMappingList, createAccountCodeMapping, updateAccountCodeMapping, deleteAccountCodeMapping } from '../../api/accountCodeApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaPlus, FaEdit, FaTrash, FaCode } from 'react-icons/fa';

const AccountCodeMappingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mappingList, setMappingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    merchantKeyword: '',
    accountCode: '',
    accountName: ''
  });

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CEO' && user.role !== 'ACCOUNTANT')) {
      alert('접근 권한이 없습니다. (ADMIN, CEO, ACCOUNTANT 권한 필요)');
      navigate('/expenses');
      return;
    }
    loadMappingList();
  }, [user, navigate]);

  const loadMappingList = async () => {
    try {
      setLoading(true);
      const response = await getAccountCodeMappingList();
      if (response.success) {
        setMappingList(response.data || []);
      }
    } catch (error) {
      console.error('계정 과목 매핑 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '계정 과목 매핑 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mapping = null) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        category: mapping.category || '',
        merchantKeyword: mapping.merchantKeyword || '',
        accountCode: mapping.accountCode || '',
        accountName: mapping.accountName || ''
      });
    } else {
      setEditingMapping(null);
      setFormData({
        category: '',
        merchantKeyword: '',
        accountCode: '',
        accountName: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMapping(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const mappingData = {
        category: formData.category,
        merchantKeyword: formData.merchantKeyword || null,
        accountCode: formData.accountCode,
        accountName: formData.accountName
      };

      if (editingMapping) {
        const response = await updateAccountCodeMapping(editingMapping.mappingId, mappingData);
        if (response.success) {
          alert('계정 과목 매핑이 수정되었습니다.');
          handleCloseModal();
          loadMappingList();
        }
      } else {
        const response = await createAccountCodeMapping(mappingData);
        if (response.success) {
          alert('계정 과목 매핑이 생성되었습니다.');
          handleCloseModal();
          loadMappingList();
        }
      }
    } catch (error) {
      console.error('계정 과목 매핑 저장 실패:', error);
      alert(error?.response?.data?.message || '계정 과목 매핑 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (mappingId) => {
    if (!window.confirm('계정 과목 매핑을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteAccountCodeMapping(mappingId);
      if (response.success) {
        alert('계정 과목 매핑이 삭제되었습니다.');
        loadMappingList();
      }
    } catch (error) {
      console.error('계정 과목 매핑 삭제 실패:', error);
      alert(error?.response?.data?.message || '계정 과목 매핑 삭제 중 오류가 발생했습니다.');
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'CEO';

  if (!user) {
    return (
      <S.Container>
        <S.Alert>로그인이 필요합니다.</S.Alert>
        <S.Button onClick={() => navigate('/')}>로그인 페이지로 이동</S.Button>
      </S.Container>
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'CEO' && user.role !== 'ACCOUNTANT') {
    return (
      <S.Container>
        <S.Alert>접근 권한이 없습니다. (ADMIN, CEO 또는 ACCOUNTANT 권한 필요)</S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>
          <FaCode />
          계정 과목 매핑 관리
        </S.Title>
        <S.ButtonRow>
          {canEdit && (
            <S.Button onClick={() => handleOpenModal()}>
              <FaPlus /> 매핑 추가
            </S.Button>
          )}
          <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
        </S.ButtonRow>
      </S.Header>

      {loading && <LoadingOverlay fullScreen={false} message="로딩 중..." />}

      <S.MappingList>
        {mappingList.length === 0 ? (
          <S.EmptyMessage>계정 과목 매핑이 없습니다.</S.EmptyMessage>
        ) : (
          mappingList.map(mapping => (
            <S.MappingCard key={mapping.mappingId}>
              <S.MappingHeader>
                <div>
                  <S.MappingTitle>
                    {mapping.category}
                    {mapping.merchantKeyword && ` (${mapping.merchantKeyword})`}
                  </S.MappingTitle>
                  <S.MappingSubtitle>
                    {mapping.accountCode} - {mapping.accountName}
                  </S.MappingSubtitle>
                </div>
                {canEdit && (
                  <S.ActionButtons>
                    <S.IconButton onClick={() => handleOpenModal(mapping)}>
                      <FaEdit />
                    </S.IconButton>
                    <S.IconButton onClick={() => handleDelete(mapping.mappingId)}>
                      <FaTrash />
                    </S.IconButton>
                  </S.ActionButtons>
                )}
              </S.MappingHeader>
            </S.MappingCard>
          ))
        )}
      </S.MappingList>

      {isModalOpen && (
        <S.ModalOverlay onClick={handleCloseModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>{editingMapping ? '계정 과목 매핑 수정' : '계정 과목 매핑 추가'}</S.ModalTitle>
              <S.CloseButton onClick={handleCloseModal}>×</S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.Label>카테고리</S.Label>
                  <S.Input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="예: 식대, 교통비"
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>가맹점명 키워드 (선택사항)</S.Label>
                  <S.Input
                    type="text"
                    value={formData.merchantKeyword}
                    onChange={(e) => setFormData(prev => ({ ...prev, merchantKeyword: e.target.value }))}
                    placeholder="예: 스타벅스, 맥도날드"
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>계정 과목 코드</S.Label>
                  <S.Input
                    type="text"
                    value={formData.accountCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountCode: e.target.value }))}
                    placeholder="예: 식대비"
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>계정 과목명</S.Label>
                  <S.Input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    placeholder="예: 식대비"
                    required
                  />
                </S.FormGroup>
                <S.ModalFooter>
                  <S.Button type="button" variant="secondary" onClick={handleCloseModal}>취소</S.Button>
                  <S.Button type="submit">{editingMapping ? '수정' : '생성'}</S.Button>
                </S.ModalFooter>
              </form>
            </S.ModalBody>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default AccountCodeMappingPage;

