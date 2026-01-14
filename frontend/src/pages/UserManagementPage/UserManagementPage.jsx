import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser, updateUserRole, getCompanyUsers, getCompanyUsersById, getCompanyApplications, approveUserCompany, rejectUserCompany, updateApproverStatus } from '../../api/userApi';
import { getUserCompanies } from '../../api/userApi';
import { USER_ROLES } from '../../constants/status';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaBan } from 'react-icons/fa';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [userCompanies, setUserCompanies] = useState([]);
  const [companyApplications, setCompanyApplications] = useState({});
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [loadingApplications, setLoadingApplications] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    koreanName: '',
    email: '',
    position: '',
    role: 'USER',
    isActive: true
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  // SUPERADMIN, CEO 또는 ADMIN 권한 체크
  useEffect(() => {
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'CEO' && user.role !== 'ADMIN')) {
      alert('ADMIN 권한이 필요합니다.');
      navigate('/expenses');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'SUPERADMIN' || user?.role === 'CEO' || user?.role === 'ADMIN') {
      if (user?.role === 'CEO' || user?.role === 'ADMIN') {
        loadUserCompanies();
      } else {
        loadUsers();
      }
    }
  }, [user]);

  const loadUserCompanies = async () => {
    try {
      const response = await getUserCompanies();
      if (response.success && response.data) {
        setUserCompanies(response.data || []);
        if (response.data.length > 0) {
          const firstCompanyId = response.data[0].companyId;
          setSelectedCompanyId(firstCompanyId);
          loadCompanyApplications(firstCompanyId);
          loadUsers(firstCompanyId); // 첫 번째 회사의 직원 목록도 함께 로드
        }
      }
    } catch (error) {
      console.error('소속 회사 목록 조회 실패:', error);
    }
  };

  const loadCompanyApplications = async (companyId) => {
    if (!companyId) return;
    try {
      setLoadingApplications(true);
      const response = await getCompanyApplications(companyId);
      if (response.success && response.data) {
        setCompanyApplications(prev => ({
          ...prev,
          [companyId]: response.data || []
        }));
      }
    } catch (error) {
      console.error('회사 승인 대기 사용자 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '승인 대기 사용자 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApproveUserCompany = async (userId, companyId) => {
    if (!window.confirm('이 사용자의 회사 소속을 승인하시겠습니까?')) {
      return;
    }
    try {
      const response = await approveUserCompany(userId, companyId);
      if (response.success) {
        alert('회사 소속이 승인되었습니다.');
        loadCompanyApplications(companyId);
        loadUsers();
      } else {
        alert(response.message || '승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 소속 승인 실패:', error);
      alert(error?.response?.data?.message || '승인 중 오류가 발생했습니다.');
    }
  };

  const handleRejectUserCompany = async (userId, companyId) => {
    if (!window.confirm('이 사용자의 회사 소속 요청을 거부하시겠습니까?')) {
      return;
    }
    try {
      const response = await rejectUserCompany(userId, companyId);
      if (response.success) {
        alert('회사 소속이 거부되었습니다.');
        loadCompanyApplications(companyId);
      } else {
        alert(response.message || '거부에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 소속 거부 실패:', error);
      alert(error?.response?.data?.message || '거부 중 오류가 발생했습니다.');
    }
  };

  // useCallback으로 최적화
  const loadUsers = useCallback(async (companyId = null) => {
    try {
      setLoading(true);
      let response;
      if (user?.role === 'SUPERADMIN') {
        // SUPERADMIN: 전체 사용자 조회
        response = await getAllUsers();
      } else if (user?.role === 'CEO' || user?.role === 'ADMIN') {
        if (companyId) {
          // 선택된 회사의 직원 조회
          response = await getCompanyUsersById(companyId);
        } else {
          // 기본: 현재 회사 직원 조회
          response = await getCompanyUsers();
        }
      } else {
        setLoading(false);
        return;
      }
      
      if (response.success) {
        setUsers(response.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '사용자 목록 조회 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [user]);


  const handleCreate = () => {
    setFormData({
      username: '',
      password: '',
      koreanName: '',
      email: '',
      position: '',
      role: 'USER',
      isActive: true
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      koreanName: user.koreanName || '',
      email: user.email || '',
      position: user.position || '',
      role: user.role || 'USER',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (deletingUserId === userId) return;
    try {
      setDeletingUserId(userId);
      const response = await deleteUser(userId);
      if (response.success) {
        alert('사용자가 삭제되었습니다.');
        loadUsers();
      } else {
        alert(response.message || '사용자 삭제에 실패했습니다.');
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      alert(error?.response?.data?.message || '사용자 삭제 중 오류가 발생했습니다.');
      setDeleteConfirm(null);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (isCreating || isUpdating) return;
    try {
      setIsCreating(true);
      const response = await createUser(formData);
      if (response.success) {
        alert('사용자가 생성되었습니다.');
        setIsCreateModalOpen(false);
        loadUsers();
      } else {
        alert(response.message || '사용자 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 생성 실패:', error);
      alert(error?.response?.data?.message || '사용자 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (isCreating || isUpdating) return;
    try {
      setIsUpdating(true);
      const updateData = {
        // koreanName과 email 제거 (SUPERADMIN은 수정 불가)
        position: formData.position,
        role: formData.role,
        isActive: formData.isActive
      };
      
      const response = await updateUser(selectedUser.userId, updateData);
      if (response.success) {
        alert('사용자 정보가 수정되었습니다.');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        alert(response.message || '사용자 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
      alert(error?.response?.data?.message || '사용자 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`이 사용자의 권한을 "${getRoleLabel(newRole)}"로 변경하시겠습니까?`)) {
      return;
    }
    
    try {
      setIsUpdating(true);
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        alert('권한이 변경되었습니다.');
        loadUsers();
      } else {
        alert(response.message || '권한 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('권한 변경 실패:', error);
      alert(error?.response?.data?.message || '권한 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'USER': '일반 사용자',
      'ADMIN': '관리자',
      'ACCOUNTANT': '결제 담당자',
      'TAX_ACCOUNTANT': '세무사',
      'SUPERADMIN': '최고 관리자'
    };
    return roleMap[role] || role;
  };

  const handleApproverToggle = async (targetUser) => {
    // CEO/ADMIN만 결재자 지정 가능
    if (!isAdmin && !isCEO) {
      return;
    }
    
    const currentCompanyId = selectedCompanyId || user?.companyId;
    if (!currentCompanyId) {
      alert('회사 정보가 없습니다.');
      return;
    }
    
    const newApproverStatus = !targetUser.isApprover;
    
    try {
      setIsUpdating(true);
      const response = await updateApproverStatus(targetUser.userId, currentCompanyId, newApproverStatus);
      if (response.success) {
        // 성공 시 사용자 목록 다시 로드
        loadUsers(currentCompanyId);
      } else {
        alert(response.message || '결재자 지정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('결재자 지정 변경 실패:', error);
      alert(error?.response?.data?.message || '결재자 지정 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'CEO' && user.role !== 'ADMIN')) {
    return null;
  }
  
  const isAdmin = user.role === 'ADMIN';
  const isCEO = user.role === 'CEO';
  const isSuperAdmin = user.role === 'SUPERADMIN';

  return (
    <S.Container>
      {/* 모바일용 새 사용자 추가 버튼 */}
      <S.MobileToolbar>
        <S.Button primary onClick={handleCreate} aria-label="새 사용자 추가">
          <FaPlus /> 사용자 생성
        </S.Button>
      </S.MobileToolbar>

      {/* 회사 선택 (CEO/ADMIN만) */}
      {(isAdmin || isCEO) && userCompanies.length > 0 && (
        <S.ProfileCard style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#495057' }}>
            승인 대기 사용자 조회할 회사 선택
          </label>
          <S.Select
            value={selectedCompanyId || ''}
            onChange={(e) => {
              const companyId = e.target.value ? Number(e.target.value) : null;
              setSelectedCompanyId(companyId);
              if (companyId) {
                loadCompanyApplications(companyId);
                loadUsers(companyId); // 선택된 회사의 직원 목록도 함께 로드
              } else {
                loadUsers(); // 회사 선택 해제 시 기본 회사 직원 조회
              }
            }}
          >
            <option value="">회사를 선택하세요</option>
            {userCompanies.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.companyName}
              </option>
            ))}
          </S.Select>
        </S.ProfileCard>
      )}

      {/* 회사별 승인 대기 사용자 (CEO/ADMIN만) */}
      {(isAdmin || isCEO) && selectedCompanyId && (
        <S.ProfileCard style={{ marginBottom: '20px' }}>
          <S.CardTitle>
            {userCompanies.find(c => c.companyId === selectedCompanyId)?.companyName} - 승인 대기 사용자
          </S.CardTitle>
          {loadingApplications ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
          ) : (
            <>
              {companyApplications[selectedCompanyId]?.length > 0 ? (
                <>
                  {/* 데스크톱 테이블 뷰 */}
                  <S.Table>
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>아이디</th>
                        <th>이메일</th>
                        <th>요청 역할</th>
                        <th>요청 직급</th>
                        <th>요청일</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyApplications[selectedCompanyId].map((application) => (
                        <tr key={application.userCompanyId}>
                          <td>{application.koreanName}</td>
                          <td>{application.username}</td>
                          <td>{application.email || '-'}</td>
                          <td>{getRoleLabel(application.role)}</td>
                          <td>{application.position || '-'}</td>
                          <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                          <td>
                            <S.ActionButtons>
                              <S.IconButton
                                onClick={() => handleApproveUserCompany(application.userId, application.companyId)}
                                style={{ color: '#28a745', marginRight: '10px' }}
                                title="승인"
                              >
                                <FaCheck />
                              </S.IconButton>
                              <S.IconButton
                                onClick={() => handleRejectUserCompany(application.userId, application.companyId)}
                                danger
                                title="거부"
                              >
                                <FaBan />
                              </S.IconButton>
                            </S.ActionButtons>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </S.Table>

                  {/* 모바일 카드 뷰 */}
                  <S.MobileCardContainer>
                    {companyApplications[selectedCompanyId].map((application) => (
                      <S.UserCard key={application.userCompanyId}>
                        <S.UserCardHeader>
                          <S.UserCardInfo>
                            <S.UserCardName>{application.koreanName}</S.UserCardName>
                            <S.UserCardId>@{application.username}</S.UserCardId>
                          </S.UserCardInfo>
                        </S.UserCardHeader>
                        <S.UserCardBody>
                          <S.UserCardRow>
                            <S.UserCardLabel>이메일</S.UserCardLabel>
                            <S.UserCardValue>{application.email || '-'}</S.UserCardValue>
                          </S.UserCardRow>
                          <S.UserCardRow>
                            <S.UserCardLabel>요청 역할</S.UserCardLabel>
                            <S.UserCardValue>{getRoleLabel(application.role)}</S.UserCardValue>
                          </S.UserCardRow>
                          <S.UserCardRow>
                            <S.UserCardLabel>요청 직급</S.UserCardLabel>
                            <S.UserCardValue>{application.position || '-'}</S.UserCardValue>
                          </S.UserCardRow>
                          <S.UserCardRow>
                            <S.UserCardLabel>요청일</S.UserCardLabel>
                            <S.UserCardValue>{new Date(application.createdAt).toLocaleDateString()}</S.UserCardValue>
                          </S.UserCardRow>
                        </S.UserCardBody>
                        <S.UserCardActions>
                          <S.ActionButtons>
                            <S.IconButton
                              onClick={() => handleApproveUserCompany(application.userId, application.companyId)}
                              style={{ color: '#28a745', flex: 1 }}
                            >
                              <FaCheck /> 승인
                            </S.IconButton>
                            <S.IconButton
                              onClick={() => handleRejectUserCompany(application.userId, application.companyId)}
                              danger
                              style={{ flex: 1 }}
                            >
                              <FaBan /> 거부
                            </S.IconButton>
                          </S.ActionButtons>
                        </S.UserCardActions>
                      </S.UserCard>
                    ))}
                  </S.MobileCardContainer>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  승인 대기 사용자가 없습니다.
                </div>
              )}
            </>
          )}
        </S.ProfileCard>
      )}

      {loading ? (
        <LoadingOverlay fullScreen={false} message="로딩 중..." />
      ) : (
        <>
          {/* 데스크톱 테이블 뷰 */}
          <S.Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>아이디</th>
                <th>이름</th>
                <th>이메일</th>
                <th>직급</th>
                <th>권한</th>
                <th>상태</th>
                {(isAdmin || isCEO) && <th>결재자 지정</th>}
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((targetUser) => (
                <tr key={targetUser.userId}>
                  <td>{targetUser.userId}</td>
                  <td>{targetUser.username}</td>
                  <td>{targetUser.koreanName}</td>
                  <td>{targetUser.email || '-'}</td>
                  <td>{targetUser.position || '-'}</td>
                  <td>{getRoleLabel(targetUser.role)}</td>
                  <td>
                    <S.StatusBadge active={targetUser.isActive}>
                      {targetUser.isActive ? '활성' : '비활성'}
                    </S.StatusBadge>
                  </td>
                  {(isAdmin || isCEO) && (
                    <td>
                      {/* ADMIN은 CEO를 결재자로 지정할 수 없음 */}
                      {isAdmin && targetUser.role === 'CEO' ? (
                        <span style={{ color: '#999', fontSize: '12px' }}>지정 불가</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={targetUser.isApprover || false}
                          onChange={() => handleApproverToggle(targetUser)}
                          disabled={isUpdating || targetUser.userId === user?.userId}
                          title={targetUser.isApprover ? '결재자 지정 해제' : '결재자 지정'}
                        />
                      )}
                    </td>
                  )}
                  <td>
                    <S.ActionButtons>
                      {(isAdmin || isCEO) && (
                        <S.RoleSelect
                          value={targetUser.role}
                          onChange={(e) => handleRoleChange(targetUser.userId, e.target.value)}
                          disabled={targetUser.userId === user?.userId || isCreating || isUpdating}
                        >
                          <option value="USER">일반 사용자</option>
                          <option value="ADMIN">관리자</option>
                          <option value="ACCOUNTANT">결재 담당자</option>
                          <option value="TAX_ACCOUNTANT">세무사</option>
                        </S.RoleSelect>
                      )}
                      {isSuperAdmin && (
                        <>
                          <S.IconButton onClick={() => handleEdit(targetUser)}>
                            <FaEdit />
                          </S.IconButton>
                          <S.IconButton 
                            danger 
                            onClick={() => setDeleteConfirm(targetUser.userId)}
                            disabled={targetUser.userId === user?.userId || deletingUserId === targetUser.userId || deletingUserId !== null || isCreating || isUpdating}
                            title={deletingUserId === targetUser.userId ? '삭제 중...' : '삭제'}
                          >
                            <FaTrash />
                          </S.IconButton>
                        </>
                      )}
                    </S.ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </S.Table>

          {/* 모바일 카드 뷰 */}
          <S.MobileCardContainer>
            {users.map((targetUser) => (
              <S.UserCard key={targetUser.userId}>
                <S.UserCardHeader>
                  <S.UserCardInfo>
                    <S.UserCardName>{targetUser.koreanName}</S.UserCardName>
                    <S.UserCardId>@{targetUser.username} (ID: {targetUser.userId})</S.UserCardId>
                  </S.UserCardInfo>
                  <S.StatusBadge active={targetUser.isActive}>
                    {targetUser.isActive ? '활성' : '비활성'}
                  </S.StatusBadge>
                </S.UserCardHeader>
                <S.UserCardBody>
                  <S.UserCardRow>
                    <S.UserCardLabel>이메일</S.UserCardLabel>
                    <S.UserCardValue>{targetUser.email || '-'}</S.UserCardValue>
                  </S.UserCardRow>
                  <S.UserCardRow>
                    <S.UserCardLabel>직급</S.UserCardLabel>
                    <S.UserCardValue>{targetUser.position || '-'}</S.UserCardValue>
                  </S.UserCardRow>
                  <S.UserCardRow>
                    <S.UserCardLabel>권한</S.UserCardLabel>
                    <S.UserCardValue>{getRoleLabel(targetUser.role)}</S.UserCardValue>
                  </S.UserCardRow>
                  {(isAdmin || isCEO) && (
                    <S.UserCardRow>
                      <S.UserCardLabel>결재자 지정</S.UserCardLabel>
                      <S.UserCardValue>
                        {isAdmin && targetUser.role === 'CEO' ? (
                          <span style={{ color: '#999', fontSize: '12px' }}>지정 불가</span>
                        ) : (
                          <S.MobileCheckbox
                            type="checkbox"
                            checked={targetUser.isApprover || false}
                            onChange={() => handleApproverToggle(targetUser)}
                            disabled={isUpdating || targetUser.userId === user?.userId}
                          />
                        )}
                      </S.UserCardValue>
                    </S.UserCardRow>
                  )}
                </S.UserCardBody>
                <S.UserCardActions>
                  {(isAdmin || isCEO) && (
                    <S.MobileSelect
                      value={targetUser.role}
                      onChange={(e) => handleRoleChange(targetUser.userId, e.target.value)}
                      disabled={targetUser.userId === user?.userId || isCreating || isUpdating}
                    >
                      <option value="USER">일반 사용자</option>
                      <option value="ADMIN">관리자</option>
                      <option value="ACCOUNTANT">결재 담당자</option>
                      <option value="TAX_ACCOUNTANT">세무사</option>
                    </S.MobileSelect>
                  )}
                  {isSuperAdmin && (
                    <S.ActionButtons>
                      <S.IconButton onClick={() => handleEdit(targetUser)}>
                        <FaEdit /> 수정
                      </S.IconButton>
                      <S.IconButton 
                        danger 
                        onClick={() => setDeleteConfirm(targetUser.userId)}
                        disabled={targetUser.userId === user?.userId || deletingUserId === targetUser.userId || deletingUserId !== null || isCreating || isUpdating}
                      >
                        <FaTrash /> 삭제
                      </S.IconButton>
                    </S.ActionButtons>
                  )}
                </S.UserCardActions>
              </S.UserCard>
            ))}
          </S.MobileCardContainer>
        </>
      )}

      {/* 생성 모달 */}
      {isCreateModalOpen && (
        <S.ModalOverlay onClick={() => setIsCreateModalOpen(false)}>
          <S.Modal onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>사용자 생성</S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateModalOpen(false)}>
                <FaTimes />
              </S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmitCreate}>
                <S.FormGroup>
                  <label>아이디 *</label>
                  <S.Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>비밀번호 *</label>
                  <S.Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>이름 *</label>
                  <S.Input
                    type="text"
                    value={formData.koreanName}
                    onChange={(e) => setFormData({ ...formData, koreanName: e.target.value })}
                    required
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>이메일</label>
                  <S.Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>직급</label>
                  <S.Input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>권한 *</label>
                  <S.Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="USER">일반 사용자</option>
                    <option value="ADMIN">관리자</option>
                    <option value="ACCOUNTANT">결제 담당자</option>
                    <option value="TAX_ACCOUNTANT">세무사</option>
                  </S.Select>
                </S.FormGroup>
                <S.ModalFooter>
                  <S.Button type="button" onClick={() => setIsCreateModalOpen(false)}>
                    취소
                  </S.Button>
                  <S.Button type="submit" primary disabled={isCreating || isUpdating}>
                    {isCreating ? '생성 중...' : '생성'}
                  </S.Button>
                </S.ModalFooter>
              </form>
            </S.ModalBody>
          </S.Modal>
        </S.ModalOverlay>
      )}

      {/* 수정 모달 */}
      {isEditModalOpen && selectedUser && (
        <S.ModalOverlay onClick={() => setIsEditModalOpen(false)}>
          <S.Modal onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>사용자 정보 수정</S.ModalTitle>
              <S.CloseButton onClick={() => setIsEditModalOpen(false)}>
                <FaTimes />
              </S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <form onSubmit={handleSubmitEdit}>
                <S.FormGroup>
                  <label>아이디</label>
                  <S.Input
                    type="text"
                    value={formData.username}
                    disabled
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>이름</label>
                  <S.Input
                    type="text"
                    value={formData.koreanName}
                    disabled
                    title="SUPERADMIN은 이름을 수정할 수 없습니다."
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>이메일</label>
                  <S.Input
                    type="email"
                    value={formData.email}
                    disabled
                    title="SUPERADMIN은 이메일을 수정할 수 없습니다."
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>직급</label>
                  <S.Input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <label>권한 *</label>
                  <S.Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="USER">일반 사용자</option>
                    <option value="ADMIN">관리자</option>
                    <option value="ACCOUNTANT">결제 담당자</option>
                    <option value="TAX_ACCOUNTANT">세무사</option>
                    <option value="SUPERADMIN">최고 관리자</option>
                  </S.Select>
                </S.FormGroup>
                <S.FormGroup>
                  <label>상태</label>
                  <S.Select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">활성</option>
                    <option value="false">비활성</option>
                  </S.Select>
                </S.FormGroup>
                <S.ModalFooter>
                  <S.Button type="button" onClick={() => setIsEditModalOpen(false)}>
                    취소
                  </S.Button>
                  <S.Button type="submit" primary disabled={isCreating || isUpdating}>
                    {isUpdating ? '수정 중...' : '수정'}
                  </S.Button>
                </S.ModalFooter>
              </form>
            </S.ModalBody>
          </S.Modal>
        </S.ModalOverlay>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteConfirm && (
        <S.ModalOverlay onClick={() => setDeleteConfirm(null)}>
          <S.ConfirmDialog onClick={(e) => e.stopPropagation()}>
            <S.ConfirmTitle>사용자 삭제</S.ConfirmTitle>
            <S.ConfirmMessage>
              정말로 이 사용자를 삭제하시겠습니까?
            </S.ConfirmMessage>
            <S.ConfirmButtons>
              <S.Button onClick={() => setDeleteConfirm(null)}>취소</S.Button>
              <S.Button 
                danger 
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deletingUserId === deleteConfirm || deletingUserId !== null || isCreating || isUpdating}
              >
                {deletingUserId === deleteConfirm ? '삭제 중...' : '삭제'}
              </S.Button>
            </S.ConfirmButtons>
          </S.ConfirmDialog>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default UserManagementPage;

