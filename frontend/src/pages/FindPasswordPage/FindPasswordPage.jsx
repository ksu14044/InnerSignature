import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import * as S from './style';

const FindPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(API_CONFIG.REQUEST_PASSWORD_RESET_URL, { email });

      if (res.data.success) {
        setResult({
          success: true,
          message: res.data.message || '등록된 이메일로 비밀번호 재설정 링크를 발송했습니다.'
        });
      } else {
        setResult({
          success: false,
          message: res.data.message || '비밀번호 재설정 요청에 실패했습니다.'
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.'
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
          <S.Title>비밀번호 찾기</S.Title>
        </S.Header>

        {!result ? (
          <S.Form onSubmit={handleSubmit}>
            <S.Description>
              가입 시 등록한 이메일을 입력해주세요.
              <br />
              비밀번호 재설정 링크를 이메일로 발송해드립니다.
            </S.Description>

            <S.InputGroup>
              <S.InputIcon>
                <FaEnvelope />
              </S.InputIcon>
              <S.Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </S.InputGroup>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? '처리 중...' : '비밀번호 재설정 링크 발송'}
            </S.SubmitButton>

            <S.LinkContainer>
              <Link to="/">로그인</Link>
              <span> | </span>
              <Link to="/find-id">아이디 찾기</Link>
            </S.LinkContainer>
          </S.Form>
        ) : (
          <S.ResultContainer>
            <S.ResultMessage success={result.success}>
              {result.message}
            </S.ResultMessage>
            <S.ButtonGroup>
              <S.Button onClick={() => navigate('/')}>
                로그인하기
              </S.Button>
              {!result.success && (
                <S.Button onClick={() => setResult(null)}>
                  다시 시도
                </S.Button>
              )}
            </S.ButtonGroup>
          </S.ResultContainer>
        )}
      </S.Card>
    </S.Container>
  );
};

export default FindPasswordPage;

