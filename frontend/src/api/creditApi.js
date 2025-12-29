import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/credits`;

// 크레딧 내역 조회
export const getCredits = async () => {
  try {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("크레딧 내역 조회 실패:", error);
    throw error;
  }
};

// 사용 가능한 크레딧 조회
export const getAvailableCredits = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/available`);
    return response.data;
  } catch (error) {
    console.error("사용 가능한 크레딧 조회 실패:", error);
    throw error;
  }
};

// 총 사용 가능한 크레딧 금액 조회
export const getTotalAvailableAmount = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/total`);
    return response.data;
  } catch (error) {
    console.error("총 크레딧 금액 조회 실패:", error);
    throw error;
  }
};

