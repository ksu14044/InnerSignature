import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, updateCurrentUser, changePassword } from '../../api/userApi';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

const MyProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    koreanName: '',
    email: '',
    position: '',
    username: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  useEffect(() => {
    if (!authUser) {
      navigate('/');
      return;
    }
    loadUserInfo();
  }, [authUser, navigate]);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setFormData({
          koreanName: response.data.koreanName || '',
          email: response.data.email || '',
          position: response.data.position || '',
          username: response.data.username || '',
          role: response.data.role || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      alert(error?.response?.data?.message || '사용자 정보 조회 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || changingPassword) return;
    try {
      setSaving(true);
      const updateData = {
        koreanName: formData.koreanName,
        email: formData.email,
        position: formData.position
      };
      
      const response = await updateCurrentUser(updateData);
      if (response.success) {
        alert('내 정보가 수정되었습니다.');
        // AuthContext의 user 정보도 업데이트하기 위해 페이지 새로고침 또는 로그인 정보 재조회
        window.location.reload();
      } else {
        alert(response.message || '정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('정보 수정 실패:', error);
      alert(error?.response?.data?.message || '정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (saving || changingPassword) return;
    
    // 새 비밀번호 확인
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 체크
    if (passwordData.newPassword.length < 1) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        alert('비밀번호가 변경되었습니다.');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert(error?.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
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

  if (!authUser) {
    return null;
  }

  if (loading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>내 정보 수정</S.Title>
          <S.WelcomeText>{authUser.koreanName}님 환영합니다</S.WelcomeText>
        </S.HeaderLeft>
        <S.HeaderRight>
          <S.Button onClick={() => navigate('/expenses')}>
            <FaArrowLeft /> 지출결의서 목록
          </S.Button>
          <S.Button onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </S.Button>
        </S.HeaderRight>
      </S.Header>

      <S.ProfileCard>
        <S.CardTitle>기본 정보</S.CardTitle>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <label>아이디</label>
            <S.Input
              type="text"
              value={formData.username}
              disabled
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
              placeholder="예: user@example.com"
            />
          </S.FormGroup>

          <S.FormGroup>
            <label>직급</label>
            <S.Input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="예: 사원, 대리, 과장, 부장 등"
            />
          </S.FormGroup>

          <S.FormGroup>
            <label>권한</label>
            <S.Input
              type="text"
              value={getRoleLabel(formData.role)}
              disabled
            />
            <S.HelpText>권한은 관리자에게 문의하세요.</S.HelpText>
          </S.FormGroup>

          <S.ButtonGroup>
            <S.Button type="button" onClick={() => navigate('/expenses')}>
              취소
            </S.Button>
            <S.Button type="submit" primary disabled={saving || changingPassword}>
              {saving ? '저장 중...' : '저장'}
            </S.Button>
          </S.ButtonGroup>
        </form>
      </S.ProfileCard>

      <S.ProfileCard>
        <S.CardTitle>비밀번호 변경</S.CardTitle>
        <form onSubmit={handlePasswordChange}>
          <S.FormGroup>
            <label>현재 비밀번호 *</label>
            <S.Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
              placeholder="현재 비밀번호를 입력하세요"
            />
          </S.FormGroup>

          <S.FormGroup>
            <label>새 비밀번호 *</label>
            <S.Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              placeholder="새 비밀번호를 입력하세요"
            />
          </S.FormGroup>

          <S.FormGroup>
            <label>새 비밀번호 확인 *</label>
            <S.Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </S.FormGroup>

          <S.ButtonGroup>
            <S.Button type="button" onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}>
              초기화
            </S.Button>
            <S.Button type="submit" primary disabled={saving || changingPassword}>
              {changingPassword ? '변경 중...' : '비밀번호 변경'}
            </S.Button>
          </S.ButtonGroup>
        </form>
      </S.ProfileCard>
    </S.Container>
  );
};

export default MyProfilePage;

