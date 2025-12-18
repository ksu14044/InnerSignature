import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { getMyCompanies, switchCompany } from '../api/companyApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 'user', 'token', 'refreshToken', 'companies' 쿠키를 관리합니다.
  const [cookies, setCookie, removeCookie] = useCookies(['user', 'token', 'refreshToken', 'companies']);
  const [companies, setCompanies] = useState(cookies.companies || []);

  // 쿠키에 저장된 user 정보를 가져옵니다. (없으면 undefined)
  const user = cookies.user;
  const loadingCompaniesRef = useRef(false); // 중복 요청 방지용

  // 회사 목록 로드를 useCallback으로 감싸서 무한 루프 방지
  const loadCompanies = useCallback(async () => {
    if (loadingCompaniesRef.current) return; // 이미 로딩 중이면 중복 요청 방지
    
    if (user && cookies.token) {
      try {
        loadingCompaniesRef.current = true;
        const response = await getMyCompanies();
        if (response.success && response.data) {
          setCompanies(response.data);
          setCookie('companies', response.data, { path: '/', maxAge: 3600 });
        }
      } catch (error) {
        console.error('회사 목록 로드 실패:', error);
        setCompanies([]);
      } finally {
        loadingCompaniesRef.current = false;
      }
    } else {
      setCompanies([]);
    }
  }, [user?.userId, cookies.token, setCookie]); // user?.userId와 token만 체크

  // 모든 사용자가 회사 목록 로드
  useEffect(() => {
    if (user) {
      loadCompanies();
    } else {
      setCompanies([]);
    }
  }, [user?.userId, cookies.token, loadCompanies]); // user?.userId와 token만 체크

  // 로그인 함수
  const login = (userData, token, refreshToken) => {
    // 쿠키에 저장 (path: '/'는 모든 페이지에서 접근 가능하게 함)
    // maxAge: 3600초 (1시간 뒤 자동 만료/로그아웃) -> 원하는 시간으로 조절 가능
    setCookie('user', userData, { path: '/', maxAge: 3600 });
    setCookie('token', token, { path: '/', maxAge: 3600 }); // JWT 토큰 저장
    if (refreshToken) {
      setCookie('refreshToken', refreshToken, { path: '/', maxAge: 1209600 }); // 리프레시 토큰 (14일)
    }
    
    // 회사 목록은 별도로 로드됨 (useEffect에서 처리)
  };
  
  // 회사 전환 함수
  const switchCompanyContext = async (companyId) => {
    try {
      const currentToken = cookies.token;
      if (!currentToken) {
        throw new Error('토큰이 없습니다.');
      }
      
      const response = await switchCompany(companyId, currentToken);
      if (response.success && response.data) {
        const { user: updatedUser, token: newToken, refreshToken: newRefreshToken } = response.data;
        
        // 쿠키 업데이트
        setCookie('user', updatedUser, { path: '/', maxAge: 3600 });
        setCookie('token', newToken, { path: '/', maxAge: 3600 });
        if (newRefreshToken) {
          setCookie('refreshToken', newRefreshToken, { path: '/', maxAge: 1209600 });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('회사 전환 실패:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      // 백엔드 로그아웃 API 호출 (토큰 블랙리스트 처리)
      const token = cookies.token;
      const refreshToken = cookies.refreshToken;
      
      if (token) {
        try {
          await axios.post(`${API_CONFIG.BASE_URL}/logout`, 
            refreshToken ? { refreshToken } : null,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        } catch (error) {
          // 로그아웃 API 실패해도 쿠키는 삭제 (토큰이 만료되었을 수 있음)
          console.error('로그아웃 API 호출 실패:', error);
        }
      }
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
    } finally {
      // 쿠키 삭제
      removeCookie('user', { path: '/' });
      removeCookie('token', { path: '/' });
      removeCookie('refreshToken', { path: '/' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, companies, switchCompany: switchCompanyContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);