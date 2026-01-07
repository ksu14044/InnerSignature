import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, updateCurrentUser, changePassword, getUserCompanies, getPendingCompanies, applyToCompany, removeUserFromCompany, setPrimaryCompany } from '../../api/userApi';
import { getMySignatures, createSignature, updateSignature, deleteSignature, setDefaultSignature } from '../../api/signatureApi';
import { FaSignOutAlt, FaArrowLeft, FaSearch, FaTimes, FaCheck, FaTrash, FaUserCheck, FaCreditCard, FaPen, FaStar, FaStamp } from 'react-icons/fa';
import CompanyRegistrationModal from '../../components/CompanyRegistrationModal/CompanyRegistrationModal';
import CompanySearchModal from '../../components/CompanySearchModal/CompanySearchModal';
import TourButton from '../../components/TourButton/TourButton';
import SignatureModal from '../../components/SignatureModal/SignatureModal';
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
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);
  const [isTypeSelectModalOpen, setIsTypeSelectModalOpen] = useState(false);
  const [selectedSignatureType, setSelectedSignatureType] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { logout, user: authUser, companies: authCompanies, switchCompany } = useAuth();
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
    loadSignatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.userId, loadCompanies]); // navigate 제거, authUser.userId만 체크

  const loadSignatures = async () => {
    try {
      const response = await getMySignatures();
      if (response.success) {
        setSavedSignatures(response.data || []);
      }
    } catch (error) {
      console.error('서명/도장 목록 조회 실패:', error);
    }
  };

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

  // 타입 선택 핸들러
  const handleSelectSignatureType = (type) => {
    setSelectedSignatureType(type);
    setIsTypeSelectModalOpen(false);
    
    if (type === 'SIGNATURE') {
      // 서명 모달 열기
      setIsSignatureModalOpen(true);
    } else if (type === 'STAMP') {
      // 이미지 업로드 열기
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      handleSaveSignatureData(base64Data, 'STAMP');
    };
    reader.readAsDataURL(file);
    
    // 파일 입력 초기화
    event.target.value = '';
  };

  // 서명/도장 데이터 저장 핸들러 (타입 선택 후)
  const handleSaveSignatureData = async (signatureData, signatureType) => {
    if (isSavingSignature) return;
    
    try {
      setIsSavingSignature(true);
      const signatureName = prompt('서명/도장 이름을 입력해주세요:', editingSignature?.signatureName || (signatureType === 'STAMP' ? '기본 도장' : '기본 서명'));
      if (!signatureName) {
        setIsSavingSignature(false);
        return;
      }

      const isDefault = savedSignatures.length === 0 || confirm('기본 서명/도장으로 설정하시겠습니까?');

      if (editingSignature) {
        // 수정
        const response = await updateSignature(editingSignature.signatureId, {
          signatureName,
          signatureType,
          signatureData,
          isDefault
        });
        if (response.success) {
          alert('서명/도장이 수정되었습니다.');
          setIsSignatureModalOpen(false);
          setEditingSignature(null);
          setSelectedSignatureType(null);
          loadSignatures();
        } else {
          alert('서명/도장 수정 실패: ' + response.message);
        }
      } else {
        // 생성
        const response = await createSignature({
          signatureName,
          signatureType,
          signatureData,
          isDefault
        });
        if (response.success) {
          alert('서명/도장이 저장되었습니다.');
          setIsSignatureModalOpen(false);
          setSelectedSignatureType(null);
          loadSignatures();
        } else {
          alert('서명/도장 저장 실패: ' + response.message);
        }
      }
    } catch (error) {
      console.error('서명/도장 저장 실패:', error);
      alert('서명/도장 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingSignature(false);
    }
  };

  // 서명 모달에서 호출되는 핸들러
  const handleSaveSignature = async (signatureData) => {
    await handleSaveSignatureData(signatureData, selectedSignatureType || 'SIGNATURE');
  };

  // 새 서명/도장 추가 버튼 클릭 핸들러
  const handleAddNewSignature = () => {
    setEditingSignature(null);
    setSelectedSignatureType(null);
    setIsTypeSelectModalOpen(true);
  };

  // 서명/도장 삭제 핸들러
  const handleDeleteSignature = async (signatureId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await deleteSignature(signatureId);
      if (response.success) {
        alert('서명/도장이 삭제되었습니다.');
        loadSignatures();
      } else {
        alert('서명/도장 삭제 실패: ' + response.message);
      }
    } catch (error) {
      console.error('서명/도장 삭제 실패:', error);
      alert('서명/도장 삭제 중 오류가 발생했습니다.');
    }
  };

  // 기본 서명/도장 설정 핸들러
  const handleSetDefaultSignature = async (signatureId) => {
    try {
      const response = await setDefaultSignature(signatureId);
      if (response.success) {
        alert('기본 서명/도장이 설정되었습니다.');
        loadSignatures();
      } else {
        alert('기본 서명/도장 설정 실패: ' + response.message);
      }
    } catch (error) {
      console.error('기본 서명/도장 설정 실패:', error);
      alert('기본 서명/도장 설정 중 오류가 발생했습니다.');
    }
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
      <S.Header>
        <S.HeaderLeft>
          <S.Title data-tourid="tour-profile-header">내 정보 수정</S.Title>
          <S.WelcomeText>{authUser.koreanName}님 환영합니다</S.WelcomeText>
        </S.HeaderLeft>
        <S.HeaderRight>
          <TourButton />
          <S.Button onClick={() => navigate('/expenses')}>
            <FaArrowLeft /> 지출결의서 목록
          </S.Button>
          <S.Button onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </S.Button>
        </S.HeaderRight>
      </S.Header>

      <S.ProfileCard data-tourid="tour-basic-info">
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
            <S.Button type="submit" primary disabled={saving || changingPassword} data-tourid="tour-save-button">
              {saving ? '저장 중...' : '저장'}
            </S.Button>
          </S.ButtonGroup>
        </form>
      </S.ProfileCard>

      <S.ProfileCard data-tourid="tour-password-change">
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
            <S.Button type="submit" primary disabled={saving || changingPassword} data-tourid="tour-password-submit-button">
              {changingPassword ? '변경 중...' : '비밀번호 변경'}
            </S.Button>
          </S.ButtonGroup>
        </form>
      </S.ProfileCard>

      <S.ProfileCard data-tourid="tour-company-section">
        <S.CardTitle>소속 회사</S.CardTitle>
        
        {/* CEO/ADMIN이면 항상 회사 등록 버튼 표시, 회사가 없을 때만 안내 문구 노출 */}
        {canRegisterCompany && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            {showNoCompanyText && (
              <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#495057' }}>
                회사가 등록되지 않았습니다.
              </div>
            )}
            <S.Button 
              primary 
              onClick={() => setIsCompanyModalOpen(true)}
              style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 'bold' }}
              data-tourid="tour-register-company-button"
            >
              회사 등록하기
            </S.Button>
          </div>
        )}
        
        {/* 승인된 회사 목록 */}
        {companies.length > 0 && (
          <S.CompanySection>
            <S.CompanySectionTitle>승인된 회사</S.CompanySectionTitle>
            {companies.map((company) => (
              <S.CompanyCard key={company.companyId} isCurrent={company.companyId === authUser?.companyId}>
                <S.CompanyInfo>
                  <S.CompanyNameRow>
                    {company.companyId === authUser?.companyId && (
                      <S.CurrentBadge>현재</S.CurrentBadge>
                    )}
                    {company.companyName}
                    {company.isPrimary && <span style={{ color: '#007bff', fontSize: '12px', marginLeft: '4px' }}>(기본)</span>}
                  </S.CompanyNameRow>
                  <S.CompanyDetails>
                    역할: {getRoleLabel(company.role)} | 직급: {company.position || '-'}
                  </S.CompanyDetails>
                </S.CompanyInfo>
                <S.CompanyActions>
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
                      primary
                    >
                      전환
                    </S.Button>
                  )}
                  {company.companyId === authUser?.companyId && (
                    <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '13px', padding: '8px' }}>
                      현재 회사
                    </span>
                  )}
                  {!company.isPrimary && (
                    <S.Button 
                      onClick={() => handleSetPrimaryCompany(company.companyId)}
                    >
                      기본 설정
                    </S.Button>
                  )}
                  <S.Button 
                    onClick={() => handleRemoveCompany(company.companyId)}
                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                  >
                    <FaTrash /> 탈퇴
                  </S.Button>
                </S.CompanyActions>
              </S.CompanyCard>
            ))}
          </S.CompanySection>
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
          <S.SearchContainer data-tourid="tour-company-search">
            <S.Button 
              onClick={() => setIsCompanySearchModalOpen(true)} 
              primary
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              <FaSearch /> 회사 검색
            </S.Button>
          </S.SearchContainer>

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

      {/* 담당 결재자 설정 섹션 */}
      <S.ProfileCard>
        <S.CardTitle>담당 결재자 설정</S.CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
            담당 결재자를 설정하면 지출결의서 작성 시 자동으로 결재자가 선택됩니다.
          </p>
          <S.Button 
            primary 
            onClick={() => navigate('/my-approvers')}
            style={{ width: '100%', padding: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FaUserCheck />
            담당 결재자 관리
          </S.Button>
        </div>
      </S.ProfileCard>

      {/* 카드 관리 섹션 */}
      <S.ProfileCard>
        <S.CardTitle>카드 관리</S.CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
            개인 카드와 회사 카드를 등록하고 관리할 수 있습니다. 등록한 카드는 지출결의서 작성 시 빠르게 선택할 수 있습니다.
          </p>
          <S.Button 
            primary 
            onClick={() => navigate('/cards')}
            style={{ width: '100%', padding: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FaCreditCard />
            카드 관리
          </S.Button>
        </div>
      </S.ProfileCard>

      {/* 서명/도장 관리 섹션 */}
      <S.ProfileCard>
        <S.CardTitle>서명/도장 관리</S.CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <S.Button 
            primary 
            onClick={handleAddNewSignature}
            style={{ width: '100%', padding: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FaPen />
            새 서명/도장 추가
          </S.Button>
          
          {savedSignatures.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedSignatures.map(sig => (
                <div key={sig.signatureId} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  backgroundColor: sig.isDefault ? '#f0f7ff' : 'white'
                }}>
                  <div style={{ 
                    width: '100px', 
                    height: '60px', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '4px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                    overflow: 'hidden'
                  }}>
                    <img src={sig.signatureData} alt={sig.signatureName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{sig.signatureName}</strong>
                      {sig.isDefault && (
                        <span style={{ 
                          padding: '2px 8px', 
                          backgroundColor: '#28a745', 
                          color: 'white', 
                          borderRadius: '4px', 
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          기본
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        ({sig.signatureType === 'STAMP' ? '도장' : '서명'})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {!sig.isDefault && (
                        <button
                          onClick={() => handleSetDefaultSignature(sig.signatureId)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: '#007bff',
                            cursor: 'pointer'
                          }}
                        >
                          <FaStar style={{ marginRight: '4px' }} />
                          기본으로 설정
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSignature(sig.signatureId)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          border: '1px solid #dc3545',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          color: '#dc3545',
                          cursor: 'pointer'
                        }}
                      >
                        <FaTrash style={{ marginRight: '4px' }} />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              저장된 서명/도장이 없습니다.
            </div>
          )}
        </div>
      </S.ProfileCard>

      {/* 구독 관리 섹션 (CEO/ADMIN만) */}
      {isAdminOrCEO && (
        <S.ProfileCard data-tourid="tour-subscription-section">
          <S.CardTitle>구독 관리</S.CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <S.Button 
              primary 
              onClick={() => navigate('/subscriptions/manage')}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              data-tourid="tour-subscription-manage-button"
            >
              구독 관리
            </S.Button>
            <S.Button 
              onClick={() => navigate('/subscriptions/plans')}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              플랜 선택
            </S.Button>
            <S.Button 
              onClick={() => navigate('/subscriptions/payments')}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              결제 내역
            </S.Button>
          </div>
        </S.ProfileCard>
      )}

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

      {/* 타입 선택 모달 */}
      {isTypeSelectModalOpen && (
        <S.ModalOverlay onClick={() => setIsTypeSelectModalOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h3>서명/도장 타입 선택</h3>
              <button onClick={() => setIsTypeSelectModalOpen(false)}>×</button>
            </S.ModalHeader>
            <S.ModalBody>
              <S.TypeSelectButton onClick={() => handleSelectSignatureType('SIGNATURE')}>
                <FaPen style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--primary-color)' }} />
                <div>
                  <strong>서명</strong>
                  <p>터치스크린이나 마우스로 직접 서명합니다</p>
                </div>
              </S.TypeSelectButton>
              <S.TypeSelectButton onClick={() => handleSelectSignatureType('STAMP')}>
                <FaStamp style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--primary-color)' }} />
                <div>
                  <strong>도장</strong>
                  <p>이미지 파일을 업로드합니다</p>
                </div>
              </S.TypeSelectButton>
            </S.ModalBody>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* 이미지 업로드 (숨김) */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setEditingSignature(null);
          setSelectedSignatureType(null);
        }}
        onSave={handleSaveSignature}
        isSaving={isSavingSignature}
        savedSignatures={[]} // 새로 추가할 때는 저장된 서명 목록을 보여주지 않음
      />
    </S.Container>
  );
};

export default MyProfilePage;

