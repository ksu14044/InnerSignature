import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAuditRuleList, createAuditRule, updateAuditRule, deleteAuditRule, getAuditLogList, resolveAuditLog } from '../../api/auditApi';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt, FaCheck, FaExclamationTriangle, FaInfoCircle, FaList } from 'react-icons/fa';

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
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' 또는 'logs'
  const [logList, setLogList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    severity: '',
    isResolved: '',
    startDate: '',
    endDate: ''
  });
  const pageSize = 10;

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
    if (activeTab === 'rules') {
      loadRuleList();
    } else if (activeTab === 'logs') {
      loadLogList();
    }
  }, [user, navigate, activeTab, currentPage, filters]);

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

  const loadLogList = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      if (filters.severity) filterParams.severity = filters.severity;
      if (filters.isResolved !== '') filterParams.isResolved = filters.isResolved === 'true';
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      
      const response = await getAuditLogList(filterParams, currentPage, pageSize);
      if (response.success && response.data) {
        setLogList(response.data.content || []);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('감사 로그 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '감사 로그 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (auditLogId) => {
    if (!window.confirm('이 감사 로그를 해결 처리하시겠습니까?')) {
      return;
    }

    try {
      const response = await resolveAuditLog(auditLogId);
      if (response.success) {
        alert('감사 로그가 해결 처리되었습니다.');
        loadLogList();
      }
    } catch (error) {
      console.error('감사 로그 해결 처리 실패:', error);
      alert(error?.response?.data?.message || '감사 로그 해결 처리 중 오류가 발생했습니다.');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <FaExclamationTriangle style={{ color: '#dc3545' }} />;
      case 'MEDIUM':
        return <FaInfoCircle style={{ color: '#ffc107' }} />;
      case 'LOW':
        return <FaInfoCircle style={{ color: '#17a2b8' }} />;
      default:
        return <FaInfoCircle style={{ color: '#6c757d' }} />;
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
          감사 관리
        </S.Title>
        <S.ButtonRow>
          {activeTab === 'rules' && canEdit && (
            <S.Button onClick={() => handleOpenModal()}>
              <FaPlus /> 규칙 추가
            </S.Button>
          )}
          <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
        </S.ButtonRow>
      </S.Header>

      {/* 탭 버튼 */}
      <S.TabSection>
        <S.TabButton active={activeTab === 'rules'} onClick={() => setActiveTab('rules')}>
          감사 규칙
        </S.TabButton>
        <S.TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
          감사 로그
        </S.TabButton>
      </S.TabSection>

      {loading && <LoadingOverlay fullScreen={false} message="로딩 중..." />}

      {/* 감사 규칙 탭 */}
      {activeTab === 'rules' && (
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
      )}

      {/* 감사 로그 탭 */}
      {activeTab === 'logs' && (
        <S.LogsTabContent>
          <S.FilterSection>
            <S.FilterGrid>
              <S.FilterGroup>
                <S.Label>심각도</S.Label>
                <S.Select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value, currentPage: 1 }))}
                >
                  <option value="">전체</option>
                  <option value="HIGH">높음</option>
                  <option value="MEDIUM">중간</option>
                  <option value="LOW">낮음</option>
                </S.Select>
              </S.FilterGroup>
              <S.FilterGroup>
                <S.Label>해결 상태</S.Label>
                <S.Select
                  value={filters.isResolved}
                  onChange={(e) => setFilters(prev => ({ ...prev, isResolved: e.target.value, currentPage: 1 }))}
                >
                  <option value="">전체</option>
                  <option value="false">미해결</option>
                  <option value="true">해결됨</option>
                </S.Select>
              </S.FilterGroup>
              <S.FilterGroup>
                <S.Label>시작일</S.Label>
                <S.Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, currentPage: 1 }))}
                />
              </S.FilterGroup>
              <S.FilterGroup>
                <S.Label>종료일</S.Label>
                <S.Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, currentPage: 1 }))}
                />
              </S.FilterGroup>
            </S.FilterGrid>
          </S.FilterSection>

          <S.LogList>
            {logList.length === 0 ? (
              <S.EmptyMessage>감사 로그가 없습니다.</S.EmptyMessage>
            ) : (
              <>
                {logList.map(log => (
                  <S.LogCard key={log.auditLogId} severity={log.severity} resolved={log.isResolved}>
                    <S.LogHeader>
                      <S.LogTitle>
                        {getSeverityIcon(log.severity)}
                        <span>{log.ruleName || '알 수 없음'}</span>
                      </S.LogTitle>
                      <S.LogStatus>
                        {log.isResolved ? (
                          <S.ResolvedBadge>
                            <FaCheck /> 해결됨
                          </S.ResolvedBadge>
                        ) : (
                          <S.UnresolvedBadge>
                            <FaExclamationTriangle /> 미해결
                          </S.UnresolvedBadge>
                        )}
                      </S.LogStatus>
                    </S.LogHeader>
                    <S.LogContent>
                      <S.LogInfo>
                        <S.InfoRow>
                          <S.InfoLabel>심각도:</S.InfoLabel>
                          <S.InfoValue>{log.severity === 'HIGH' ? '높음' : log.severity === 'MEDIUM' ? '중간' : '낮음'}</S.InfoValue>
                        </S.InfoRow>
                        <S.InfoRow>
                          <S.InfoLabel>발생일시:</S.InfoLabel>
                          <S.InfoValue>{new Date(log.createdAt).toLocaleString('ko-KR')}</S.InfoValue>
                        </S.InfoRow>
                        {log.expenseReportId && (
                          <S.InfoRow>
                            <S.InfoLabel>결의서 ID:</S.InfoLabel>
                            <S.LinkButton onClick={() => navigate(`/detail/${log.expenseReportId}`)}>
                              {log.expenseReportId}
                            </S.LinkButton>
                          </S.InfoRow>
                        )}
                        <S.InfoRow>
                          <S.InfoLabel>설명:</S.InfoLabel>
                          <S.InfoValue>{log.description || '-'}</S.InfoValue>
                        </S.InfoRow>
                      </S.LogInfo>
                      {!log.isResolved && (
                        <S.ResolveButton onClick={() => handleResolve(log.auditLogId)}>
                          <FaCheck /> 해결 처리
                        </S.ResolveButton>
                      )}
                    </S.LogContent>
                  </S.LogCard>
                ))}
                <S.Pagination>
                  <S.PaginationButton 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </S.PaginationButton>
                  <S.PaginationInfo>
                    {currentPage} / {totalPages} (총 {totalElements}건)
                  </S.PaginationInfo>
                  <S.PaginationButton 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </S.PaginationButton>
                </S.Pagination>
              </>
            )}
          </S.LogList>
        </S.LogsTabContent>
      )}

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

