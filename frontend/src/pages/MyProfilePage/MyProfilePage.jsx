import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, updateCurrentUser, changePassword, getUserCompanies, getPendingCompanies, applyToCompany, removeUserFromCompany, setPrimaryCompany } from '../../api/userApi';
import { FaSearch, FaTimes, FaCheck, FaTrash, FaArrowLeft } from 'react-icons/fa';
import CompanyRegistrationModal from '../../components/CompanyRegistrationModal/CompanyRegistrationModal';
import CompanySearchModal from '../../components/CompanySearchModal/CompanySearchModal';
import PageHeader from '../../components/PageHeader/PageHeader';
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
  const [isCompanySearchModalOpen, setIsCompanySearchModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({
    companyId: null,
    role: 'USER',
    position: ''
  });
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  const navigate = useNavigate();
  const { user: authUser, companies: authCompanies, switchCompany } = useAuth();
  const loadingCompaniesRef = useRef(false); // 중복 요청 방지용

  const isAdminOrCEO = authUser?.role === 'CEO' || authUser?.role === 'ADMIN';
  const hasCompany = authUser?.companyId != null;

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



  const handleCompanySelect = (company) => {
    // 이미 소속된 회사인지 확인
    const companyIds = [...companies, ...pendingCompanies].map(c => c.companyId);
    if (companyIds.includes(company.companyId)) {
      alert('이미 소속된 회사입니다.');
      return;
    }
    
    // 선택한 회사로 지원 폼 설정
    setApplyForm({ ...applyForm, companyId: company.companyId });
    setIsCompanySearchModalOpen(false);
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

  const handleCompanyRegistrationSuccess = () => {
    // 회사 등록 성공 후 페이지 새로고침하여 회사 목록 업데이트
    window.location.reload();
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

  // CEO/ADMIN이면 회사 등록 버튼은 항상 노출
  const canRegisterCompany = isAdminOrCEO;
  // 회사/대기 회사가 모두 없을 때만 "회사가 등록되지 않았습니다" 문구 노출
  const showNoCompanyText = isAdminOrCEO && companies.length === 0 && pendingCompanies.length === 0;

  return (
    <S.Container>
      <PageHeader
        title="내 정보"
        subTitleActions={(
          <>
            <S.SubHeaderButton
              type="button"
              onClick={() => setIsCompanySearchModalOpen(true)}
            >
              회사 검색
            </S.SubHeaderButton>
            {canRegisterCompany && (
              <S.SubHeaderPrimaryButton
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
              >
                회사 등록
              </S.SubHeaderPrimaryButton>
            )}
          </>
        )}
      />

      <S.ProfileCard data-tourid="tour-company-section">
        <S.CompanyHeader>
          <S.CardTitle>소속회사</S.CardTitle>
          {companies.length > 0 && (
            <>
              <S.CompanySectionTitle>승인된 회사</S.CompanySectionTitle>
              <S.CompanyCardsContainer>
                {companies.map((company) => {
                  const isCurrent = company.companyId === authUser?.companyId;
                  return (
                    <S.CompanyCard key={company.companyId} isCurrent={isCurrent}>
                      <S.CompanyCardContent>
                        <S.CompanyBadgeRow>
                          {company.isPrimary && (
                            <S.CompanyPillBadge>기본</S.CompanyPillBadge>
                          )}
                          {isCurrent && (
                            <S.CompanyPillBadge>현재 회사</S.CompanyPillBadge>
                          )}
                        </S.CompanyBadgeRow>
                        <S.CompanyInfo>
                          <S.CompanyNameRow>
                            {company.companyName}
                          </S.CompanyNameRow>
                          <S.CompanyDetails>
                            역할 {getRoleLabel(company.role)} 직급 {company.position || '-'}
                          </S.CompanyDetails>
                        </S.CompanyInfo>
                      </S.CompanyCardContent>
                      <S.CompanyActions>
                        {!isCurrent && (
                          <>
                            <S.CompanyActionButton 
                              onClick={async () => {
                                try {
                                  await switchCompany(company.companyId);
                                  alert('회사가 전환되었습니다.');
                                  window.location.reload();
                                } catch (error) {
                                  alert('회사 전환에 실패했습니다.');
                                }
                              }}
                            >
                              전환
                            </S.CompanyActionButton>
                            <S.CompanyActionDivider />
                          </>
                        )}
                        {!company.isPrimary && (
                          <>
                            <S.CompanyActionButton 
                              onClick={() => handleSetPrimaryCompany(company.companyId)}
                            >
                              기본
                            </S.CompanyActionButton>
                            <S.CompanyActionDivider />
                          </>
                        )}
                        <S.CompanyActionButton 
                          onClick={() => handleRemoveCompany(company.companyId)}
                          isDanger
                        >
                          탈퇴
                        </S.CompanyActionButton>
                      </S.CompanyActions>
                    </S.CompanyCard>
                  );
                })}
              </S.CompanyCardsContainer>
            </>
          )}
        </S.CompanyHeader>
        
        {/* CEO/ADMIN이면 회사가 없을 때만 안내 문구 및 버튼 노출 */}
        {canRegisterCompany && showNoCompanyText && (
          <S.Button 
            primary 
            onClick={() => setIsCompanyModalOpen(true)}
            data-tourid="tour-register-company-button"
          >
            회사가 등록되지 않았습니다. 회사 등록하기
          </S.Button>
        )}

        {/* 승인 대기 회사 목록 */}
        {pendingCompanies.length > 0 && (
          <S.CompanySection>
            <S.CompanySectionTitle style={{ color: '#ff9800' }}>승인 대기</S.CompanySectionTitle>
            {pendingCompanies.map((company) => (
              <S.PendingCompanyCard key={company.companyId}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '15px' }}>
                  {company.companyName}
                </div>
                <S.CompanyDetails>
                  역할: {getRoleLabel(company.role)} | 직급: {company.position || '-'}
                </S.CompanyDetails>
                <div style={{ fontSize: '12px', color: '#ff9800', marginTop: '8px', fontWeight: '500' }}>
                  관리자 승인 대기 중...
                </div>
              </S.PendingCompanyCard>
            ))}
          </S.CompanySection>
        )}

        {/* 회사 검색 및 지원 */}
        <div>
          {applyForm.companyId && (
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

      <CompanyRegistrationModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={handleCompanyRegistrationSuccess}
      />
      
      <CompanySearchModal
        isOpen={isCompanySearchModalOpen}
        onClose={() => setIsCompanySearchModalOpen(false)}
        onSelect={handleCompanySelect}
      />
      
      <S.ProfileCard data-tourid="tour-basic-info">
        <S.CompanyHeader>
          <S.CardTitle>기본 정보</S.CardTitle>
          <S.FormContainer>
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
                <label>이름 <S.RequiredMark>*</S.RequiredMark></label>
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
                <S.Button type="submit" primary disabled={saving || changingPassword} data-tourid="tour-save-button">
                  {saving ? '저장 중...' : '저장'}
                </S.Button>
              </S.ButtonGroup>
            </form>
          </S.FormContainer>
        </S.CompanyHeader>
      </S.ProfileCard>

      <S.ProfileCard data-tourid="tour-password-change">
        <S.CompanyHeader>
          <S.CardTitle>비밀번호 변경</S.CardTitle>
          <S.FormContainer>
            <form onSubmit={handlePasswordChange}>
              <S.FormGroup>
                <label>현재 비밀번호 <S.RequiredMark>*</S.RequiredMark></label>
                <S.Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </S.FormGroup>

              <S.FormGroup>
                <label>새 비밀번호 <S.RequiredMark>*</S.RequiredMark></label>
                <S.Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  placeholder="새 비밀번호를 입력하세요"
                />
              </S.FormGroup>

              <S.FormGroup>
                <label>새 비밀번호 확인 <S.RequiredMark>*</S.RequiredMark></label>
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
                <S.Button type="submit" primary disabled={saving || changingPassword} data-tourid="tour-password-submit-button">
                  {changingPassword ? '변경 중...' : '비밀번호 변경'}
                </S.Button>
              </S.ButtonGroup>
            </form>
          </S.FormContainer>
        </S.CompanyHeader>
      </S.ProfileCard>

      

      
    </S.Container>
  );
};

export default MyProfilePage;

