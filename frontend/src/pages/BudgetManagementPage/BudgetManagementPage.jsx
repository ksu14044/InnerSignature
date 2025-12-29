import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getBudgetList, createBudget, updateBudget, deleteBudget } from '../../api/budgetApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaPlus, FaEdit, FaTrash, FaChartLine } from 'react-icons/fa';

const BudgetManagementPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [budgetList, setBudgetList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    budgetYear: new Date().getFullYear(),
    budgetMonth: null,
    category: '',
    budgetAmount: '',
    alertThreshold: '80',
    isBlocking: false
  });

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CEO' && user.role !== 'ACCOUNTANT')) {
      alert('접근 권한이 없습니다. (ADMIN, CEO, ACCOUNTANT 권한 필요)');
      navigate('/expenses');
      return;
    }
    loadBudgetList();
  }, [user, navigate, selectedYear, selectedMonth]);

  const loadBudgetList = async () => {
    try {
      setLoading(true);
      const response = await getBudgetList(selectedYear, selectedMonth);
      if (response.success) {
        setBudgetList(response.data || []);
      }
    } catch (error) {
      console.error('예산 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '예산 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        budgetYear: budget.budgetYear,
        budgetMonth: budget.budgetMonth,
        category: budget.category,
        budgetAmount: budget.budgetAmount?.toString() || '',
        alertThreshold: budget.alertThreshold?.toString() || '80',
        isBlocking: budget.isBlocking || false
      });
    } else {
      setEditingBudget(null);
      setFormData({
        budgetYear: selectedYear,
        budgetMonth: selectedMonth,
        category: '',
        budgetAmount: '',
        alertThreshold: '80',
        isBlocking: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const budgetData = {
        budgetYear: parseInt(formData.budgetYear),
        budgetMonth: formData.budgetMonth ? parseInt(formData.budgetMonth) : null,
        category: formData.category,
        budgetAmount: parseInt(formData.budgetAmount),
        alertThreshold: parseFloat(formData.alertThreshold),
        isBlocking: formData.isBlocking
      };

      if (editingBudget) {
        const response = await updateBudget(editingBudget.budgetId, budgetData);
        if (response.success) {
          alert('예산이 수정되었습니다.');
          handleCloseModal();
          loadBudgetList();
        }
      } else {
        const response = await createBudget(budgetData);
        if (response.success) {
          alert('예산이 생성되었습니다.');
          handleCloseModal();
          loadBudgetList();
        }
      }
    } catch (error) {
      console.error('예산 저장 실패:', error);
      alert(error?.response?.data?.message || '예산 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('예산을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteBudget(budgetId);
      if (response.success) {
        alert('예산이 삭제되었습니다.');
        loadBudgetList();
      }
    } catch (error) {
      console.error('예산 삭제 실패:', error);
      alert(error?.response?.data?.message || '예산 삭제 중 오류가 발생했습니다.');
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
          <FaChartLine />
          예산 관리
        </S.Title>
        <S.ButtonRow>
          {canEdit && (
            <S.Button onClick={() => handleOpenModal()}>
              <FaPlus /> 예산 추가
            </S.Button>
          )}
          <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
        </S.ButtonRow>
      </S.Header>

      {loading && <LoadingOverlay fullScreen={false} message="로딩 중..." />}

      <S.FilterCard>
        <S.FilterGrid>
          <S.FilterGroup>
            <S.Label>년도</S.Label>
            <S.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </S.Select>
          </S.FilterGroup>
          <S.FilterGroup>
            <S.Label>월</S.Label>
            <S.Select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">전체 (연간)</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </S.Select>
          </S.FilterGroup>
        </S.FilterGrid>
      </S.FilterCard>

      <S.BudgetList>
        {budgetList.length === 0 ? (
          <S.EmptyMessage>예산이 없습니다.</S.EmptyMessage>
        ) : (
          budgetList.map(budget => {
            const usageRate = budget.usageRate || 0;
            const usedAmount = budget.usedAmount || 0;
            const remainingAmount = (budget.budgetAmount || 0) - usedAmount;
            
            return (
              <S.BudgetCard key={budget.budgetId}>
                <S.BudgetHeader>
                  <S.BudgetTitle>
                    {budget.category}
                    {budget.budgetMonth && ` (${budget.budgetMonth}월)`}
                    {!budget.budgetMonth && ' (연간)'}
                  </S.BudgetTitle>
                  {canEdit && (
                    <S.ActionButtons>
                      <S.IconButton onClick={() => handleOpenModal(budget)}>
                        <FaEdit />
                      </S.IconButton>
                      <S.IconButton onClick={() => handleDelete(budget.budgetId)}>
                        <FaTrash />
                      </S.IconButton>
                    </S.ActionButtons>
                  )}
                </S.BudgetHeader>
                <S.BudgetInfo>
                  <S.InfoRow>
                    <S.InfoLabel>예산 금액:</S.InfoLabel>
                    <S.InfoValue>{budget.budgetAmount?.toLocaleString()}원</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>사용 금액:</S.InfoLabel>
                    <S.InfoValue>{usedAmount.toLocaleString()}원</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>잔액:</S.InfoLabel>
                    <S.InfoValue style={{ color: remainingAmount < 0 ? '#dc3545' : '#28a745' }}>
                      {remainingAmount.toLocaleString()}원
                    </S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>사용률:</S.InfoLabel>
                    <S.InfoValue style={{ color: usageRate >= budget.alertThreshold ? '#dc3545' : '#28a745' }}>
                      {usageRate.toFixed(2)}%
                    </S.InfoValue>
                  </S.InfoRow>
                  <S.ProgressBar>
                    <S.ProgressFill 
                      width={Math.min(usageRate, 100)} 
                      color={usageRate >= 100 ? '#dc3545' : usageRate >= budget.alertThreshold ? '#ffc107' : '#28a745'}
                    />
                  </S.ProgressBar>
                  <S.InfoRow>
                    <S.InfoLabel>경고 임계값:</S.InfoLabel>
                    <S.InfoValue>{budget.alertThreshold}%</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>초과 시 차단:</S.InfoLabel>
                    <S.InfoValue>{budget.isBlocking ? '예' : '아니오'}</S.InfoValue>
                  </S.InfoRow>
                </S.BudgetInfo>
              </S.BudgetCard>
            );
          })
        )}
      </S.BudgetList>

      {isModalOpen && (
        <S.ModalOverlay onClick={handleCloseModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>{editingBudget ? '예산 수정' : '예산 추가'}</S.ModalTitle>
              <S.CloseButton onClick={handleCloseModal}>×</S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.Label>년도</S.Label>
                  <S.Input
                    type="number"
                    value={formData.budgetYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetYear: parseInt(e.target.value) }))}
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>월 (선택사항, 비우면 연간 예산)</S.Label>
                  <S.Select
                    value={formData.budgetMonth || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetMonth: e.target.value ? parseInt(e.target.value) : null }))}
                  >
                    <option value="">연간 예산</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </S.Select>
                </S.FormGroup>
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
                  <S.Label>예산 금액 (원)</S.Label>
                  <S.Input
                    type="number"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                    min="0"
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>경고 임계값 (%)</S.Label>
                  <S.Input
                    type="number"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, alertThreshold: e.target.value }))}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.isBlocking}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBlocking: e.target.checked }))}
                    />
                    예산 초과 시 차단
                  </S.CheckboxLabel>
                </S.FormGroup>
                <S.ModalFooter>
                  <S.Button type="button" variant="secondary" onClick={handleCloseModal}>취소</S.Button>
                  <S.Button type="submit">{editingBudget ? '수정' : '생성'}</S.Button>
                </S.ModalFooter>
              </form>
            </S.ModalBody>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default BudgetManagementPage;

