import axios from 'axios';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/companies`;

// 쿠키에서 토큰 가져오기
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

// Axios 인터셉터로 JWT 토큰 자동 추가
axios.interceptors.request.use(
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

// 회사 생성 (ADMIN 전용)
export const createCompany = async (companyName) => {
  try {
    const response = await axios.post(BASE_URL, { companyName });
    return response.data;
  } catch (error) {
    console.error("회사 생성 실패:", error);
    throw error;
  }
};

// 사용자가 소속된 회사 목록 조회 (모든 사용자)
export const getMyCompanies = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("회사 목록 조회 실패:", error);
    throw error;
  }
};

// 회사 검색 (공개 API)
export const searchCompanies = async (companyName) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: { name: companyName }
    });
    return response.data;
  } catch (error) {
    console.error("회사 검색 실패:", error);
    throw error;
  }
};

// 회사 조회
export const getCompany = async (companyId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("회사 조회 실패:", error);
    throw error;
  }
};

// 회사 전환 (JWT 토큰 재발급)
export const switchCompany = async (companyId, currentToken) => {
  try {
    // JWT 토큰 재발급을 위해 /users/switch-company 엔드포인트 사용
    const response = await axios.post(`${API_CONFIG.BASE_URL}/users/switch-company`, {
      companyId,
      currentToken
    });
    return response.data;
  } catch (error) {
    console.error("회사 전환 실패:", error);
    throw error;
  }
};

