import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAuditRuleList, createAuditRule, updateAuditRule, deleteAuditRule } from '../../api/auditApi';
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
      setFormData({
        ruleName: rule.ruleName || '',
        ruleType: rule.ruleType || 'NIGHT_TIME',
        ruleConfig: rule.getRuleConfig ? rule.getRuleConfig() : {},
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
              {rule.ruleConfig && Object.keys(rule.ruleConfig).length > 0 && (
                <S.RuleConfig>
                  <S.ConfigLabel>설정:</S.ConfigLabel>
                  <S.ConfigValue>{JSON.stringify(rule.ruleConfig, null, 2)}</S.ConfigValue>
                </S.RuleConfig>
              )}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, ruleType: e.target.value }))}
                    disabled={!!editingRule}
                    required
                  >
                    {ruleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </S.Select>
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>규칙 설정 (JSON 형식)</S.Label>
                  <S.TextArea
                    value={JSON.stringify(formData.ruleConfig, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setFormData(prev => ({ ...prev, ruleConfig: config }));
                      } catch {
                        // JSON 파싱 실패 시 무시
                      }
                    }}
                    placeholder='예: {"threshold": 2}'
                    rows="4"
                  />
                </S.FormGroup>
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

