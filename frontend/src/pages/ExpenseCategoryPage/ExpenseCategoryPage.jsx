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
import { getAccountCodeMappingList, createAccountCodeMapping, updateAccountCodeMapping, deleteAccountCodeMapping } from '../../api/accountCodeApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PageHeader from '../../components/PageHeader/PageHeader';
import { FaPlus } from 'react-icons/fa';

const ExpenseCategoryPage = ({ hideHeader = false }) => {
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
  const [dragOverIndex, setDragOverIndex] = useState(null); // 드롭 위치 표시용
  const [dropPosition, setDropPosition] = useState(null); // 'before' | 'after' | null
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' 또는 'accountCodes'
  const [mappingList, setMappingList] = useState([]);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [mappingFormData, setMappingFormData] = useState({
    category: '',
    merchantKeyword: '',
    accountCode: '',
    accountName: ''
  });

  useEffect(() => {
    console.log('[카테고리] useEffect 실행 - user:', user, 'activeTab:', activeTab, 'hideHeader:', hideHeader);
    
    if (!user) {
      console.log('[카테고리] user가 없음 - navigate 제거 (대시보드 임베드 모드)');
      if (!hideHeader) {
        navigate('/');
      }
      return;
    }
    
    // 권한 체크
    const canEditMapping = user?.role === 'SUPERADMIN' || user?.role === 'TAX_ACCOUNTANT';
    const canViewMapping = canEditMapping || user?.role === 'ADMIN' || user?.role === 'CEO' 
      || user?.role === 'ACCOUNTANT' || user?.role === 'USER';
    
    // USER도 조회는 가능하도록 변경 (백엔드 API가 USER도 허용)
    // 권한 체크는 UI에서만 처리
    if (activeTab === 'categories') {
      console.log('[카테고리] categories 탭 활성화 - loadCategories 호출');
      loadCategories();
    } else if (activeTab === 'accountCodes') {
      // 권한이 없으면 API 호출하지 않음 (이미 페이지에서 안내 표시)
      if (!canViewMapping) {
        console.log('[카테고리] accountCodes 탭 권한 없음 - API 호출 생략');
        return;
      }
      console.log('[카테고리] accountCodes 탭 활성화 - loadMappingList 호출');
      loadMappingList();
    }
  }, [user, navigate, activeTab, hideHeader]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user.role === 'SUPERADMIN') {
        console.log('[카테고리] SUPERADMIN: 전역 카테고리 조회 시작');
        response = await getGlobalCategories();
        console.log('[카테고리] 전역 카테고리 응답:', response);
      } else {
        console.log('[카테고리] 일반 사용자: 병합 카테고리 조회 시작');
        response = await getMergedCategories();
        console.log('[카테고리] 병합 카테고리 응답:', response);
      }
      
      console.log('[카테고리] 응답 전체:', JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        const data = response.data || [];
        console.log('[카테고리] 받은 데이터:', data);
        console.log('[카테고리] 데이터 개수:', data.length);
        
        const sortedCategories = data.sort((a, b) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        console.log('[카테고리] 정렬된 카테고리:', sortedCategories);
        setCategories(sortedCategories);
        
        if (sortedCategories.length === 0) {
          console.warn('[카테고리] 경고: 카테고리 데이터가 비어있습니다.');
        }
      } else {
        console.error('[카테고리] 응답 실패:', response);
        const errorMessage = response?.message || '카테고리 조회에 실패했습니다.';
        alert('항목 목록 조회 실패: ' + errorMessage);
        setCategories([]);
      }
    } catch (error) {
      console.error('[카테고리] 항목 목록 조회 실패:', error);
      console.error('[카테고리] 에러 상세:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류';
      alert('항목 목록 조회 중 오류가 발생했습니다: ' + errorMessage);
      setCategories([]);
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
    setDragOverIndex(null);
    setDropPosition(null);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 종료 (취소 포함)
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  // 드래그 오버 - 드롭 위치 표시
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedItem === null || draggedItem === index) {
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    // 마우스 위치에 따라 왼쪽/오른쪽 판별
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const nextPos = offsetX < rect.width / 2 ? 'left' : 'right';

    setDragOverIndex(index);
    setDropPosition(nextPos);
  };

  // 드래그 리브 - 인디케이터 제거
  const handleDragLeave = (e) => {
    // 자식 요소로 이동하는 경우는 무시
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setDragOverIndex(null);
    setDropPosition(null);
  };

  // 드롭
  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    // 인디케이터 먼저 정리
    const pos = dropPosition;
    setDragOverIndex(null);
    setDropPosition(null);

    if (draggedItem === null) {
      setDraggedItem(null);
      return;
    }

    // left/right에 따라 최종 삽입 인덱스 계산
    // left: 해당 카드 앞에 삽입, right: 해당 카드 뒤에 삽입
    let insertIndex = dropIndex + (pos === 'right' ? 1 : 0);
    const fromIndex = draggedItem;

    // 원본 삭제 후 인덱스 보정
    if (fromIndex < insertIndex) {
      insertIndex -= 1;
    }
    
    // 경계 체크
    if (insertIndex < 0) insertIndex = 0;
    if (insertIndex > categories.length - 1) insertIndex = categories.length - 1;

    if (fromIndex === insertIndex) {
      setDraggedItem(null);
      return;
    }

    const newCategories = [...categories];
    const draggedCategory = newCategories[fromIndex];
    newCategories.splice(fromIndex, 1);
    newCategories.splice(insertIndex, 0, draggedCategory);

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

  const loadMappingList = async () => {
    try {
      setLoading(true);
      const response = await getAccountCodeMappingList();
      if (response.success) {
        setMappingList(response.data || []);
      }
    } catch (error) {
      console.error('계정 과목 매핑 목록 조회 실패:', error);
      // 권한 관련 에러(403, 401)는 alert를 띄우지 않음 (이미 페이지에서 안내 표시)
      const status = error?.response?.status;
      if (status !== 403 && status !== 401) {
        alert(error?.response?.data?.message || '계정 과목 매핑 목록 조회 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMappingModal = (mapping = null) => {
    if (mapping) {
      setEditingMapping(mapping);
      setMappingFormData({
        category: mapping.category || '',
        merchantKeyword: mapping.merchantKeyword || '',
        accountCode: mapping.accountCode || '',
        accountName: mapping.accountName || ''
      });
    } else {
      // 매핑 추가 모드: 모든 상태를 명확히 초기화
      setEditingMapping(null);
      setMappingFormData({
        category: '',
        merchantKeyword: '',
        accountCode: '',
        accountName: ''
      });
    }
    setIsMappingModalOpen(true);
  };

  const handleCloseMappingModal = () => {
    setIsMappingModalOpen(false);
    setEditingMapping(null);
    setMappingFormData({
      category: '',
      merchantKeyword: '',
      accountCode: '',
      accountName: ''
    });
  };

  const handleMappingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const mappingData = {
        category: mappingFormData.category,
        merchantKeyword: mappingFormData.merchantKeyword || null,
        accountCode: mappingFormData.accountCode,
        accountName: mappingFormData.accountName
      };

      if (editingMapping) {
        const response = await updateAccountCodeMapping(editingMapping.mappingId, mappingData);
        if (response.success) {
          alert('계정 과목 매핑이 수정되었습니다.');
          handleCloseMappingModal();
          loadMappingList();
        }
      } else {
        const response = await createAccountCodeMapping(mappingData);
        if (response.success) {
          alert('계정 과목 매핑이 생성되었습니다.');
          handleCloseMappingModal();
          loadMappingList();
        }
      }
    } catch (error) {
      console.error('계정 과목 매핑 저장 실패:', error);
      alert(error?.response?.data?.message || '계정 과목 매핑 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    if (!window.confirm('이 계정 과목 매핑을 삭제하시겠습니까?')) {
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

  const canEditCategories = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' 
    || user?.role === 'CEO' || user?.role === 'ACCOUNTANT' || user?.role === 'TAX_ACCOUNTANT';
  const canViewCategories = canEditCategories || user?.role === 'USER';
  const canEditMapping = user?.role === 'SUPERADMIN' || user?.role === 'TAX_ACCOUNTANT';
  const canViewMapping = canEditMapping || user?.role === 'ADMIN' || user?.role === 'CEO' 
    || user?.role === 'ACCOUNTANT' || user?.role === 'USER';

  if (loading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  // 권한이 없는 경우 안내 메시지 표시
  if (!canViewCategories && activeTab === 'categories') {
    return (
      <S.Container>
        <S.Alert>
          <strong>지출 항목 관리</strong>
          <p>이 기능은 다음 권한이 필요합니다:</p>
          <ul>
            <li>시스템 관리자(SUPERADMIN)</li>
            <li>회계 담당자(ACCOUNTANT)</li>
            <li>관리자(ADMIN)</li>
            <li>대표(CEO)</li>
            <li>세무 담당자(TAX_ACCOUNTANT)</li>
            <li>일반 사용자(USER) - 조회만 가능</li>
          </ul>
          <p style={{ marginTop: '16px', color: '#666' }}>
            지출 항목 생성/수정이 필요하시면 <strong>회계 담당자(ACCOUNTANT)</strong>, <strong>관리자(ADMIN)</strong>, <strong>대표(CEO)</strong> 또는 <strong>세무 담당자(TAX_ACCOUNTANT)</strong>에게 문의해주세요.
          </p>
        </S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  if (!canViewMapping && activeTab === 'accountCodes') {
    return (
      <S.Container>
        <S.Alert>
          <strong>계정 코드 매핑</strong>
          <p>이 기능은 다음 권한이 필요합니다:</p>
          <ul>
            <li>시스템 관리자(SUPERADMIN)</li>
            <li>세무 담당자(TAX_ACCOUNTANT)</li>
            <li>관리자(ADMIN)</li>
            <li>대표(CEO)</li>
            <li>회계 담당자(ACCOUNTANT)</li>
            <li>일반 사용자(USER) - 조회만 가능</li>
          </ul>
          <p style={{ marginTop: '16px', color: '#666' }}>
            계정 코드 매핑 생성/수정이 필요하시면 <strong>세무 담당자(TAX_ACCOUNTANT)</strong> 또는 <strong>시스템 관리자(SUPERADMIN)</strong>에게 문의해주세요.
          </p>
        </S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <PageHeader
        title="지출 항목 관리"
      />
      
      {/* 탭 헤더 바 */}
      <S.TabHeaderBar>
        <S.TabSection>
          <S.TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
            지출 카테고리
          </S.TabButton>
          <S.TabButton active={activeTab === 'accountCodes'} onClick={() => setActiveTab('accountCodes')}>
            계정 코드 매핑
          </S.TabButton>
        </S.TabSection>
        {activeTab === 'categories' && canEditCategories && (
          <S.TabHeaderActions>
            <S.AddButton onClick={() => handleOpenModal()}>
              <FaPlus />
              <span>항목 추가</span>
            </S.AddButton>
          </S.TabHeaderActions>
        )}
        {activeTab === 'accountCodes' && (
          <S.TabHeaderActions>
            {canEditMapping ? (
              <S.AddButton onClick={() => handleOpenMappingModal()}>
                <FaPlus />
                <span>매핑 추가</span>
              </S.AddButton>
            ) : (
              <S.AddButton disabled $disabled>
                <FaPlus />
                <span>항목 추가</span>
              </S.AddButton>
            )}
          </S.TabHeaderActions>
        )}
      </S.TabHeaderBar>

      {/* 지출 카테고리 탭 */}
      {activeTab === 'categories' && (
        <>
          <S.InfoBox>
            <p>
              {user.role === 'SUPERADMIN' 
                ? 'SUPERADMIN은 전역 기본 항목을 설정할 수 있습니다.'
                : user.role === 'USER'
                ? '지출 항목을 조회할 수 있습니다. 항목 생성/수정이 필요하시면 회계 담당자, 관리자, 대표 또는 세무 담당자에게 문의해주세요.'
                : '회사별 항목을 추가, 수정, 삭제(비활성화)할 수 있습니다. 드래그 앤 드롭으로 순서를 변경할 수 있습니다.'}
            </p>
          </S.InfoBox>

          <S.CategoryList>
            {categories.length === 0 ? (
              <S.EmptyMessage>등록된 항목이 없습니다.</S.EmptyMessage>
            ) : (
              categories.map((category, index) => (
                <S.CategoryItem
                  key={category.categoryId}
                  draggable={canEditCategories}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  isActive={category.isActive}
                  isDragging={draggedItem === index}
                  isDragOver={dragOverIndex === index}
                  dropPosition={dragOverIndex === index ? dropPosition : null}
                >
                  <S.CategoryInfo>
                    <S.CategoryName>{category.categoryName}</S.CategoryName>
                    <S.CategoryMeta>
                      순서 {category.displayOrder || 0} | {category.companyId ? '회사별' : '전역'} | {category.isActive ? '활성' : '비활성'}
                    </S.CategoryMeta>
                  </S.CategoryInfo>
                  {canEditCategories && (
                    <S.ActionButtons>
                      <S.EditButton onClick={() => handleOpenModal(category)}>
                        <img 
                          src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/수정.png" 
                          alt="수정" 
                          width="24" 
                          height="24"
                        />
                      </S.EditButton>
                      <S.DeleteButton onClick={() => handleDelete(category.categoryId)}>
                        <img 
                          src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/삭제.png" 
                          alt="삭제" 
                          width="24" 
                          height="24"
                        />
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
              <S.ModalCloseButton onClick={handleCloseModal}>
                <img 
                  src="/이너사인_이미지 (1)/아이콘/24px_알림_사이드바/x-02.png" 
                  alt="닫기" 
                  width="24" 
                  height="24"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span style={{ display: 'none', fontSize: '24px', color: '#666666' }}>×</span>
              </S.ModalCloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.FormLabel>항목 이름</S.FormLabel>
                  <S.FormInput
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    placeholder="항목 이름을 입력하세요"
                    required
                    maxLength={50}
                  />
                </S.FormGroup>
                
                <S.FormGroup>
                  <S.FormLabel $noAsterisk>표지순서</S.FormLabel>
                  <S.FormInput
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                  <S.FormHelpText>낮을수록 먼저 표시됩니다. 드래그 앤 드롭으로 변경할 수 있습니다.</S.FormHelpText>
                </S.FormGroup>
                
                <S.FormGroup>
                  <S.CheckboxGroup>
                    <S.Checkbox
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <S.CheckboxLabel htmlFor="isActive">활성화</S.CheckboxLabel>
                  </S.CheckboxGroup>
                </S.FormGroup>
                
                <S.ModalFooter>
                  <S.ModalButton type="button" onClick={handleCloseModal} variant="secondary">
                    취소
                  </S.ModalButton>
                  <S.ModalButton 
                    type="submit"
                    $disabled={!formData.categoryName || formData.categoryName.trim() === ''}
                    disabled={!formData.categoryName || formData.categoryName.trim() === ''}
                  >
                    {editingCategory ? '수정' : '추가'}
                  </S.ModalButton>
                </S.ModalFooter>
              </form>
            </S.ModalBody>
          </S.ModalContent>
        </S.Modal>
      )}
        </>
      )}

      {/* 계정 코드 매핑 탭 */}
      {activeTab === 'accountCodes' && (
        <S.MappingTabContent>
          {!canEditMapping ? (
            <S.NoAccessContainer>
              <S.NoAccessIcon>
                <img 
                  src="/이너사인_이미지 (1)/아이콘/계정매핑_알림_40px.png" 
                  alt="경고" 
                  width="40" 
                  height="40"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </S.NoAccessIcon>
              <S.NoAccessMessage>
                접근 권한이 없습니다.<br />
                계정 코드 매핑/수정은 <strong>세무 상담사 또는 시스템 관리자 권한</strong>이 필요합니다.
              </S.NoAccessMessage>
            </S.NoAccessContainer>
          ) : (
            <>
              <S.InfoBox>
                <p>
                  카테고리와 가맹점 키워드에 따라 자동으로 계정 과목 코드를 매핑할 수 있습니다.
                </p>
              </S.InfoBox>

              <S.MappingList>
                {mappingList.length === 0 ? (
                  <S.EmptyMessage>등록된 매핑이 없습니다.</S.EmptyMessage>
                ) : (
                  mappingList.map(mapping => (
                    <S.MappingItem 
                      key={mapping.mappingId}
                      onClick={canEditMapping ? () => handleOpenMappingModal(mapping) : undefined}
                      $clickable={canEditMapping}
                    >
                      <S.MappingInfo>
                        <S.MappingTitle>
                          {mapping.category || '-'}
                        </S.MappingTitle>
                        <S.MappingMeta>
                          계정명 {mapping.accountName}
                        </S.MappingMeta>
                      </S.MappingInfo>
                    </S.MappingItem>
                  ))
                )}
              </S.MappingList>
            </>
          )}

          {/* 계정 코드 매핑 모달 */}
          {isMappingModalOpen && (
            <S.Modal>
              <S.ModalContent>
                <S.ModalHeader>
                  <S.ModalTitle>
                    {editingMapping ? '계정 코드 매핑 수정' : '계정 코드 매핑 추가'}
                  </S.ModalTitle>
                  <S.ModalCloseButton onClick={handleCloseMappingModal}>×</S.ModalCloseButton>
                </S.ModalHeader>
                <S.ModalBody>
                  <form onSubmit={handleMappingSubmit}>
                    <S.FormGroup>
                      <S.FormLabel>카테고리</S.FormLabel>
                      <S.FormInput
                        type="text"
                        value={mappingFormData.category}
                        onChange={(e) => setMappingFormData({ ...mappingFormData, category: e.target.value })}
                        required
                        placeholder="예: 식대"
                      />
                    </S.FormGroup>
                    
                    <S.FormGroup>
                      <S.FormLabel $noAsterisk>가맹점 키워드 (선택사항)</S.FormLabel>
                      <S.FormInput
                        type="text"
                        value={mappingFormData.merchantKeyword}
                        onChange={(e) => setMappingFormData({ ...mappingFormData, merchantKeyword: e.target.value })}
                        placeholder="예: 스타벅스"
                      />
                      <S.FormHelpText>특정 가맹점에만 적용하려면 입력하세요. 비우면 해당 카테고리 전체에 적용됩니다.</S.FormHelpText>
                    </S.FormGroup>
                    
                    <S.FormGroup>
                      <S.FormLabel>계정 코드</S.FormLabel>
                      <S.FormInput
                        type="text"
                        value={mappingFormData.accountCode}
                        onChange={(e) => setMappingFormData({ ...mappingFormData, accountCode: e.target.value })}
                        required
                        placeholder="예: 5310"
                      />
                    </S.FormGroup>
                    
                    <S.FormGroup>
                      <S.FormLabel>계정명</S.FormLabel>
                      <S.FormInput
                        type="text"
                        value={mappingFormData.accountName}
                        onChange={(e) => setMappingFormData({ ...mappingFormData, accountName: e.target.value })}
                        required
                        placeholder="예: 접대비"
                      />
                    </S.FormGroup>
                    
                    <S.ModalFooter>
                      <S.ModalButton type="button" onClick={handleCloseMappingModal} variant="secondary">
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
        </S.MappingTabContent>
      )}
    </S.Container>
  );
};

export default ExpenseCategoryPage;


