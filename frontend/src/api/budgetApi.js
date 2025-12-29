import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/budget`;

// 예산 생성
export const createBudget = async (budget) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/create`, budget);
    return response.data;
  } catch (error) {
    console.error("예산 생성 실패:", error);
    throw error;
  }
};

// 예산 수정
export const updateBudget = async (budgetId, budget) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${budgetId}`, budget);
    return response.data;
  } catch (error) {
    console.error("예산 수정 실패:", error);
    throw error;
  }
};

// 예산 삭제
export const deleteBudget = async (budgetId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${budgetId}`);
    return response.data;
  } catch (error) {
    console.error("예산 삭제 실패:", error);
    throw error;
  }
};

// 예산 목록 조회
export const getBudgetList = async (year = null, month = null) => {
  try {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    
    const response = await axiosInstance.get(`${BASE_URL}/list`, { params });
    return response.data;
  } catch (error) {
    console.error("예산 목록 조회 실패:", error);
    throw error;
  }
};

