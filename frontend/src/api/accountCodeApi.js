import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/account-codes`;

// 계정 과목 매핑 생성
export const createAccountCodeMapping = async (mapping) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/create`, mapping);
    return response.data;
  } catch (error) {
    console.error("계정 과목 매핑 생성 실패:", error);
    throw error;
  }
};

// 계정 과목 매핑 수정
export const updateAccountCodeMapping = async (mappingId, mapping) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${mappingId}`, mapping);
    return response.data;
  } catch (error) {
    console.error("계정 과목 매핑 수정 실패:", error);
    throw error;
  }
};

// 계정 과목 매핑 삭제
export const deleteAccountCodeMapping = async (mappingId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${mappingId}`);
    return response.data;
  } catch (error) {
    console.error("계정 과목 매핑 삭제 실패:", error);
    throw error;
  }
};

// 계정 과목 매핑 목록 조회
export const getAccountCodeMappingList = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/list`);
    return response.data;
  } catch (error) {
    console.error("계정 과목 매핑 목록 조회 실패:", error);
    throw error;
  }
};

// 계정 과목 추천
export const recommendAccountCode = async (category, merchantName = null) => {
  try {
    const params = { category };
    if (merchantName) params.merchantName = merchantName;
    
    const response = await axiosInstance.get(`${BASE_URL}/recommend`, { params });
    return response.data;
  } catch (error) {
    console.error("계정 과목 추천 실패:", error);
    throw error;
  }
};

