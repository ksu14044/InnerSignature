import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.USERS_BASE_URL;

// 내 서명/도장 목록 조회
export const getMySignatures = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/me/signatures`);
    return response.data;
  } catch (error) {
    console.error("서명/도장 목록 조회 실패:", error);
    throw error;
  }
};

// 서명/도장 생성
export const createSignature = async (signatureData) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/me/signatures`, signatureData);
    return response.data;
  } catch (error) {
    console.error("서명/도장 생성 실패:", error);
    throw error;
  }
};

// 서명/도장 수정
export const updateSignature = async (signatureId, signatureData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/me/signatures/${signatureId}`, signatureData);
    return response.data;
  } catch (error) {
    console.error("서명/도장 수정 실패:", error);
    throw error;
  }
};

// 서명/도장 삭제
export const deleteSignature = async (signatureId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/me/signatures/${signatureId}`);
    return response.data;
  } catch (error) {
    console.error("서명/도장 삭제 실패:", error);
    throw error;
  }
};

// 기본 서명/도장 설정
export const setDefaultSignature = async (signatureId) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/me/signatures/${signatureId}/set-default`);
    return response.data;
  } catch (error) {
    console.error("기본 서명/도장 설정 실패:", error);
    throw error;
  }
};

