import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.USERS_BASE_URL;

/**
 * 사용자별 담당 결재자 목록 조회
 */
export const getUserApprovers = async (userId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${userId}/approvers`);
    return response.data;
  } catch (error) {
    console.error("담당 결재자 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 활성화된 담당 결재자 목록 조회
 */
export const getActiveApprovers = async (userId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${userId}/approvers/active`);
    return response.data;
  } catch (error) {
    console.error("활성화된 담당 결재자 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 담당 결재자 추가
 */
export const createUserApprover = async (userId, mapping) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/${userId}/approvers`, mapping);
    return response.data;
  } catch (error) {
    console.error("담당 결재자 추가 실패:", error);
    throw error;
  }
};

/**
 * 담당 결재자 수정
 */
export const updateUserApprover = async (userId, mappingId, mapping) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${userId}/approvers/${mappingId}`, mapping);
    return response.data;
  } catch (error) {
    console.error("담당 결재자 수정 실패:", error);
    throw error;
  }
};

/**
 * 담당 결재자 삭제
 */
export const deleteUserApprover = async (userId, mappingId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${userId}/approvers/${mappingId}`);
    return response.data;
  } catch (error) {
    console.error("담당 결재자 삭제 실패:", error);
    throw error;
  }
};

