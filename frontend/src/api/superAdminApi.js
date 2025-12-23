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

// 지출결의서 상세 조회 (SUPERADMIN 전용)
export const getExpenseDetailForSuperAdmin = async (expenseReportId) => {
  try {
    const response = await axios.get(`${BASE_URL}/expenses/${expenseReportId}`);
    return response.data;
  } catch (error) {
    console.error("지출결의서 상세 조회 실패:", error);
    throw error;
  }
};

// 엑셀 다운로드 (SUPERADMIN 전용)
export const downloadExpensesExcelForSuperAdmin = async (startDate = null, endDate = null, companyId = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (companyId) params.companyId = companyId;
    
    const response = await axios.get(`${BASE_URL}/expenses/export/excel`, {
      params,
      responseType: 'blob',
    });
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    const filename = `지출내역_SUPERADMIN_${startDate || '전체'}_${endDate || '전체'}${companyId ? '_' + companyId : ''}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("엑셀 다운로드 실패:", error);
    let message = "엑셀 다운로드 중 오류가 발생했습니다.";
    const data = error?.response?.data;
    try {
      if (data instanceof Blob) {
        const text = await data.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed?.message) message = parsed.message;
        } catch {
          if (text) message = text;
        }
      } else if (typeof data === 'string' && data) {
        message = data;
      } else if (data?.message) {
        message = data.message;
      }
    } catch (e) {
      // ignore parsing errors
    }
    const err = new Error(message);
    err.userMessage = message;
    throw err;
  }
};

