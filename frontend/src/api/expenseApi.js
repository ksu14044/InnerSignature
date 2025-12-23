import axios from 'axios';
import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.EXPENSES_BASE_URL;
const USER_BASE_URL = API_CONFIG.USERS_BASE_URL;

// 쿠키에서 값을 가져오는 유틸리티 함수
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
    const token = getCookie('token'); // 쿠키에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 0. ADMIN 역할 사용자 조회
export const fetchAdminUsers = async () => {
  try {
    const response = await axios.get(`${USER_BASE_URL}/admins`);
    return response.data;
  } catch (error) {
    console.error("ADMIN 사용자 조회 실패:", error);
    throw error;
  }
};

// 1. 목록 조회 함수 (페이지네이션 + 필터링)
export const fetchExpenseList = async (page = 1, size = 10, filters = {}) => {
  try {
    const params = {
      page,
      size
    };

    // 필터 파라미터 추가
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount !== '') {
      params.minAmount = filters.minAmount;
    }
    if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount !== '') {
      params.maxAmount = filters.maxAmount;
    }
    if (filters.status && filters.status.length > 0) {
      params.status = filters.status;
    }
    if (filters.category) {
      params.category = filters.category;
    }
    if (filters.taxProcessed !== null && filters.taxProcessed !== undefined) {
      params.taxProcessed = filters.taxProcessed;
    }
    if (filters.isSecret !== null && filters.isSecret !== undefined) {
      params.isSecret = filters.isSecret;
    }

    // 작성자(기안자) 이름 필터
    if (filters.drafterName && filters.drafterName.trim() !== '') {
      params.drafterName = filters.drafterName.trim();
    }

    const response = await axios.get(BASE_URL, { params });
    return response.data; // 백엔드가 준 { success, message, data } 반환
  } catch (error) {
    console.error("목록 조회 실패:", error);
    throw error;
  }
};

// 2. 상세 조회 함수 (나중에 쓸 것 미리 만듦)
export const fetchExpenseDetail = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("상세 조회 실패:", error);
    throw error;
  }
};

// 3. 결재 라인 설정
export const setApprovalLines = async (expenseId, approvalLines) => {
    try {
      // approvalLines = [{ approverId: 1, approverPosition: "팀장", approverName: "홍길동", status: "WAIT" }, ...]
      const response = await axios.post(`${BASE_URL}/${expenseId}/approval-lines`, { approvalLines });
      return response.data;
    } catch (error) {
      console.error("결재 라인 설정 실패:", error);
      throw error;
    }
  };

// 4. 결재 승인 (서명 저장)
export const approveExpense = async (expenseId, data) => {
    try {
      // data = { approverId: 2, signatureData: "..." }
      const response = await axios.post(`${BASE_URL}/${expenseId}/approve`, data);
      return response.data;
    } catch (error) {
      console.error("결재 실패:", error);
      throw error;
    }
  };

// 5. 결재 반려
export const rejectExpense = async (expenseId, data) => {
    try {
      // data = { approverId: 2, rejectionReason: "반려 사유" }
      const response = await axios.post(`${BASE_URL}/${expenseId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error("결재 반려 실패:", error);
      throw error;
    }
  };

// 6. 지출결의서 상태 변경 (ACCOUNTANT 전용)
export const updateExpenseStatus = async (expenseId, userId, status) => {
    try {
      const response = await axios.put(`${BASE_URL}/${expenseId}/status`, { userId, status });
      return response.data;
    } catch (error) {
      console.error("상태 변경 실패:", error);
      throw error;
    }
  };

// 7. 지출결의서 삭제
export const deleteExpense = async (expenseId, userId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${expenseId}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("지출결의서 삭제 실패:", error);
      throw error;
    }
  };

// 8. 미서명 건 조회 (알람)
export const fetchPendingApprovals = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/pending-approvals?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("미서명 건 조회 실패:", error);
      throw error;
    }
  };

// 9. 영수증 업로드
export const uploadReceipt = async (expenseId, userId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await axios.post(`${BASE_URL}/${expenseId}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("영수증 업로드 실패:", error);
      throw error;
    }
  };

// 10. 영수증 목록 조회
export const getReceipts = async (expenseId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${expenseId}/receipts`);
      return response.data;
    } catch (error) {
      console.error("영수증 목록 조회 실패:", error);
      throw error;
    }
  };

// 11. 영수증 삭제
export const deleteReceipt = async (receiptId, userId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/receipts/${receiptId}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("영수증 삭제 실패:", error);
      throw error;
    }
  };

// 12. 영수증 다운로드
export const downloadReceipt = async (receiptId, filename) => {
    try {
      const response = await axios.get(`${BASE_URL}/receipts/${receiptId}/download`, {
        responseType: 'blob', // 파일 다운로드를 위해 blob으로 받기
      });
      
      // Blob을 다운로드 링크로 변환
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'receipt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("영수증 다운로드 실패:", error);
      let message = "영수증 다운로드 중 오류가 발생했습니다.";
      const data = error?.response?.data;
      try {
        if (data instanceof Blob) {
          const text = await data.text();
          try {
            const parsed = JSON.parse(text);
            if (parsed?.message) message = parsed.message;
          } catch {
            if (text) message = text;
          }
        } else if (typeof data === 'string' && data) {
          message = data;
        } else if (data?.message) {
          message = data.message;
        }
      } catch (e) {
        // ignore parsing errors
      }
      const err = new Error(message);
      err.userMessage = message;
      throw err;
    }
  };

// 13. 카테고리별 요약 (세무사 전용)
export const fetchCategorySummary = async (filters = {}) => {
  try {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.status && filters.status.length > 0) {
      params.status = filters.status;
    }
    if (filters.taxProcessed !== null && filters.taxProcessed !== undefined) {
      params.taxProcessed = filters.taxProcessed;
    }
    if (filters.isSecret !== null && filters.isSecret !== undefined) {
      params.isSecret = filters.isSecret;
    }

    const response = await axios.get(`${BASE_URL}/summary/by-category`, { params });
    return response.data;
  } catch (error) {
    console.error("카테고리 요약 조회 실패:", error);
    throw error;
  }
};

// 14. 세무처리 완료 (TAX_ACCOUNTANT 전용)
export const completeTaxProcessing = async (expenseId) => {
  try {
    const response = await axios.put(`${BASE_URL}/${expenseId}/tax-processing/complete`);
    return response.data;
  } catch (error) {
    console.error("세무처리 완료 실패:", error);
    throw error;
  }
};

// 15. 대시보드 전체 요약 통계 조회 (ADMIN/ACCOUNTANT 전용)
export const fetchDashboardStats = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get(`${BASE_URL}/dashboard/stats`, { params });
    return response.data;
  } catch (error) {
    console.error("대시보드 통계 조회 실패:", error);
    throw error;
  }
};

// 16. 월별 지출 추이 조회 (ADMIN/ACCOUNTANT 전용)
export const fetchMonthlyTrend = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get(`${BASE_URL}/dashboard/monthly-trend`, { params });
    return response.data;
  } catch (error) {
    console.error("월별 추이 조회 실패:", error);
    throw error;
  }
};

// 17. 상태별 통계 조회 (ADMIN/ACCOUNTANT 전용)
export const fetchStatusStats = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get(`${BASE_URL}/dashboard/status-stats`, { params });
    return response.data;
  } catch (error) {
    console.error("상태별 통계 조회 실패:", error);
    throw error;
  }
};

// 18. 카테고리별 비율 조회 (ADMIN/ACCOUNTANT 전용)
export const fetchCategoryRatio = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get(`${BASE_URL}/dashboard/category-ratio`, { params });
    return response.data;
  } catch (error) {
    console.error("카테고리별 비율 조회 실패:", error);
    throw error;
  }
};

// 19. 세무처리 대기 건 목록 조회 (TAX_ACCOUNTANT 전용)
export const fetchTaxPendingReports = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get(`${BASE_URL}/tax/pending`, { params });
    return response.data;
  } catch (error) {
    console.error("세무처리 대기 건 조회 실패:", error);
    throw error;
  }
};

// 20. 세무처리 현황 통계 조회 (TAX_ACCOUNTANT 전용)
export const fetchTaxStatus = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get(`${BASE_URL}/tax/status`, { params });
    return response.data;
  } catch (error) {
    console.error("세무처리 현황 통계 조회 실패:", error);
    throw error;
  }
};

// 21. 월별 세무처리 집계 조회 (TAX_ACCOUNTANT 전용)
export const fetchMonthlyTaxSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get(`${BASE_URL}/tax/monthly-summary`, { params });
    return response.data;
  } catch (error) {
    console.error("월별 세무처리 집계 조회 실패:", error);
    throw error;
  }
};

// 22. 세무처리 일괄 완료 처리 (TAX_ACCOUNTANT 전용)
export const batchCompleteTaxProcessing = async (expenseReportIds) => {
  try {
    const response = await axios.post(`${BASE_URL}/tax/batch-complete`, {
      expenseReportIds
    });
    return response.data;
  } catch (error) {
    console.error("세무처리 일괄 완료 실패:", error);
    throw error;
  }
};

// 23. 지출 엑셀 다운로드 (ADMIN/ACCOUNTANT/CEO/TAX_ACCOUNTANT 전용)
export const downloadExpensesExcel = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axios.get(`${BASE_URL}/export/excel`, {
      params,
      responseType: 'blob', // 파일 다운로드를 위해 blob으로 받기
    });
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    const filename = `지출내역_${startDate || '전체'}_${endDate || '전체'}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("엑셀 다운로드 실패:", error);
    let message = "엑셀 다운로드 중 오류가 발생했습니다.";
    const data = error?.response?.data;
    try {
      if (data instanceof Blob) {
        const text = await data.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed?.message) message = parsed.message;
        } catch {
          if (text) message = text;
        }
      } else if (typeof data === 'string' && data) {
        message = data;
      } else if (data?.message) {
        message = data.message;
      }
    } catch (e) {
      // ignore parsing errors
    }
    const err = new Error(message);
    err.userMessage = message;
    throw err;
  }
};