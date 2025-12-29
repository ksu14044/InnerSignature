import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.USERS_BASE_URL;

// 전체 사용자 목록 조회
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error("전체 사용자 목록 조회 실패:", error);
    throw error;
  }
};

// username 중복 체크
export const checkUsername = async (username) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/check-username`, {
      params: { username }
    });
    return response.data;
  } catch (error) {
    console.error("username 중복 체크 실패:", error);
    throw error;
  }
};

// email 중복 체크
export const checkEmail = async (email) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/check-email`, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error("email 중복 체크 실패:", error);
    throw error;
  }
};

// 사용자 생성
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}`, userData);
    return response.data;
  } catch (error) {
    console.error("사용자 생성 실패:", error);
    throw error;
  }
};

// 사용자 정보 수정
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("사용자 정보 수정 실패:", error);
    throw error;
  }
};

// 사용자 삭제
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("사용자 삭제 실패:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 정보 조회
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/me`);
    return response.data;
  } catch (error) {
    console.error("현재 사용자 정보 조회 실패:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 정보 수정
export const updateCurrentUser = async (userData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/me`, userData);
    return response.data;
  } catch (error) {
    console.error("현재 사용자 정보 수정 실패:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 비밀번호 변경
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/me/password`, passwordData);
    return response.data;
  } catch (error) {
    console.error("비밀번호 변경 실패:", error);
    throw error;
  }
};

// 사용자 role 변경 (CEO, ADMIN 전용)
export const updateUserRole = async (userId, role) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error("role 변경 실패:", error);
    throw error;
  }
};

// 회사별 사용자 목록 조회 (CEO, ADMIN 전용)
export const getCompanyUsers = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/company`);
    return response.data;
  } catch (error) {
    console.error("회사별 사용자 목록 조회 실패:", error);
    throw error;
  }
};

// 특정 회사별 사용자 목록 조회 (CEO, ADMIN 전용)
export const getCompanyUsersById = async (companyId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("회사별 사용자 목록 조회 실패:", error);
    throw error;
  }
};

// 승인 대기 사용자 목록 조회 (CEO, ADMIN 전용)
export const getPendingUsers = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/pending`);
    return response.data;
  } catch (error) {
    console.error("승인 대기 사용자 목록 조회 실패:", error);
    throw error;
  }
};

// 사용자 승인/거부 (CEO, ADMIN 전용)
export const approveUser = async (userId, action) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/${userId}/approval`, { action });
    return response.data;
  } catch (error) {
    console.error("사용자 승인/거부 실패:", error);
    throw error;
  }
};

// 사용자가 소속된 회사 목록 조회 (APPROVED만)
export const getUserCompanies = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/companies`);
    return response.data;
  } catch (error) {
    console.error("소속 회사 목록 조회 실패:", error);
    throw error;
  }
};

// 승인 대기 회사 목록 조회
export const getPendingCompanies = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/companies/pending`);
    return response.data;
  } catch (error) {
    console.error("승인 대기 회사 목록 조회 실패:", error);
    throw error;
  }
};

// 회사에 지원 요청
export const applyToCompany = async (companyId, role, position) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/companies/apply`, {
      companyId,
      role,
      position
    });
    return response.data;
  } catch (error) {
    console.error("회사 지원 요청 실패:", error);
    throw error;
  }
};

// 회사에서 탈퇴
export const removeUserFromCompany = async (companyId) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/companies/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("회사 탈퇴 실패:", error);
    throw error;
  }
};

// 기본 회사 설정
export const setPrimaryCompany = async (companyId) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/companies/${companyId}/primary`);
    return response.data;
  } catch (error) {
    console.error("기본 회사 설정 실패:", error);
    throw error;
  }
};

// 회사의 승인 대기 사용자 목록 조회 (ADMIN/CEO용)
export const getCompanyApplications = async (companyId) => {
  try {
    const response = await axiosInstance.get(`${API_CONFIG.BASE_URL}/companies/${companyId}/applications`);
    return response.data;
  } catch (error) {
    console.error("회사 승인 대기 사용자 목록 조회 실패:", error);
    throw error;
  }
};

// 회사 소속 승인 (ADMIN/CEO용)
export const approveUserCompany = async (userId, companyId) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${userId}/companies/${companyId}/approve`);
    return response.data;
  } catch (error) {
    console.error("회사 소속 승인 실패:", error);
    throw error;
  }
};

// 회사 소속 거부 (ADMIN/CEO용)
export const rejectUserCompany = async (userId, companyId) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${userId}/companies/${companyId}/reject`);
    return response.data;
  } catch (error) {
    console.error("회사 소속 거부 실패:", error);
    throw error;
  }
};

// 결재자 지정/해제 (CEO/ADMIN용)
export const updateApproverStatus = async (userId, companyId, isApprover) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/${userId}/company/${companyId}/approver?isApprover=${isApprover}`
    );
    return response.data;
  } catch (error) {
    console.error("결재자 지정 변경 실패:", error);
    throw error;
  }
};

