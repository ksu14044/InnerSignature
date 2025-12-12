// API 설정 파일
// 도커 환경에서는 /api로 요청하면 nginx가 백엔드로 프록시합니다

const getApiBaseUrl = () => {
  // 브라우저에서 실행될 때는 상대 경로 사용 (nginx가 프록시)
  // 개발 환경에서는 환경 변수나 기본값 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 도커 환경에서는 /api (nginx가 backend:8080으로 프록시)
  // 로컬 개발 환경에서는 http://localhost:8080/api
  return import.meta.env.MODE === 'production' 
    ? '/api' 
    : 'http://localhost:8080/api';
};

const baseUrl = getApiBaseUrl();

const config = {
  // 개발 환경
  development: {
    BASE_URL: `${baseUrl}`,
    EXPENSES_BASE_URL: `${baseUrl}/expenses`,
    USERS_BASE_URL: `${baseUrl}/users`,
    LOGIN_URL: `${baseUrl}/login`,
    REGISTER_URL: `${baseUrl}/register`,
    FIND_USERNAME_URL: `${baseUrl}/find-username`,
    REQUEST_PASSWORD_RESET_URL: `${baseUrl}/request-password-reset`,
    RESET_PASSWORD_URL: `${baseUrl}/reset-password`,
  },
  // 프로덕션 환경 (도커 환경 포함)
  production: {
    BASE_URL: `${baseUrl}`,
    EXPENSES_BASE_URL: `${baseUrl}/expenses`,
    USERS_BASE_URL: `${baseUrl}/users`,
    LOGIN_URL: `${baseUrl}/login`,
    REGISTER_URL: `${baseUrl}/register`,
    FIND_USERNAME_URL: `${baseUrl}/find-username`,
    REQUEST_PASSWORD_RESET_URL: `${baseUrl}/request-password-reset`,
    RESET_PASSWORD_URL: `${baseUrl}/reset-password`,
  }
};

// 현재 환경에 따른 설정 반환
const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development';
  return config[env] || config.development;
};

export const API_CONFIG = getCurrentConfig();
