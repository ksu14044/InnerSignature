import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const RULE_BASE_URL = `${API_CONFIG.BASE_URL}/audit-rules`;
const LOG_BASE_URL = `${API_CONFIG.BASE_URL}/audit-logs`;

// 감사 규칙 생성
export const createAuditRule = async (rule) => {
  try {
    const response = await axiosInstance.post(`${RULE_BASE_URL}/create`, rule);
    return response.data;
  } catch (error) {
    console.error("감사 규칙 생성 실패:", error);
    throw error;
  }
};

// 감사 규칙 수정
export const updateAuditRule = async (ruleId, rule) => {
  try {
    const response = await axiosInstance.put(`${RULE_BASE_URL}/${ruleId}`, rule);
    return response.data;
  } catch (error) {
    console.error("감사 규칙 수정 실패:", error);
    throw error;
  }
};

// 감사 규칙 삭제
export const deleteAuditRule = async (ruleId) => {
  try {
    const response = await axiosInstance.delete(`${RULE_BASE_URL}/${ruleId}`);
    return response.data;
  } catch (error) {
    console.error("감사 규칙 삭제 실패:", error);
    throw error;
  }
};

// 감사 규칙 목록 조회
export const getAuditRuleList = async () => {
  try {
    const response = await axiosInstance.get(`${RULE_BASE_URL}/list`);
    return response.data;
  } catch (error) {
    console.error("감사 규칙 목록 조회 실패:", error);
    throw error;
  }
};

// 감사 로그 목록 조회
export const getAuditLogList = async (filters = {}, page = 1, size = 10) => {
  try {
    const params = {
      page,
      size,
      ...filters
    };
    
    const response = await axiosInstance.get(`${LOG_BASE_URL}/list`, { params });
    return response.data;
  } catch (error) {
    console.error("감사 로그 목록 조회 실패:", error);
    throw error;
  }
};

// 감사 로그 해결 처리
export const resolveAuditLog = async (auditLogId) => {
  try {
    const response = await axiosInstance.post(`${LOG_BASE_URL}/resolve/${auditLogId}`);
    return response.data;
  } catch (error) {
    console.error("감사 로그 해결 처리 실패:", error);
    throw error;
  }
};

