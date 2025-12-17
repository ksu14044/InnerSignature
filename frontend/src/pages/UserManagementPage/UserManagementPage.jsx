import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser, updateUserRole, getCompanyUsers } from '../../api/userApi';
import { USER_ROLES } from '../../constants/status';
import { FaPlus, FaSignOutAlt, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
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
  const { logout, user } = useAuth();

  // SUPERADMIN, CEO 또는 ADMIN 권한 체크
  useEffect(() => {
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'CEO' && user.role !== 'ADMIN')) {
      alert('ADMIN 권한이 필요합니다.');
      navigate('/expenses');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'SUPERADMIN' || user?.role === 'CEO' || user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      let response;
      if (user?.role === 'SUPERADMIN') {
        // SUPERADMIN: 전체 사용자 조회
        response = await getAllUsers();
      } else if (user?.role === 'CEO' || user?.role === 'ADMIN') {
        // CEO, ADMIN: 자기 회사 직원만 조회
        response = await getCompanyUsers();
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
  };

  const handleLogout = async () => {
    navigate('/');  // 먼저 로그인 페이지로 이동
    await logout();  // 그 다음 로그아웃 처리
  };

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

  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'CEO' && user.role !== 'ADMIN')) {
    return null;
  }
  
  const isAdmin = user.role === 'ADMIN';
  const isCEO = user.role === 'CEO';
  const isSuperAdmin = user.role === 'SUPERADMIN';

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>사용자 관리</S.Title>
          <S.WelcomeText>{user.koreanName}님 환영합니다</S.WelcomeText>
        </S.HeaderLeft>
        <S.HeaderRight>
          <S.Button onClick={() => navigate('/expenses')}>
            지출결의서 목록
          </S.Button>
          <S.Button onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </S.Button>
        </S.HeaderRight>
      </S.Header>

      <S.Toolbar>
        <S.Button primary onClick={handleCreate}>
          <FaPlus /> 사용자 생성
        </S.Button>
      </S.Toolbar>

      {loading ? (
        <LoadingOverlay fullScreen={false} message="로딩 중..." />
      ) : (
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

