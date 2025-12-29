import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/missing-receipts`;

// 증빙 누락 건 조회
export const getMissingReceipts = async (days = 3) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/list`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error("증빙 누락 건 조회 실패:", error);
    throw error;
  }
};

// 사용자별 증빙 누락 건 조회
export const getMissingReceiptsByUser = async (days = 3) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/by-user`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error("사용자별 증빙 누락 건 조회 실패:", error);
    throw error;
  }
};

