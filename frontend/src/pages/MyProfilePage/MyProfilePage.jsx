import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, updateCurrentUser, changePassword, getUserCompanies, getPendingCompanies, applyToCompany, removeUserFromCompany, setPrimaryCompany } from '../../api/userApi';
import { searchCompanies } from '../../api/companyApi';
import { FaSignOutAlt, FaArrowLeft, FaSearch, FaTimes, FaCheck, FaTrash } from 'react-icons/fa';
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
  const [companies, setCompanies] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({
    companyId: null,
    role: 'USER',
    position: ''
  });

  const navigate = useNavigate();
  const { logout, user: authUser, companies: authCompanies, switchCompany } = useAuth();
  const loadingCompaniesRef = useRef(false); // 중복 요청 방지용

  // loadCompanies를 useCallback으로 감싸서 무한 루프 방지
  const loadCompanies = useCallback(async () => {
    if (loadingCompaniesRef.current) return; // 이미 로딩 중이면 중복 요청 방지
    
    try {
      loadingCompaniesRef.current = true;
      const [companiesRes, pendingRes] = await Promise.all([
        getUserCompanies(),
        getPendingCompanies()
      ]);
      if (companiesRes.success) {
        setCompanies(companiesRes.data || []);
      }
      if (pendingRes.success) {
        setPendingCompanies(pendingRes.data || []);
      }
    } catch (error) {
      console.error('회사 목록 로드 실패:', error);
    } finally {
      loadingCompaniesRef.current = false;
    }
  }, []); // dependency는 빈 배열 (한 번만 생성)

  useEffect(() => {
    if (!authUser) {
      navigate('/');
      return;
    }
    loadUserInfo();
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.userId, loadCompanies]); // navigate 제거, authUser.userId만 체크

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


  const handleSearchCompanies = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await searchCompanies(searchQuery);
      if (response.success && response.data) {
        // 이미 소속된 회사는 제외
        const companyIds = [...companies, ...pendingCompanies].map(c => c.companyId);
        const filtered = response.data.filter(c => !companyIds.includes(c.companyId));
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('회사 검색 실패:', error);
      alert('회사 검색 중 오류가 발생했습니다.');
    }
  };

  const handleApplyToCompany = async () => {
    if (!applyForm.companyId) {
      alert('회사를 선택해주세요.');
      return;
    }
    try {
      setApplying(true);
      const response = await applyToCompany(applyForm.companyId, applyForm.role, applyForm.position);
      if (response.success) {
        alert('회사 지원 요청이 완료되었습니다. 관리자 승인을 기다려주세요.');
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        setApplyForm({ companyId: null, role: 'USER', position: '' });
        loadCompanies();
      } else {
        alert(response.message || '회사 지원 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 지원 요청 실패:', error);
      alert(error?.response?.data?.message || '회사 지원 요청 중 오류가 발생했습니다.');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCompany = async (companyId) => {
    if (!window.confirm('정말 이 회사에서 탈퇴하시겠습니까?')) {
      return;
    }
    try {
      const response = await removeUserFromCompany(companyId);
      if (response.success) {
        alert('회사에서 탈퇴했습니다.');
        loadCompanies();
      } else {
        alert(response.message || '회사 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 탈퇴 실패:', error);
      alert(error?.response?.data?.message || '회사 탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleSetPrimaryCompany = async (companyId) => {
    try {
      const response = await setPrimaryCompany(companyId);
      if (response.success) {
        alert('기본 회사가 설정되었습니다.');
        loadCompanies();
        window.location.reload(); // 토큰 재발급을 위해 새로고침
      } else {
        alert(response.message || '기본 회사 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('기본 회사 설정 실패:', error);
      alert(error?.response?.data?.message || '기본 회사 설정 중 오류가 발생했습니다.');
    }
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'USER': '일반 사용자',
      'ADMIN': '관리자',
      'ACCOUNTANT': '결제 담당자',
      'TAX_ACCOUNTANT': '세무사',
      'SUPERADMIN': '최고 관리자',
      'CEO': '대표'
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

      <S.ProfileCard>
        <S.CardTitle>소속 회사</S.CardTitle>
        
        {/* 승인된 회사 목록 */}
        {companies.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>승인된 회사</h3>
            {companies.map((company) => (
              <div key={company.companyId} style={{ 
                padding: '15px', 
                marginBottom: '10px', 
                border: company.companyId === authUser?.companyId ? '2px solid #28a745' : '1px solid #ddd', 
                borderRadius: '5px',
                backgroundColor: company.companyId === authUser?.companyId ? '#f0f9f4' : 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {company.companyId === authUser?.companyId && (
                      <span style={{ 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        현재
                      </span>
                    )}
                    {company.companyName} 
                    {company.isPrimary && <span style={{ color: '#007bff' }}>(기본)</span>}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    역할: {getRoleLabel(company.role)} | 직급: {company.position || '-'}
                  </div>
                </div>
                <div>
                  {company.companyId !== authUser?.companyId && (
                    <S.Button 
                      onClick={async () => {
                        try {
                          await switchCompany(company.companyId);
                          alert('회사가 전환되었습니다.');
                          window.location.reload();
                        } catch (error) {
                          alert('회사 전환에 실패했습니다.');
                        }
                      }}
                      style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px', backgroundColor: '#007bff' }}
                    >
                      전환
                    </S.Button>
                  )}
                  {company.companyId === authUser?.companyId && (
                    <span style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
                      현재 회사
                    </span>
                  )}
                  {!company.isPrimary && (
                    <S.Button 
                      onClick={() => handleSetPrimaryCompany(company.companyId)}
                      style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      기본 설정
                    </S.Button>
                  )}
                  <S.Button 
                    onClick={() => handleRemoveCompany(company.companyId)}
                    style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#dc3545' }}
                  >
                    <FaTrash /> 탈퇴
                  </S.Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 승인 대기 회사 목록 */}
        {pendingCompanies.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold', color: '#ff9800' }}>승인 대기</h3>
            {pendingCompanies.map((company) => (
              <div key={company.companyId} style={{ 
                padding: '15px', 
                marginBottom: '10px', 
                border: '1px solid #ff9800', 
                borderRadius: '5px',
                backgroundColor: '#fff3cd'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {company.companyName}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  역할: {getRoleLabel(company.role)} | 직급: {company.position || '-'}
                </div>
                <div style={{ fontSize: '12px', color: '#ff9800', marginTop: '5px' }}>
                  관리자 승인 대기 중...
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 회사 검색 및 지원 */}
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <S.Input
              type="text"
              placeholder="회사명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchCompanies()}
              style={{ flex: 1 }}
            />
            <S.Button onClick={handleSearchCompanies}>
              <FaSearch /> 검색
            </S.Button>
            {showSearch && (
              <S.Button onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}>
                <FaTimes /> 닫기
              </S.Button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>검색 결과</h3>
              {searchResults.map((company) => (
                <div key={company.companyId} style={{ 
                  padding: '15px', 
                  marginBottom: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{company.companyName}</div>
                    {company.adminName && (
                      <div style={{ fontSize: '12px', color: '#666' }}>관리자: {company.adminName}</div>
                    )}
                  </div>
                  <S.Button 
                    onClick={() => {
                      setApplyForm({ ...applyForm, companyId: company.companyId });
                      setShowSearch(true);
                    }}
                    style={{ padding: '5px 15px' }}
                  >
                    지원하기
                  </S.Button>
                </div>
              ))}
            </div>
          )}

          {showSearch && applyForm.companyId && (
            <div style={{ 
              padding: '20px', 
              border: '2px solid #007bff', 
              borderRadius: '5px',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ marginBottom: '15px' }}>회사 지원</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>역할</label>
                <select
                  value={applyForm.role}
                  onChange={(e) => setApplyForm({ ...applyForm, role: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="USER">일반 사용자</option>
                  <option value="TAX_ACCOUNTANT">세무사</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>직급 (선택)</label>
                <S.Input
                  type="text"
                  placeholder="예: 사원, 대리, 과장 등"
                  value={applyForm.position}
                  onChange={(e) => setApplyForm({ ...applyForm, position: e.target.value })}
                />
              </div>
              <S.ButtonGroup>
                <S.Button 
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setApplyForm({ companyId: null, role: 'USER', position: '' });
                  }}
                >
                  취소
                </S.Button>
                <S.Button 
                  type="button"
                  primary
                  onClick={handleApplyToCompany}
                  disabled={applying}
                >
                  {applying ? '지원 중...' : '지원 요청'}
                </S.Button>
              </S.ButtonGroup>
            </div>
          )}

          {companies.length === 0 && pendingCompanies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              소속된 회사가 없습니다. 위에서 회사를 검색하여 지원해주세요.
            </div>
          )}
        </div>
      </S.ProfileCard>
    </S.Container>
  );
};

export default MyProfilePage;

