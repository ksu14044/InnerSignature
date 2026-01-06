import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/cards`;

// ========== 회사 카드 API ==========

/**
 * 회사 카드 생성
 */
export const createCompanyCard = async (cardData) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/company`, cardData);
    return response.data;
  } catch (error) {
    console.error('회사 카드 생성 실패:', error);
    throw error;
  }
};

/**
 * 회사 카드 목록 조회 (활성 카드만)
 */
export const getCompanyCards = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/company`);
    return response.data;
  } catch (error) {
    console.error('회사 카드 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 회사 카드 목록 조회 (전체)
 */
export const getAllCompanyCards = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/company/all`);
    return response.data;
  } catch (error) {
    console.error('회사 카드 전체 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 회사 카드 조회
 */
export const getCompanyCard = async (cardId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/company/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('회사 카드 조회 실패:', error);
    throw error;
  }
};

/**
 * 회사 카드 수정
 */
export const updateCompanyCard = async (cardId, cardData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/company/${cardId}`, cardData);
    return response.data;
  } catch (error) {
    console.error('회사 카드 수정 실패:', error);
    throw error;
  }
};

/**
 * 회사 카드 삭제
 */
export const deleteCompanyCard = async (cardId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/company/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('회사 카드 삭제 실패:', error);
    throw error;
  }
};

// ========== 개인 카드 API ==========

/**
 * 개인 카드 생성
 */
export const createUserCard = async (cardData) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/user`, cardData);
    return response.data;
  } catch (error) {
    console.error('개인 카드 생성 실패:', error);
    throw error;
  }
};

/**
 * 개인 카드 목록 조회 (활성 카드만)
 */
export const getUserCards = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/user`);
    return response.data;
  } catch (error) {
    console.error('개인 카드 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 개인 카드 목록 조회 (전체)
 */
export const getAllUserCards = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/user/all`);
    return response.data;
  } catch (error) {
    console.error('개인 카드 전체 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 개인 카드 조회
 */
export const getUserCard = async (cardId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/user/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('개인 카드 조회 실패:', error);
    throw error;
  }
};

/**
 * 개인 카드 수정
 */
export const updateUserCard = async (cardId, cardData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/user/${cardId}`, cardData);
    return response.data;
  } catch (error) {
    console.error('개인 카드 수정 실패:', error);
    throw error;
  }
};

/**
 * 개인 카드 삭제
 */
export const deleteUserCard = async (cardId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/user/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('개인 카드 삭제 실패:', error);
    throw error;
  }
};

