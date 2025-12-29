import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/companies`;

// 회사 생성 (ADMIN 전용)
export const createCompany = async (companyName, businessRegNo, representativeName) => {
  try {
    const response = await axiosInstance.post(BASE_URL, { 
      companyName, 
      businessRegNo, 
      representativeName 
    });
    return response.data;
  } catch (error) {
    console.error("회사 생성 실패:", error);
    throw error;
  }
};

// 사업자등록번호 중복 확인
export const checkBusinessRegNoDuplicate = async (businessRegNo) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/check-business-reg-no`, {
      params: { businessRegNo }
    });
    return response.data;
  } catch (error) {
    console.error("사업자등록번호 중복 확인 실패:", error);
    throw error;
  }
};

// 사용자가 소속된 회사 목록 조회 (모든 사용자)
export const getMyCompanies = async () => {
  try {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("회사 목록 조회 실패:", error);
    throw error;
  }
};

// 회사 검색 (공개 API)
export const searchCompanies = async (companyName) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/search`, {
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
    const response = await axiosInstance.get(`${BASE_URL}/${companyId}`);
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
    const response = await axiosInstance.post(`${API_CONFIG.BASE_URL}/users/switch-company`, {
      companyId,
      currentToken
    });
    return response.data;
  } catch (error) {
    console.error("회사 전환 실패:", error);
    throw error;
  }
};

