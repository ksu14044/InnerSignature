import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/expense-categories`;

/**
 * 전역 항목 목록 조회 (SUPERADMIN)
 */
export const getGlobalCategories = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/global`);
    return response.data;
  } catch (error) {
    console.error("전역 항목 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 회사별 항목 목록 조회
 */
export const getCompanyCategories = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/company`);
    return response.data;
  } catch (error) {
    console.error("회사별 항목 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 병합된 항목 목록 조회 (전역 + 회사별)
 */
export const getMergedCategories = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/merged`);
    return response.data;
  } catch (error) {
    console.error("병합된 항목 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 항목 생성
 */
export const createExpenseCategory = async (category) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/create`, category);
    return response.data;
  } catch (error) {
    console.error("항목 생성 실패:", error);
    throw error;
  }
};

/**
 * 항목 수정
 */
export const updateExpenseCategory = async (categoryId, category) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${categoryId}`, category);
    return response.data;
  } catch (error) {
    console.error("항목 수정 실패:", error);
    throw error;
  }
};

/**
 * 항목 삭제
 */
export const deleteExpenseCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("항목 삭제 실패:", error);
    throw error;
  }
};

/**
 * 항목 순서 변경
 */
export const updateCategoryOrder = async (categoryId, displayOrder) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${categoryId}/order`, null, {
      params: { displayOrder }
    });
    return response.data;
  } catch (error) {
    console.error("항목 순서 변경 실패:", error);
    throw error;
  }
};

/**
 * 항목 순서 일괄 변경 (드래그 앤 드롭)
 */
export const reorderCategories = async (categoryIds) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/reorder`, categoryIds);
    return response.data;
  } catch (error) {
    console.error("항목 순서 일괄 변경 실패:", error);
    throw error;
  }
};

