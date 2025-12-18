import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 아까 만든 훅
import { API_CONFIG } from '../../config/api';
import { checkUsername, checkEmail, getUserCompanies } from '../../api/userApi';
import CompanySearchModal from '../../components/CompanySearchModal/CompanySearchModal';
import CompanyRegistrationModal from '../../components/CompanyRegistrationModal/CompanyRegistrationModal';
import { FaUser, FaLock, FaSignInAlt, FaUserPlus, FaTimes, FaEnvelope, FaSearch, FaBuilding, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import * as S from './style';

const RegisterModal = ({ isOpen, onClose, onRegister, isRegistering }) => {
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    koreanName: '',
    email: '',
    position: '',
    role: 'USER',
    companyId: null
  });
  
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCompanySearchModalOpen, setIsCompanySearchModalOpen] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null, message: '' });

  useEffect(() => {
    // CEO인 경우 회사 검색 UI 숨김 (기존 ADMIN처럼)
    if (registerData.role === 'CEO') {
      setSelectedCompany(null);
      setRegisterData({ ...registerData, companyId: null });
    }
  }, [registerData.role]);

  // username 중복체크 버튼 핸들러
  const handleCheckUsername = async () => {
    if (!registerData.username || registerData.username.trim().length < 3) {
      alert('아이디는 3자 이상 입력해주세요.');
      return;
    }

    try {
      setUsernameStatus({ checking: true, available: null, message: '확인 중...' });
      const response = await checkUsername(registerData.username);
      if (response.success && response.data) {
        const { available, exists } = response.data;
        setUsernameStatus({
          checking: false,
          available: available,
          message: available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'
        });
      }
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: '확인 중 오류가 발생했습니다.'
      });
      alert('아이디 중복 확인 중 오류가 발생했습니다.');
    }
  };

  // email 중복체크 버튼 핸들러
  const handleCheckEmail = async () => {
    if (!registerData.email || registerData.email.trim().length === 0) {
      alert('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setEmailStatus({ checking: true, available: null, message: '확인 중...' });
      const response = await checkEmail(registerData.email);
      if (response.success && response.data) {
        const { available, exists } = response.data;
        setEmailStatus({
          checking: false,
          available: available,
          message: available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.'
        });
      }
    } catch (error) {
      setEmailStatus({
        checking: false,
        available: null,
        message: '확인 중 오류가 발생했습니다.'
      });
      alert('이메일 중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
    
    // role이 변경되면 선택된 회사 초기화 (CEO만)
    if (name === 'role' && value === 'CEO') {
      setSelectedCompany(null);
      setRegisterData(prev => ({ ...prev, companyId: null }));
    }

    // username 변경 시 상태 초기화
    if (name === 'username') {
      setUsernameStatus({ checking: false, available: null, message: '' });
    }

    // email 변경 시 상태 초기화
    if (name === 'email') {
      setEmailStatus({ checking: false, available: null, message: '' });
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setRegisterData({ ...registerData, companyId: company.companyId });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) return;
    
    // username 중복 체크 완료 여부 확인 (선택사항)
    if (registerData.username && usernameStatus.available === null && !usernameStatus.checking) {
      if (!confirm('아이디 중복 확인을 하지 않았습니다. 계속하시겠습니까?')) {
        return;
      }
    }
    
    // email이 입력된 경우 중복 체크 완료 여부 확인 (선택사항)
    if (registerData.email && registerData.email.trim().length > 0 && 
        emailStatus.available === null && !emailStatus.checking) {
      if (!confirm('이메일 중복 확인을 하지 않았습니다. 계속하시겠습니까?')) {
        return;
      }
    }
    
    // USER, TAX_ACCOUNTANT는 companyId 필수 (CEO는 불필요)
    if ((registerData.role === 'USER' || registerData.role === 'TAX_ACCOUNTANT') && !registerData.companyId) {
      alert('회사를 선택해주세요.');
      return;
    }
    
    onRegister(registerData);
  };

  if (!isOpen) return null;

  return (
    <>
      <S.ModalOverlay>
        <S.ModalContent>
        <S.ModalHeader>
          <S.ModalTitle>회원가입</S.ModalTitle>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <form onSubmit={handleSubmit}>
            <S.InputGroup>
              <S.InputIcon>
                <FaUser />
              </S.InputIcon>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '5px' }}>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <S.Input
                    type="text"
                    name="username"
                    placeholder="아이디 (3자 이상)"
                    value={registerData.username}
                    onChange={handleChange}
                    required
                    style={{
                      flex: 1,
                      borderColor: usernameStatus.available === false ? '#dc3545' : 
                                  usernameStatus.available === true ? '#28a745' : undefined
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckUsername}
                    disabled={!registerData.username || registerData.username.trim().length < 3 || usernameStatus.checking}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: (!registerData.username || registerData.username.trim().length < 3 || usernameStatus.checking) ? 0.6 : 1
                    }}
                  >
                    {usernameStatus.checking ? '확인 중...' : '중복 확인'}
                  </button>
                </div>
                {usernameStatus.message && !usernameStatus.checking && (
                  <div style={{
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: usernameStatus.available === true ? '#28a745' : 
                          usernameStatus.available === false ? '#dc3545' : '#666'
                  }}>
                    {usernameStatus.available === true ? (
                      <><FaCheckCircle /> {usernameStatus.message}</>
                    ) : usernameStatus.available === false ? (
                      <><FaTimesCircle /> {usernameStatus.message}</>
                    ) : null}
                  </div>
                )}
              </div>
            </S.InputGroup>

            <S.InputGroup>
              <S.InputIcon>
                <FaLock />
              </S.InputIcon>
              <S.Input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={registerData.password}
                onChange={handleChange}
                required
              />
            </S.InputGroup>

            <S.InputGroup>
              <S.InputIcon>
                <FaUser />
              </S.InputIcon>
              <S.Input
                type="text"
                name="koreanName"
                placeholder="이름"
                value={registerData.koreanName}
                onChange={handleChange}
                required
              />
            </S.InputGroup>

            <S.InputGroup>
              <S.InputIcon>
                <FaEnvelope />
              </S.InputIcon>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '5px' }}>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <S.Input
                    type="email"
                    name="email"
                    placeholder="이메일 (선택사항)"
                    value={registerData.email}
                    onChange={handleChange}
                    style={{
                      flex: 1,
                      borderColor: emailStatus.available === false ? '#dc3545' : 
                                  emailStatus.available === true ? '#28a745' : undefined
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckEmail}
                    disabled={!registerData.email || registerData.email.trim().length === 0 || emailStatus.checking}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: (!registerData.email || registerData.email.trim().length === 0 || emailStatus.checking) ? 0.6 : 1
                    }}
                  >
                    {emailStatus.checking ? '확인 중...' : '중복 확인'}
                  </button>
                </div>
                {emailStatus.message && !emailStatus.checking && (
                  <div style={{
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: emailStatus.available === true ? '#28a745' : 
                          emailStatus.available === false ? '#dc3545' : '#666'
                  }}>
                    {emailStatus.available === true ? (
                      <><FaCheckCircle /> {emailStatus.message}</>
                    ) : emailStatus.available === false ? (
                      <><FaTimesCircle /> {emailStatus.message}</>
                    ) : null}
                  </div>
                )}
              </div>
            </S.InputGroup>

            <S.InputGroup>
              <S.InputIcon>
                <FaUser />
              </S.InputIcon>
              <S.Input
                type="text"
                name="position"
                placeholder="직책"
                value={registerData.position}
                onChange={handleChange}
                required
              />
            </S.InputGroup>

            <S.InputGroup>
              <label>역할 *</label>
              <S.RadioGroup>
                <S.RadioLabel>
                  <input
                    type="radio"
                    name="role"
                    value="USER"
                    checked={registerData.role === 'USER'}
                    onChange={handleChange}
                  />
                  <span>직원</span>
                </S.RadioLabel>
                <S.RadioLabel>
                  <input
                    type="radio"
                    name="role"
                    value="CEO"
                    checked={registerData.role === 'CEO'}
                    onChange={handleChange}
                  />
                  <span>대표</span>
                </S.RadioLabel>
                <S.RadioLabel>
                  <input
                    type="radio"
                    name="role"
                    value="TAX_ACCOUNTANT"
                    checked={registerData.role === 'TAX_ACCOUNTANT'}
                    onChange={handleChange}
                  />
                  <span>세무사</span>
                </S.RadioLabel>
              </S.RadioGroup>
            </S.InputGroup>

            {/* 회사 검색 UI (USER, TAX_ACCOUNTANT일 때만 표시) */}
            {(registerData.role === 'USER' || registerData.role === 'TAX_ACCOUNTANT') && (
              <S.InputGroup>
                <label>회사 검색 *</label>
                <S.CompanySearchButton 
                  type="button" 
                  onClick={() => setIsCompanySearchModalOpen(true)}
                  hasValue={!!selectedCompany}
                >
                  <FaBuilding />
                  <span>
                    {selectedCompany ? selectedCompany.companyName : '회사 검색'}
                  </span>
                  <FaSearch />
                </S.CompanySearchButton>
                
                {selectedCompany && (
                  <S.SelectedCompany>
                    선택된 회사: <strong>{selectedCompany.companyName}</strong>
                  </S.SelectedCompany>
                )}
              </S.InputGroup>
            )}

            <S.ButtonGroup>
              <S.CancelButton type="button" onClick={onClose} disabled={isRegistering}>
                취소
              </S.CancelButton>
              <S.SubmitButton type="submit" disabled={isRegistering}>
                <FaUserPlus />
                <span>{isRegistering ? '처리 중...' : '가입하기'}</span>
              </S.SubmitButton>
            </S.ButtonGroup>
          </form>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>

    <CompanySearchModal
      isOpen={isCompanySearchModalOpen}
      onClose={() => setIsCompanySearchModalOpen(false)}
      onSelect={handleCompanySelect}
    />
    </>
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const { login, user } = useAuth(); // Context에서 로그인 함수와 사용자 정보 가져오기
  const navigate = useNavigate();

  const handleRegister = async (registerData) => {
    if (isRegistering) return;
    try {
      setIsRegistering(true);
      const res = await axios.post(API_CONFIG.REGISTER_URL, registerData);

      if (res.data.success) {
        alert("회원가입이 완료되었습니다. 로그인해주세요.");
        setIsRegisterModalOpen(false);
      } else {
        alert("회원가입 실패: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("회원가입 중 오류 발생");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    try {
      setIsLoggingIn(true);
      const res = await axios.post(API_CONFIG.LOGIN_URL, { username, password });
      
      if (res.data.success) {
        const { user, token, refreshToken } = res.data.data; // user, token, refreshToken 분리
        login(user, token, refreshToken); // 토큰과 리프레시 토큰도 함께 전달
        
        // CEO이고 회사가 하나도 없을 때 회사등록 모달 표시
        if (user.role === 'CEO') {
          try {
            // 회사 목록 조회하여 회사가 하나도 없는지 확인
            const companiesRes = await getUserCompanies();
            const hasNoCompanies = !companiesRes.success || !companiesRes.data || companiesRes.data.length === 0;
            
            if (hasNoCompanies) {
              // 약간의 지연을 두어 로그인 처리가 완료된 후 모달 표시
              setTimeout(() => {
                setIsCompanyModalOpen(true);
              }, 500);
            } else {
              alert(`${user.koreanName}님 환영합니다!`);
            }
          } catch (error) {
            // 회사 목록 조회 실패 시에도 모달 표시 (회사가 없을 가능성이 높음)
            console.error('회사 목록 조회 실패:', error);
            setTimeout(() => {
              setIsCompanyModalOpen(true);
            }, 500);
          }
        } else {
          alert(`${user.koreanName}님 환영합니다!`);
        }
        
        navigate('/expenses'); // 지출결의서 목록으로 이동
      } else {
        alert("로그인 실패: " + res.data.message);
      }
    } catch (err) {
      // console.error(err); // 프로덕션에서는 제거 또는 로깅 서비스로 전송
      alert("로그인 중 오류 발생");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCompanyRegistrationSuccess = () => {
    // 회사 등록 성공 후 페이지 새로고침하여 회사 목록 업데이트
    alert('회사가 등록되었습니다.');
    window.location.reload();
  };

  return (
    <S.Container>
      <S.LoginCard>
        <S.LogoSection>
          <S.Logo>InnerSignature</S.Logo>
          <S.Subtitle>지출결의서 시스템</S.Subtitle>
        </S.LogoSection>

        <S.Form onSubmit={handleSubmit}>
          <S.FormTitle>로그인</S.FormTitle>

          <S.InputGroup>
            <S.InputIcon>
              <FaUser />
            </S.InputIcon>
            <S.Input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </S.InputGroup>

          <S.InputGroup>
            <S.InputIcon>
              <FaLock />
            </S.InputIcon>
            <S.Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </S.InputGroup>

          <S.SubmitButtonBase type="submit" disabled={isLoggingIn}>
            <FaSignInAlt />
            <span>{isLoggingIn ? '로그인 중...' : '로그인'}</span>
          </S.SubmitButtonBase>

          <S.LinkContainer>
            <Link to="/find-id">아이디 찾기</Link>
            <span> | </span>
            <Link to="/find-password">비밀번호 찾기</Link>
          </S.LinkContainer>

          <S.RegisterButton type="button" onClick={() => setIsRegisterModalOpen(true)}>
            <FaUserPlus />
            <span>회원가입</span>
          </S.RegisterButton>
        </S.Form>
      </S.LoginCard>

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegister}
        isRegistering={isRegistering}
      />

      <CompanyRegistrationModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={handleCompanyRegistrationSuccess}
      />
    </S.Container>
  );
};

export default LoginPage;