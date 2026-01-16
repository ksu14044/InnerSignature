// 공통 Axios 인스턴스
// 모든 API 파일에서 이 인스턴스를 사용하여 중복 코드 제거
import axios from 'axios';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// 공통 axios 인스턴스 생성
const axiosInstance = axios.create();

// 요청 인터셉터 - JWT 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 통합
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러 (인증 실패) 처리
    if (error.response?.status === 401) {
      // 쿠키 삭제
      removeCookie('user');
      removeCookie('token');
      removeCookie('refreshToken');
      removeCookie('companies');
      
      // 로그인 페이지로 리다이렉트 (현재 경로가 로그인 페이지가 아닌 경우만)
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/find-') && !window.location.pathname.startsWith('/reset-password')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

