import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 아까 만든 훅
import { API_CONFIG } from '../../config/api';
import { FaUser, FaLock, FaSignInAlt, FaUserPlus, FaTimes, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import * as S from './style';

const RegisterModal = ({ isOpen, onClose, onRegister, isRegistering }) => {
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    koreanName: '',
    email: '',
    position: ''
  });

  const handleChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) return;
    onRegister(registerData);
  };

  if (!isOpen) return null;

  return (
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
              <S.Input
                type="text"
                name="username"
                placeholder="아이디"
                value={registerData.username}
                onChange={handleChange}
                required
              />
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
              <S.Input
                type="email"
                name="email"
                placeholder="이메일 (선택)"
                value={registerData.email}
                onChange={handleChange}
              />
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
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth(); // Context에서 로그인 함수 가져오기
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
        alert(`${user.koreanName}님 환영합니다!`);
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

          <S.SubmitButton type="submit" disabled={isLoggingIn}>
            <FaSignInAlt />
            <span>{isLoggingIn ? '로그인 중...' : '로그인'}</span>
          </S.SubmitButton>

          <S.TestButton type="button" onClick={() => alert('테스트 버튼이 작동합니다!')}>
            🚀 테스트 버튼
          </S.TestButton>

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
    </S.Container>
  );
};

export default LoginPage;