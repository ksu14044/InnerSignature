import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import { checkUsername, checkEmail } from '../../api/userApi';
import CompanySearchModal from '../../components/CompanySearchModal/CompanySearchModal';
import { FaUser, FaLock, FaEnvelope, FaBuilding, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import * as S from './style';

const RegisterPage = () => {
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    email: '',
    koreanName: '',
    company: '',
    position: '',
    role: ''
  });

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCompanySearchModalOpen, setIsCompanySearchModalOpen] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null, message: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    email: '',
    koreanName: '',
    company: '',
    position: '',
    role: ''
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false,
    passwordConfirm: false,
    email: false,
    koreanName: false,
    company: false,
    position: false,
    role: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    // CEO인 경우 회사 초기화
    if (registerData.role === 'CEO') {
      setSelectedCompany(null);
      setRegisterData(prev => ({ ...prev, company: '' }));
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
        const { available } = response.data;
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
        const { available } = response.data;
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

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'username':
        if (!value || value.trim().length === 0) {
          error = '아이디를 입력해 주세요';
        } else if (value.trim().length < 3) {
          error = '아이디는 3자 이상 입력해 주세요';
        }
        break;
      case 'password':
        if (!value || value.trim().length === 0) {
          error = '비밀번호를 입력해 주세요';
        }
        break;
      case 'passwordConfirm':
        if (!value || value.trim().length === 0) {
          error = '비밀번호를 다시 입력해 주세요';
        } else if (registerData.password && value !== registerData.password) {
          error = '비밀번호가 일치하지 않습니다.';
        }
        break;
      case 'email':
        if (!value || value.trim().length === 0) {
          error = '이메일을 입력해 주세요';
        }
        break;
      case 'koreanName':
        if (!value || value.trim().length === 0) {
          error = '이름을 입력해 주세요';
        }
        break;
      case 'company':
        if (registerData.role !== 'CEO' && (!value || value.trim().length === 0)) {
          error = '회사를 입력해 주세요';
        }
        break;
      case 'position':
        if (!value || value.trim().length === 0) {
          error = '직책을 입력해 주세요';
        }
        break;
      case 'role':
        if (!value || value.trim().length === 0) {
          error = '역할을 선택해 주세요';
        }
        break;
      default:
        break;
    }

    return error;
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
      setRegisterData(prev => ({ ...prev, company: '' }));
      setErrors(prev => ({ ...prev, company: '' }));
    }

    // username 변경 시 상태 초기화
    if (name === 'username') {
      setUsernameStatus({ checking: false, available: null, message: '' });
    }

    // email 변경 시 상태 초기화
    if (name === 'email') {
      setEmailStatus({ checking: false, available: null, message: '' });
    }

    // 필드 검증
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // 비밀번호 확인 필드는 비밀번호 변경 시에도 재검증
    if (name === 'password' && touched.passwordConfirm && registerData.passwordConfirm) {
      const confirmError = validateField('passwordConfirm', registerData.passwordConfirm);
      setErrors(prev => ({ ...prev, passwordConfirm: confirmError }));
    }
    
    // 비밀번호 확인 필드 변경 시 비밀번호와 일치 여부 검증
    if (name === 'passwordConfirm' && registerData.password) {
      const confirmError = validateField('passwordConfirm', value);
      setErrors(prev => ({ ...prev, passwordConfirm: confirmError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setRegisterData({ ...registerData, company: company.companyName });
    setErrors(prev => ({ ...prev, company: '' }));
    setTouched(prev => ({ ...prev, company: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) return;

    // 모든 필드를 touched로 표시하고 검증
    const newTouched = {
      username: true,
      password: true,
      passwordConfirm: true,
      email: true,
      koreanName: true,
      company: true,
      position: true,
      role: true
    };
    setTouched(newTouched);

    // 모든 필드 검증
    const newErrors = {
      username: validateField('username', registerData.username),
      password: validateField('password', registerData.password),
      passwordConfirm: validateField('passwordConfirm', registerData.passwordConfirm),
      email: validateField('email', registerData.email),
      koreanName: validateField('koreanName', registerData.koreanName),
      company: validateField('company', registerData.company),
      position: validateField('position', registerData.position),
      role: validateField('role', registerData.role)
    };
    setErrors(newErrors);

    // 에러가 있으면 제출 중단
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    // 비밀번호 일치 검증은 validateField에서 처리됨

    // username 중복 체크 완료 여부 확인
    if (usernameStatus.available !== true) {
      alert('아이디 중복 확인을 해주세요.');
      return;
    }

    // email 중복 체크 완료 여부 확인
    if (emailStatus.available !== true) {
      alert('이메일 중복 확인을 해주세요.');
      return;
    }

    // USER, TAX_ACCOUNTANT는 companyId 필수 (CEO는 불필요)
    if ((registerData.role === 'USER' || registerData.role === 'TAX_ACCOUNTANT') && !selectedCompany) {
      alert('회사를 선택해주세요.');
      return;
    }

    try {
      setIsRegistering(true);
      const submitData = {
        username: registerData.username,
        password: registerData.password,
        email: registerData.email,
        koreanName: registerData.koreanName,
        position: registerData.position,
        role: registerData.role,
        companyId: selectedCompany ? selectedCompany.companyId : null
      };

      const res = await axios.post(API_CONFIG.REGISTER_URL, submitData);

      if (res.data.success) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        navigate('/');
      } else {
        alert('회원가입 실패: ' + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('회원가입 중 오류 발생');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <S.Container>
      <S.Content>
        <S.Title>회원가입</S.Title>

        <S.Form onSubmit={handleSubmit}>
          <S.InputGroup>
            <S.Label>아이디</S.Label>
            <S.InputWithButton>
              <Input
                size="large"
                type="text"
                name="username"
                placeholder="아이디(3자 이상)"
                value={registerData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={errors.username || (usernameStatus.available === false ? usernameStatus.message : undefined)}
                style={{ flex: 1 }}
              />
              <Button
                size="small"
                variant="primary"
                type="button"
                onClick={handleCheckUsername}
                disabled={!registerData.username || registerData.username.trim().length < 3 || usernameStatus.checking}
                style={{ whiteSpace: 'nowrap', backgroundColor: '#E4E4E4', color: '#FFFFFF' }}
              >
                {usernameStatus.checking ? '확인 중...' : '중복확인'}
              </Button>
            </S.InputWithButton>
            {usernameStatus.message && !usernameStatus.checking && usernameStatus.available !== false && (
              <S.StatusMessage available={usernameStatus.available}>
                {usernameStatus.available === true ? (
                  <><FaCheckCircle /> {usernameStatus.message}</>
                ) : null}
              </S.StatusMessage>
            )}
          </S.InputGroup>

          

          <S.InputGroup>
            <S.Label>비밀번호</S.Label>
            <Input
              size="large"
              type="password"
              name="password"
              placeholder="비밀번호"
              value={registerData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.password}
            />
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>비밀번호 확인</S.Label>
            <Input
              size="large"
              type="password"
              name="passwordConfirm"
              placeholder="비밀번호 확인"
              value={registerData.passwordConfirm}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.passwordConfirm}
            />
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>이름</S.Label>
            <Input
              size="large"
              type="text"
              name="koreanName"
              placeholder="이름"
              value={registerData.koreanName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.koreanName}
            />
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>이메일</S.Label>
            <S.InputWithButton>
              <Input
                size="large"
                type="email"
                name="email"
                placeholder="이메일"
                value={registerData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={errors.email || (emailStatus.available === false ? emailStatus.message : undefined)}
                style={{ flex: 1 }}
              />
              <Button
                size="small"
                variant="primary"
                type="button"
                onClick={handleCheckEmail}
                disabled={!registerData.email || registerData.email.trim().length === 0 || emailStatus.checking}
                style={{ whiteSpace: 'nowrap', backgroundColor: '#E4E4E4', color: '#FFFFFF' }}
              >
                {emailStatus.checking ? '확인 중...' : '중복확인'}
              </Button>
            </S.InputWithButton>
            {emailStatus.message && !emailStatus.checking && emailStatus.available !== false && (
              <S.StatusMessage available={emailStatus.available}>
                {emailStatus.available === true ? (
                  <><FaCheckCircle /> {emailStatus.message}</>
                ) : null}
              </S.StatusMessage>
            )}
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>역할</S.Label>
            <S.SelectWrapper>
              <S.Select
                name="role"
                value={registerData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                hasError={!!errors.role}
                required
                style={{ cursor: 'pointer'}}
              >
                <option value="">선택하세요</option>
                <option value="USER" >직원</option>
                <option value="CEO" >대표</option>
                <option value="TAX_ACCOUNTANT" >세무사</option>
              </S.Select>
              {errors.role && <S.ErrorMessage>{errors.role}</S.ErrorMessage>}
            </S.SelectWrapper>
          </S.InputGroup>

          {registerData.role !== 'CEO' && (
            <S.InputGroup>
              <S.Label>회사</S.Label>
              {(registerData.role === 'USER' || registerData.role === 'TAX_ACCOUNTANT') ? (
                <S.InputWithButton>
                  <Input
                    size="large"
                    type="text"
                    name="company"
                    placeholder="회사"
                    value={registerData.company}
                    readOnly
                    onClick={() => setIsCompanySearchModalOpen(true)}
                    onBlur={handleBlur}
                    error={errors.company}
                    style={{ cursor: 'pointer' }}
                  />
                  <S.CompanySearchButton
                    type="button"
                    onClick={() => setIsCompanySearchModalOpen(true)}
                  >
                    <FaBuilding />
                  </S.CompanySearchButton>
                </S.InputWithButton>
              ) : (
                <Input
                  size="large"
                  type="text"
                  name="company"
                  placeholder="회사"
                  value={registerData.company}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required={registerData.role !== 'CEO'}
                  error={errors.company}
                />
              )}
            </S.InputGroup>
          )}

          <S.InputGroup>
            <S.Label>직책</S.Label>
            <Input
              size="large"
              type="text"
              name="position"
              placeholder="직책"
              value={registerData.position}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.position}
            />
          </S.InputGroup>

          
        </S.Form>
        <S.ButtonGroup>
            <Button
              size="large"
              variant="secondary"
              type="button"
              onClick={() => navigate('/')}
              disabled={isRegistering}
              style={{ flex: 1, backgroundColor: '#ffffff', color: '#333333', border: '1px solid #E4E4E4' }}
            >
              취소
            </Button>
            <Button
              size="large"
              variant="primary"
              type="submit"
              disabled={isRegistering}
              style={{ flex: 1 }}
            >
              {isRegistering ? '처리 중...' : '가입하기'}
            </Button>
          </S.ButtonGroup>

        <S.LinkContainer>
          이미 계정이 있으신가요? <Link to="/">로그인</Link>
        </S.LinkContainer>
      </S.Content>

      <CompanySearchModal
        isOpen={isCompanySearchModalOpen}
        onClose={() => setIsCompanySearchModalOpen(false)}
        onSelect={handleCompanySelect}
      />
    </S.Container>
  );
};

export default RegisterPage;
