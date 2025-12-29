import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAuditRuleList, createAuditRule, updateAuditRule, deleteAuditRule } from '../../api/auditApi';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';

const AuditRuleManagementPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ruleList, setRuleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    ruleName: '',
    ruleType: 'NIGHT_TIME',
    ruleConfig: {},
    isActive: true
  });

  const ruleTypes = [
    { value: 'NIGHT_TIME', label: '심야 시간대 사용' },
    { value: 'WEEKEND', label: '주말/공휴일 사용' },
    { value: 'DUPLICATE_MERCHANT', label: '동일 가맹점 중복 결제' },
    { value: 'FORBIDDEN_CATEGORY', label: '금지 업종 사용' }
  ];

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CEO' && user.role !== 'ACCOUNTANT')) {
      alert('접근 권한이 없습니다. (ADMIN, CEO, ACCOUNTANT 권한 필요)');
      navigate('/expenses');
      return;
    }
    loadRuleList();
  }, [user, navigate]);

  const loadRuleList = async () => {
    try {
      setLoading(true);
      const response = await getAuditRuleList();
      if (response.success) {
        setRuleList(response.data || []);
      }
    } catch (error) {
      console.error('감사 규칙 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '감사 규칙 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      const ruleConfig = rule.getRuleConfig ? rule.getRuleConfig() : (rule.ruleConfig || {});
      setFormData({
        ruleName: rule.ruleName || '',
        ruleType: rule.ruleType || 'NIGHT_TIME',
        ruleConfig: ruleConfig,
        isActive: rule.isActive !== undefined ? rule.isActive : true
      });
    } else {
      setEditingRule(null);
      setFormData({
        ruleName: '',
        ruleType: 'NIGHT_TIME',
        ruleConfig: {},
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  // 규칙 유형 변경 시 설정 초기화
  const handleRuleTypeChange = (ruleType) => {
    let defaultConfig = {};
    if (ruleType === 'DUPLICATE_MERCHANT') {
      defaultConfig = { threshold: 2 };
    } else if (ruleType === 'FORBIDDEN_CATEGORY') {
      defaultConfig = { categories: [] };
    }
    setFormData(prev => ({
      ...prev,
      ruleType,
      ruleConfig: defaultConfig
    }));
  };

  // 금지 업종 카테고리 선택/해제
  const handleCategoryToggle = (category) => {
    const currentCategories = formData.ruleConfig?.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setFormData(prev => ({
      ...prev,
      ruleConfig: { ...prev.ruleConfig, categories: newCategories }
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const ruleData = {
        ruleName: formData.ruleName,
        ruleType: formData.ruleType,
        ruleConfig: formData.ruleConfig,
        isActive: formData.isActive
      };

      if (editingRule) {
        const response = await updateAuditRule(editingRule.ruleId, ruleData);
        if (response.success) {
          alert('감사 규칙이 수정되었습니다.');
          handleCloseModal();
          loadRuleList();
        }
      } else {
        const response = await createAuditRule(ruleData);
        if (response.success) {
          alert('감사 규칙이 생성되었습니다.');
          handleCloseModal();
          loadRuleList();
        }
      }
    } catch (error) {
      console.error('감사 규칙 저장 실패:', error);
      alert(error?.response?.data?.message || '감사 규칙 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('감사 규칙을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteAuditRule(ruleId);
      if (response.success) {
        alert('감사 규칙이 삭제되었습니다.');
        loadRuleList();
      }
    } catch (error) {
      console.error('감사 규칙 삭제 실패:', error);
      alert(error?.response?.data?.message || '감사 규칙 삭제 중 오류가 발생했습니다.');
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
          <FaShieldAlt />
          감사 규칙 관리
        </S.Title>
        <S.ButtonRow>
          {canEdit && (
            <S.Button onClick={() => handleOpenModal()}>
              <FaPlus /> 규칙 추가
            </S.Button>
          )}
          <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
        </S.ButtonRow>
      </S.Header>

      {loading && <LoadingOverlay fullScreen={false} message="로딩 중..." />}

      <S.RuleList>
        {ruleList.length === 0 ? (
          <S.EmptyMessage>감사 규칙이 없습니다.</S.EmptyMessage>
        ) : (
          ruleList.map(rule => (
            <S.RuleCard key={rule.ruleId} active={rule.isActive}>
              <S.RuleHeader>
                <div>
                  <S.RuleTitle>{rule.ruleName}</S.RuleTitle>
                  <S.RuleType>{ruleTypes.find(t => t.value === rule.ruleType)?.label || rule.ruleType}</S.RuleType>
                </div>
                <S.ActionButtons>
                  <S.StatusBadge active={rule.isActive}>
                    {rule.isActive ? '활성' : '비활성'}
                  </S.StatusBadge>
                  {canEdit && (
                    <>
                      <S.IconButton onClick={() => handleOpenModal(rule)}>
                        <FaEdit />
                      </S.IconButton>
                      <S.IconButton onClick={() => handleDelete(rule.ruleId)}>
                        <FaTrash />
                      </S.IconButton>
                    </>
                  )}
                </S.ActionButtons>
              </S.RuleHeader>
              {(() => {
                const ruleConfig = rule.getRuleConfig ? rule.getRuleConfig() : (rule.ruleConfig || {});
                if (!ruleConfig || Object.keys(ruleConfig).length === 0) return null;
                
                return (
                  <S.RuleConfig>
                    <S.ConfigLabel>설정:</S.ConfigLabel>
                    {rule.ruleType === 'DUPLICATE_MERCHANT' && ruleConfig.threshold && (
                      <S.ConfigValue>중복 횟수 기준: {ruleConfig.threshold}회 이상</S.ConfigValue>
                    )}
                    {rule.ruleType === 'FORBIDDEN_CATEGORY' && ruleConfig.categories && (
                      <S.ConfigValue>금지 업종: {ruleConfig.categories.length > 0 ? ruleConfig.categories.join(', ') : '없음'}</S.ConfigValue>
                    )}
                    {(rule.ruleType === 'NIGHT_TIME' || rule.ruleType === 'WEEKEND') && (
                      <S.ConfigValue>추가 설정 없음</S.ConfigValue>
                    )}
                  </S.RuleConfig>
                );
              })()}
            </S.RuleCard>
          ))
        )}
      </S.RuleList>

      {isModalOpen && (
        <S.ModalOverlay onClick={handleCloseModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>{editingRule ? '감사 규칙 수정' : '감사 규칙 추가'}</S.ModalTitle>
              <S.CloseButton onClick={handleCloseModal}>×</S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmit}>
                <S.FormGroup>
                  <S.Label>규칙명</S.Label>
                  <S.Input
                    type="text"
                    value={formData.ruleName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ruleName: e.target.value }))}
                    placeholder="예: 심야 시간대 사용 감사"
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>규칙 유형</S.Label>
                  <S.Select
                    value={formData.ruleType}
                    onChange={(e) => handleRuleTypeChange(e.target.value)}
                    disabled={!!editingRule}
                    required
                  >
                    {ruleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </S.Select>
                </S.FormGroup>

                {/* 규칙 유형별 설정 폼 */}
                {formData.ruleType === 'DUPLICATE_MERCHANT' && (
                  <S.FormGroup>
                    <S.Label>중복 횟수 기준</S.Label>
                    <S.Input
                      type="number"
                      min="2"
                      value={formData.ruleConfig?.threshold || 2}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        ruleConfig: { ...prev.ruleConfig, threshold: parseInt(e.target.value) || 2 }
                      }))}
                      placeholder="예: 2"
                    />
                    <S.HelpText>같은 가맹점에서 몇 회 이상 결제 시 감사할지 설정합니다. (기본값: 2회)</S.HelpText>
                  </S.FormGroup>
                )}

                {formData.ruleType === 'FORBIDDEN_CATEGORY' && (
                  <S.FormGroup>
                    <S.Label>금지 업종 선택</S.Label>
                    <S.CategoryCheckboxGroup>
                      {EXPENSE_CATEGORIES.map(category => (
                        <S.CategoryCheckbox key={category.value}>
                          <input
                            type="checkbox"
                            id={`category-${category.value}`}
                            checked={(formData.ruleConfig?.categories || []).includes(category.value)}
                            onChange={() => handleCategoryToggle(category.value)}
                          />
                          <label htmlFor={`category-${category.value}`}>
                            {category.label}
                          </label>
                        </S.CategoryCheckbox>
                      ))}
                    </S.CategoryCheckboxGroup>
                    <S.HelpText>선택한 업종으로 지출 시 자동으로 감사 로그가 생성됩니다.</S.HelpText>
                  </S.FormGroup>
                )}

                {(formData.ruleType === 'NIGHT_TIME' || formData.ruleType === 'WEEKEND') && (
                  <S.FormGroup>
                    <S.InfoBox>
                      <S.InfoIcon>ℹ️</S.InfoIcon>
                      <S.InfoText>
                        {formData.ruleType === 'NIGHT_TIME' 
                          ? '심야 시간대(22시~06시) 사용 내역을 자동으로 감사합니다. 추가 설정이 필요하지 않습니다.'
                          : '주말 및 공휴일 사용 내역을 자동으로 감사합니다. 추가 설정이 필요하지 않습니다.'}
                      </S.InfoText>
                    </S.InfoBox>
                  </S.FormGroup>
                )}
                <S.FormGroup>
                  <S.CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    활성화
                  </S.CheckboxLabel>
                </S.FormGroup>
                <S.ModalFooter>
                  <S.Button type="button" variant="secondary" onClick={handleCloseModal}>취소</S.Button>
                  <S.Button type="submit">{editingRule ? '수정' : '생성'}</S.Button>
                </S.ModalFooter>
              </form>
            </S.ModalBody>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default AuditRuleManagementPage;

