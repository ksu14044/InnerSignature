import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import * as S from './style';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setResult({
        success: false,
        message: '유효하지 않은 링크입니다.'
      });
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setResult({
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
      });
      return;
    }

    if (formData.newPassword.length < 1) {
      setResult({
        success: false,
        message: '비밀번호를 입력해주세요.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(API_CONFIG.RESET_PASSWORD_URL, {
        token,
        newPassword: formData.newPassword
      });

      if (res.data.success) {
        setResult({
          success: true,
          message: res.data.message || '비밀번호가 재설정되었습니다.'
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setResult({
          success: false,
          message: res.data.message || '비밀번호 재설정에 실패했습니다.'
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || '비밀번호 재설정 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.Container>
      <S.Card>
        <S.Header>
          <S.BackButton onClick={() => navigate('/')}>
            <FaArrowLeft />
          </S.BackButton>
          <S.Title>비밀번호 재설정</S.Title>
        </S.Header>

        {!result ? (
          <S.Form onSubmit={handleSubmit}>
            <S.Description>
              새로운 비밀번호를 입력해주세요.
            </S.Description>

            <S.InputGroup>
              <S.InputIcon>
                <FaLock />
              </S.InputIcon>
              <S.Input
                type="password"
                name="newPassword"
                placeholder="새 비밀번호"
                value={formData.newPassword}
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
                name="confirmPassword"
                placeholder="새 비밀번호 확인"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </S.InputGroup>

            <S.SubmitButton type="submit" disabled={loading || !token}>
              {loading ? '처리 중...' : '비밀번호 재설정'}
            </S.SubmitButton>

            <S.LinkContainer>
              <Link to="/">로그인</Link>
            </S.LinkContainer>
          </S.Form>
        ) : (
          <S.ResultContainer>
            <S.ResultMessage success={result.success}>
              {result.message}
            </S.ResultMessage>
            {result.success ? (
              <S.InfoText>잠시 후 로그인 페이지로 이동합니다...</S.InfoText>
            ) : (
              <S.ButtonGroup>
                <S.Button onClick={() => navigate('/')}>
                  로그인하기
                </S.Button>
                <S.Button onClick={() => setResult(null)}>
                  다시 시도
                </S.Button>
              </S.ButtonGroup>
            )}
          </S.ResultContainer>
        )}
      </S.Card>
    </S.Container>
  );
};

export default ResetPasswordPage;

