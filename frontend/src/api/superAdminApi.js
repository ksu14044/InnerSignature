import axios from 'axios';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/superadmin`;

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

// 전체 사용자 목록 조회
export const getAllUsersForSuperAdmin = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error("전체 사용자 목록 조회 실패:", error);
    throw error;
  }
};

// 전체 회사 목록 조회
export const getAllCompanies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/companies`);
    return response.data;
  } catch (error) {
    console.error("전체 회사 목록 조회 실패:", error);
    throw error;
  }
};

// 회사 상태 변경
export const updateCompanyStatus = async (companyId, isActive) => {
  try {
    const response = await axios.put(`${BASE_URL}/companies/${companyId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error("회사 상태 변경 실패:", error);
    throw error;
  }
};

// 전체 구독 목록 조회
export const getAllSubscriptions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/subscriptions`);
    return response.data;
  } catch (error) {
    console.error("전체 구독 목록 조회 실패:", error);
    throw error;
  }
};

// 전체 결제 내역 조회
export const getAllPayments = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/payments`);
    return response.data;
  } catch (error) {
    console.error("전체 결제 내역 조회 실패:", error);
    throw error;
  }
};

// 대시보드 요약 통계 조회
export const getDashboardSummary = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/summary`);
    return response.data;
  } catch (error) {
    console.error("대시보드 요약 통계 조회 실패:", error);
    throw error;
  }
};

// 사용자 가입 추이 조회
export const getUserSignupTrend = async (from, to) => {
  try {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await axios.get(`${BASE_URL}/reports/user-signups`, { params });
    return response.data;
  } catch (error) {
    console.error("사용자 가입 추이 조회 실패:", error);
    throw error;
  }
};

// 매출 추이 조회
export const getRevenueTrend = async (from, to) => {
  try {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await axios.get(`${BASE_URL}/reports/revenue`, { params });
    return response.data;
  } catch (error) {
    console.error("매출 추이 조회 실패:", error);
    throw error;
  }
};

// 회사별 지출결의서 목록 조회
export const getExpenseListForSuperAdmin = async (params) => {
  try {
    const response = await axios.get(`${BASE_URL}/expenses`, { params });
    return response.data;
  } catch (error) {
    console.error("지출결의서 목록 조회 실패:", error);
    throw error;
  }
};

