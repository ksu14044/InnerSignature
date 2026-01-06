import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserApprovers, createUserApprover, updateUserApprover, deleteUserApprover } from '../../api/userApproverApi';
import { fetchApprovers } from '../../api/expenseApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaPlus, FaEdit, FaTrash, FaUserCheck } from 'react-icons/fa';

const MyApproverPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState([]);
  const [availableApprovers, setAvailableApprovers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [formData, setFormData] = useState({
    approverId: '',
    priority: 1,
    isActive: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 담당 결재자 매핑 목록 조회
      const mappingsResponse = await getUserApprovers(user.userId);
      if (mappingsResponse.success) {
        setMappings(mappingsResponse.data || []);
      }
      
      // 사용 가능한 결재자 목록 조회
      const approversResponse = await fetchApprovers();
      if (approversResponse.success) {
        setAvailableApprovers(approversResponse.data || []);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mapping = null) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        approverId: mapping.approverId || '',
        priority: mapping.priority || 1,
        isActive: mapping.isActive !== undefined ? mapping.isActive : true
      });
    } else {
      setEditingMapping(null);
      setFormData({
        approverId: '',
        priority: 1,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMapping(null);
    setFormData({
      approverId: '',
      priority: 1,
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.approverId) {
      alert('결재자를 선택해주세요.');
      return;
    }

    try {
      if (editingMapping) {
        const response = await updateUserApprover(user.userId, editingMapping.mappingId, formData);
        if (response.success) {
          alert('담당 결재자가 수정되었습니다.');
          handleCloseModal();
          loadData();
        } else {
          alert('수정 실패: ' + response.message);
        }
      } else {
        const response = await createUserApprover(user.userId, formData);
        if (response.success) {
          alert('담당 결재자가 추가되었습니다.');
          handleCloseModal();
          loadData();
        } else {
          alert('추가 실패: ' + response.message);
        }
      }
    } catch (error) {
      console.error('담당 결재자 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (mappingId) => {
    if (!window.confirm('정말로 이 담당 결재자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteUserApprover(user.userId, mappingId);
      if (response.success) {
        alert('담당 결재자가 삭제되었습니다.');
        loadData();
      } else {
        alert('삭제 실패: ' + response.message);
      }
    } catch (error) {
      console.error('담당 결재자 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.BackButton onClick={() => navigate(-1)}>← 뒤로</S.BackButton>
        <S.Title>담당 결재자 설정</S.Title>
      </S.Header>

      <S.InfoBox>
        <p>담당 결재자를 설정하면 지출결의서 작성 시 자동으로 결재자가 선택됩니다.</p>
        <p>담당 결재자가 1명이면 자동 선택되고, 2명 이상이면 선택할 수 있습니다.</p>
      </S.InfoBox>

      <S.ActionBar>
        <S.AddButton onClick={() => handleOpenModal()}>
          <FaPlus />
          <span>담당 결재자 추가</span>
        </S.AddButton>
      </S.ActionBar>

      <S.TableContainer>
        <S.Table>
          <thead>
            <tr>
              <th>순서</th>
              <th>결재자 이름</th>
              <th>직급</th>
              <th>우선순위</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {mappings.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  등록된 담당 결재자가 없습니다.
                </td>
              </tr>
            ) : (
              mappings
                .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                .map((mapping) => {
                  const approver = availableApprovers.find(a => a.userId === mapping.approverId);
                  return (
                    <tr key={mapping.mappingId}>
                      <td>{mapping.priority || 1}</td>
                      <td>{approver?.koreanName || '알 수 없음'}</td>
                      <td>{approver?.position || '-'}</td>
                      <td>{mapping.priority || 1}</td>
                      <td>
                        <S.StatusBadge active={mapping.isActive}>
                          {mapping.isActive ? '활성' : '비활성'}
                        </S.StatusBadge>
                      </td>
                      <td>
                        <S.ActionButtons>
                          <S.EditButton onClick={() => handleOpenModal(mapping)}>
                            <FaEdit />
                          </S.EditButton>
                          <S.DeleteButton onClick={() => handleDelete(mapping.mappingId)}>
                            <FaTrash />
                          </S.DeleteButton>
                        </S.ActionButtons>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </S.Table>
      </S.TableContainer>

      {/* 모달 */}
      {isModalOpen && (
        <S.Modal>
          <S.ModalContent>
            <S.ModalHeader>
              <S.ModalTitle>
                {editingMapping ? '담당 결재자 수정' : '담당 결재자 추가'}
              </S.ModalTitle>
              <S.ModalCloseButton onClick={handleCloseModal}>×</S.ModalCloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.FormLabel>결재자 *</S.FormLabel>
                  <S.FormSelect
                    value={formData.approverId}
                    onChange={(e) => setFormData({ ...formData, approverId: e.target.value })}
                    required
                  >
                    <option value="">선택하세요</option>
                    {availableApprovers.map(approver => (
                      <option key={approver.userId} value={approver.userId}>
                        {approver.koreanName} ({approver.position})
                      </option>
                    ))}
                  </S.FormSelect>
                </S.FormGroup>
                
                <S.FormGroup>
                  <S.FormLabel>우선순위</S.FormLabel>
                  <S.FormInput
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  />
                  <S.FormHelpText>낮을수록 우선순위가 높습니다.</S.FormHelpText>
                </S.FormGroup>
                
                <S.FormGroup>
                  <S.FormLabel>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    활성화
                  </S.FormLabel>
                </S.FormGroup>
                
                <S.ModalFooter>
                  <S.ModalButton type="button" onClick={handleCloseModal} variant="secondary">
                    취소
                  </S.ModalButton>
                  <S.ModalButton type="submit">
                    {editingMapping ? '수정' : '추가'}
                  </S.ModalButton>
                </S.ModalFooter>
              </form>
            </S.ModalBody>
          </S.ModalContent>
        </S.Modal>
      )}
    </S.Container>
  );
};

export default MyApproverPage;


