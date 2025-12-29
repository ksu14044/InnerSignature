import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/monthly-closing`;

// 월 마감 처리
export const closeMonth = async (year, month) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/close`, {
      year,
      month
    });
    return response.data;
  } catch (error) {
    console.error("월 마감 처리 실패:", error);
    throw error;
  }
};

// 월 마감 해제
export const reopenMonth = async (closingId) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/reopen/${closingId}`);
    return response.data;
  } catch (error) {
    console.error("월 마감 해제 실패:", error);
    throw error;
  }
};

// 마감 목록 조회
export const getClosingList = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/list`);
    return response.data;
  } catch (error) {
    console.error("마감 목록 조회 실패:", error);
    throw error;
  }
};

// 월 마감 여부 확인
export const checkMonthClosed = async (year, month) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/check`, {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    console.error("월 마감 여부 확인 실패:", error);
    throw error;
  }
};

