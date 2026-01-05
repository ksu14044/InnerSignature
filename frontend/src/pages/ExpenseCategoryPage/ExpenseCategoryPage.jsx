import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getGlobalCategories, 
  getCompanyCategories, 
  getMergedCategories,
  createExpenseCategory, 
  updateExpenseCategory, 
  deleteExpenseCategory,
  reorderCategories
} from '../../api/expenseCategoryApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaPlus, FaEdit, FaTrash, FaGripVertical } from 'react-icons/fa';

const ExpenseCategoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    displayOrder: 0,
    isActive: true
  });
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // 권한 확인
    if (user.role !== 'SUPERADMIN' && user.role !== 'ACCOUNTANT' && user.role !== 'ADMIN' && user.role !== 'CEO') {
      alert('접근 권한이 없습니다. (SUPERADMIN, ACCOUNTANT, ADMIN, CEO 권한 필요)');
      navigate('/expenses');
      return;
    }
    
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user.role === 'SUPERADMIN') {
        response = await getGlobalCategories();
      } else {
        response = await getMergedCategories();
      }
      
      if (response.success) {
        const sortedCategories = (response.data || []).sort((a, b) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        setCategories(sortedCategories);
      }
    } catch (error) {
      console.error('항목 목록 조회 실패:', error);
      alert('항목 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        categoryName: category.categoryName || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        categoryName: '',
        displayOrder: categories.length,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      categoryName: '',
      displayOrder: 0,
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryName || formData.categoryName.trim() === '') {
      alert('항목명을 입력해주세요.');
      return;
    }

    try {
      if (editingCategory) {
        const response = await updateExpenseCategory(editingCategory.categoryId, formData);
        if (response.success) {
          alert('항목이 수정되었습니다.');
          handleCloseModal();
          loadCategories();
        } else {
          alert('수정 실패: ' + response.message);
        }
      } else {
        const response = await createExpenseCategory(formData);
        if (response.success) {
          alert('항목이 추가되었습니다.');
          handleCloseModal();
          loadCategories();
        } else {
          alert('추가 실패: ' + response.message);
        }
      }
    } catch (error) {
      console.error('항목 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('정말로 이 항목을 삭제(비활성화)하시겠습니까?')) {
      return;
    }

    try {
      // 삭제 대신 비활성화
      const response = await updateExpenseCategory(categoryId, { isActive: false });
      if (response.success) {
        alert('항목이 비활성화되었습니다.');
        loadCategories();
      } else {
        alert('비활성화 실패: ' + response.message);
      }
    } catch (error) {
      console.error('항목 비활성화 실패:', error);
      alert('비활성화 중 오류가 발생했습니다.');
    }
  };

  // 드래그 시작
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 오버
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 드롭
  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];
    newCategories.splice(draggedItem, 1);
    newCategories.splice(dropIndex, 0, draggedCategory);

    // displayOrder 업데이트
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      displayOrder: index
    }));

    setCategories(updatedCategories);
    setDraggedItem(null);

    // 서버에 순서 저장
    try {
      const categoryIds = updatedCategories.map(cat => cat.categoryId);
      const response = await reorderCategories(categoryIds);
      if (!response.success) {
        alert('순서 변경 실패: ' + response.message);
        loadCategories(); // 실패 시 원래대로 복구
      }
    } catch (error) {
      console.error('순서 변경 실패:', error);
      alert('순서 변경 중 오류가 발생했습니다.');
      loadCategories(); // 실패 시 원래대로 복구
    }
  };

  const canEdit = user?.role === 'SUPERADMIN' || user?.role === 'ACCOUNTANT' || user?.role === 'ADMIN' || user?.role === 'CEO';

  if (loading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.BackButton onClick={() => navigate(-1)}>← 뒤로</S.BackButton>
        <S.Title>지출 항목 관리</S.Title>
      </S.Header>

      <S.InfoBox>
        <p>
          {user.role === 'SUPERADMIN' 
            ? 'SUPERADMIN은 전역 기본 항목을 설정할 수 있습니다.'
            : '회사별 항목을 추가, 수정, 삭제(비활성화)할 수 있습니다. 드래그 앤 드롭으로 순서를 변경할 수 있습니다.'}
        </p>
      </S.InfoBox>

      {canEdit && (
        <S.ActionBar>
          <S.AddButton onClick={() => handleOpenModal()}>
            <FaPlus />
            <span>항목 추가</span>
          </S.AddButton>
        </S.ActionBar>
      )}

      <S.CategoryList>
        {categories.length === 0 ? (
          <S.EmptyMessage>등록된 항목이 없습니다.</S.EmptyMessage>
        ) : (
          categories.map((category, index) => (
            <S.CategoryItem
              key={category.categoryId}
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              isActive={category.isActive}
            >
              {canEdit && (
                <S.DragHandle>
                  <FaGripVertical />
                </S.DragHandle>
              )}
              <S.CategoryInfo>
                <S.CategoryName>{category.categoryName}</S.CategoryName>
                <S.CategoryMeta>
                  순서: {category.displayOrder || 0} | 
                  {category.companyId ? '회사별' : '전역'} | 
                  {category.isActive ? '활성' : '비활성'}
                </S.CategoryMeta>
              </S.CategoryInfo>
              {canEdit && (
                <S.ActionButtons>
                  <S.EditButton onClick={() => handleOpenModal(category)}>
                    <FaEdit />
                  </S.EditButton>
                  <S.DeleteButton onClick={() => handleDelete(category.categoryId)}>
                    <FaTrash />
                  </S.DeleteButton>
                </S.ActionButtons>
              )}
            </S.CategoryItem>
          ))
        )}
      </S.CategoryList>

      {/* 모달 */}
      {isModalOpen && (
        <S.Modal>
          <S.ModalContent>
            <S.ModalHeader>
              <S.ModalTitle>
                {editingCategory ? '항목 수정' : '항목 추가'}
              </S.ModalTitle>
              <S.ModalCloseButton onClick={handleCloseModal}>×</S.ModalCloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.FormLabel>항목명 *</S.FormLabel>
                  <S.FormInput
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    required
                    maxLength={50}
                  />
                </S.FormGroup>
                
                <S.FormGroup>
                  <S.FormLabel>표시 순서</S.FormLabel>
                  <S.FormInput
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                  <S.FormHelpText>낮을수록 먼저 표시됩니다. 드래그 앤 드롭으로도 변경할 수 있습니다.</S.FormHelpText>
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
                    {editingCategory ? '수정' : '추가'}
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

export default ExpenseCategoryPage;

