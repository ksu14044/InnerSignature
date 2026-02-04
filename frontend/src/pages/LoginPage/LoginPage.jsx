import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../config/api';
import CompanyRegistrationModal from '../../components/CompanyRegistrationModal/CompanyRegistrationModal';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import * as S from './style';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    // 입력값 검증
    let hasError = false;
    setUsernameError('');
    setPasswordError('');
    
    if (!username || username.trim() === '') {
      setUsernameError('아이디를 입력해 주세요.');
      hasError = true;
    }
    
    if (!password || password.trim() === '') {
      setPasswordError('비밀번호를 입력해주세요.');
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    try {
      setIsLoggingIn(true);
      const res = await axios.post(API_CONFIG.LOGIN_URL, { username, password });
      
      if (res.data.success) {
        const { user, token, refreshToken } = res.data.data; // user, token, refreshToken 분리
        login(user, token, refreshToken); // 토큰과 리프레시 토큰도 함께 전달

        // 로그인 성공 후에는 지출결의서 목록 페이지에서
        // CEO + 회사 없음 여부를 체크하고 회사 등록 모달을 띄웁니다.
        alert(`${user.koreanName}님 환영합니다!`);
        
        // 권한별로 다른 첫 페이지로 이동
        if (user.role === 'SUPERADMIN') {
          navigate('/superadmin/dashboard');
        } else {
          // 모든 사용자를 통합 대시보드로 이동 (권한별로 다른 내용 표시)
          navigate('/dashboard');
        }
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
          <S.LogoImage src="/Group 915.png" alt="innersign 로고" />
        </S.LogoSection>

        <S.Subtitle>전자지출결의서</S.Subtitle>

        <S.Form onSubmit={handleSubmit}>
          <S.InputGroup>
            <Input
              size="large"
              type="text"
              placeholder="아이디"
              value={username}
              error={usernameError}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError('');
              }}
            />
          </S.InputGroup>

          <S.InputGroup>
            <Input
              size="large"
              type="password"
              placeholder="비밀번호"
              value={password}
              error={passwordError}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
            />
          </S.InputGroup>

          <Button 
            size="large" 
            variant="primary" 
            fullWidth 
            type="submit" 
            disabled={isLoggingIn}
          >
            {isLoggingIn ? '로그인 중...' : '로그인'}
          </Button>
        </S.Form>

        <S.LinkContainer>
          <Link to="/find-id">아이디 찾기</Link>
          <S.LinkDivider> | </S.LinkDivider>
          <Link to="/find-password">비밀번호 찾기</Link>
          <S.LinkDivider> | </S.LinkDivider>
          <Link to="/register">회원가입</Link>
        </S.LinkContainer>
      </S.LoginCard>

      <CompanyRegistrationModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={handleCompanyRegistrationSuccess}
      />
    </S.Container>
  );
};

export default LoginPage;