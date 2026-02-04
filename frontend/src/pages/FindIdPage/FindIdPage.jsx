import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import * as S from './style';

const FindIdPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    koreanName: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(API_CONFIG.FIND_USERNAME_URL, formData);

      if (res.data.success) {
        setResult({
          success: true,
          username: res.data.data?.username || '',
          message: res.data.message || '아이디를 찾았습니다.'
        });
      } else {
        setResult({
          success: false,
          message: res.data.message || '아이디 찾기에 실패했습니다.'
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || '아이디 찾기 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.Container>
      <S.Content>
        <S.Title>아이디 찾기</S.Title>
        <S.Description>가입 시 등록한 이메일과 이름을 입력하세요</S.Description>

        {!result ? (
          <S.Form onSubmit={handleSubmit}>
            <S.InputGroup>
              <Input
                size="large"
                type="email"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </S.InputGroup>

            <S.InputGroup>
              <Input
                size="large"
                type="text"
                name="koreanName"
                placeholder="이름"
                value={formData.koreanName}
                onChange={handleChange}
                required
              />
            </S.InputGroup>

            <Button 
              size="large" 
              variant="primary" 
              fullWidth 
              type="submit" 
              disabled={loading}
            >
              {loading ? '처리 중...' : '아이디 찾기'}
            </Button>

            <S.LinkContainer>
              <Link to="/">로그인</Link>
              <S.LinkDivider> | </S.LinkDivider>
              <Link to="/find-password">비밀번호 찾기</Link>
              <S.LinkDivider> | </S.LinkDivider>
              <Link to="/register">회원가입</Link>
            </S.LinkContainer>
          </S.Form>
        ) : (
          <S.ResultContainer>
            <S.ResultMessage success={result.success}>
              {result.success && result.username ? (
                <>
                  <S.UsernameLabel>찾은 아이디</S.UsernameLabel>
                  <S.UsernameValue>{result.username}</S.UsernameValue>
                </>
              ) : (
                result.message
              )}
            </S.ResultMessage>
            <S.ButtonGroup>
              <Button 
                size="large" 
                variant="primary" 
                onClick={() => navigate('/')}
              >
                로그인하기
              </Button>
              <Button 
                size="large" 
                variant="primary" 
                onClick={() => setResult(null)}
              >
                다시 찾기
              </Button>
            </S.ButtonGroup>
          </S.ResultContainer>
        )}
      </S.Content>
    </S.Container>
  );
};

export default FindIdPage;

