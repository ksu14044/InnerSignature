import axios from 'axios';
import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.USERS_BASE_URL;

// 쿠키에서 토큰 가져오기
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

// Axios 인터셉터로 JWT 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 전체 사용자 목록 조회
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error("전체 사용자 목록 조회 실패:", error);
    throw error;
  }
};

// 사용자 생성
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}`, userData);
    return response.data;
  } catch (error) {
    console.error("사용자 생성 실패:", error);
    throw error;
  }
};

// 사용자 정보 수정
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("사용자 정보 수정 실패:", error);
    throw error;
  }
};

// 사용자 삭제
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("사용자 삭제 실패:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 정보 조회
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/me`);
    return response.data;
  } catch (error) {
    console.error("현재 사용자 정보 조회 실패:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 정보 수정
export const updateCurrentUser = async (userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/me`, userData);
    return response.data;
  } catch (error) {
    console.error("현재 사용자 정보 수정 실패:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 비밀번호 변경
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put(`${BASE_URL}/me/password`, passwordData);
    return response.data;
  } catch (error) {
    console.error("비밀번호 변경 실패:", error);
    throw error;
  }
};

