import axios from 'axios';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.BASE_URL}/subscriptions`;

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

// 플랜 목록 조회
export const getPlans = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/plans`);
    return response.data;
  } catch (error) {
    console.error("플랜 목록 조회 실패:", error);
    throw error;
  }
};

// 현재 구독 정보 조회
export const getCurrentSubscription = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/current`);
    return response.data;
  } catch (error) {
    console.error("현재 구독 정보 조회 실패:", error);
    throw error;
  }
};

// 구독 생성
export const createSubscription = async (planId, autoRenew = true) => {
  try {
    const response = await axios.post(BASE_URL, {
      planId,
      autoRenew
    });
    return response.data;
  } catch (error) {
    console.error("구독 생성 실패:", error);
    throw error;
  }
};

// 구독 변경
export const updateSubscription = async (subscriptionId, planId, autoRenew) => {
  try {
    const response = await axios.put(`${BASE_URL}/${subscriptionId}`, {
      planId,
      autoRenew
    });
    return response.data;
  } catch (error) {
    console.error("구독 변경 실패:", error);
    throw error;
  }
};

// 구독 취소
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error("구독 취소 실패:", error);
    throw error;
  }
};

// 결제 내역 조회
export const getPayments = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/payments`);
    return response.data;
  } catch (error) {
    console.error("결제 내역 조회 실패:", error);
    throw error;
  }
};

