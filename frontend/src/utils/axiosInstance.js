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

// 응답 인터셉터 - 에러 처리 통합 (선택사항)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러 처리 등을 여기서 할 수 있음
    // 필요시 로그아웃 처리 등 추가 가능
    return Promise.reject(error);
  }
);

export default axiosInstance;

