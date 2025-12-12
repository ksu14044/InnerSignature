import { createContext, useContext } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 'user', 'token', 'refreshToken' 쿠키를 관리합니다.
  const [cookies, setCookie, removeCookie] = useCookies(['user', 'token', 'refreshToken']);

  // 쿠키에 저장된 user 정보를 가져옵니다. (없으면 undefined)
  const user = cookies.user;

  // 로그인 함수
  const login = (userData, token, refreshToken) => {
    // 쿠키에 저장 (path: '/'는 모든 페이지에서 접근 가능하게 함)
    // maxAge: 3600초 (1시간 뒤 자동 만료/로그아웃) -> 원하는 시간으로 조절 가능
    setCookie('user', userData, { path: '/', maxAge: 3600 });
    setCookie('token', token, { path: '/', maxAge: 3600 }); // JWT 토큰 저장
    if (refreshToken) {
      setCookie('refreshToken', refreshToken, { path: '/', maxAge: 1209600 }); // 리프레시 토큰 (14일)
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);