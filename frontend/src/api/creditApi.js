import axios from 'axios';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/credits`;

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

// 크레딧 내역 조회
export const getCredits = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("크레딧 내역 조회 실패:", error);
    throw error;
  }
};

// 사용 가능한 크레딧 조회
export const getAvailableCredits = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/available`);
    return response.data;
  } catch (error) {
    console.error("사용 가능한 크레딧 조회 실패:", error);
    throw error;
  }
};

// 총 사용 가능한 크레딧 금액 조회
export const getTotalAvailableAmount = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/total`);
    return response.data;
  } catch (error) {
    console.error("총 크레딧 금액 조회 실패:", error);
    throw error;
  }
};

