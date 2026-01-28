import axiosInstance from '../utils/axiosInstance';
import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.EXPENSES_BASE_URL;
const USER_BASE_URL = API_CONFIG.USERS_BASE_URL;

// 0. ADMIN 역할 사용자 조회 (Deprecated)
export const fetchAdminUsers = async () => {
  try {
    const response = await axiosInstance.get(`${USER_BASE_URL}/admins`);
    return response.data;
  } catch (error) {
    console.error("ADMIN 사용자 조회 실패:", error);
    throw error;
  }
};

// 0-1. 결재자 목록 조회 (결재자로 지정된 사용자만)
export const fetchApprovers = async () => {
  try {
    const response = await axiosInstance.get(`${USER_BASE_URL}/approvers`);
    return response.data;
  } catch (error) {
    console.error("결재자 조회 실패:", error);
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

    // 작성자(기안자) 이름 필터
    if (filters.drafterName && filters.drafterName.trim() !== '') {
      params.drafterName = filters.drafterName.trim();
    }

    // 결제수단 필터
    if (filters.paymentMethod && filters.paymentMethod.trim() !== '') {
      params.paymentMethod = filters.paymentMethod.trim();
    }

    // 카드번호 필터
    if (filters.cardNumber && filters.cardNumber.trim() !== '') {
      params.cardNumber = filters.cardNumber.trim();
    }

    const response = await axiosInstance.get(BASE_URL, { params });
    return response.data; // 백엔드가 준 { success, message, data } 반환
  } catch (error) {
    console.error("목록 조회 실패:", error);
    throw error;
  }
};

// 2. 상세 조회 함수 (나중에 쓸 것 미리 만듦)
export const fetchExpenseDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("상세 조회 실패:", error);
    throw error;
  }
};

// 2-1. 지출결의서 수정 함수
export const updateExpense = async (expenseId, data) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${expenseId}`, data);
    return response.data;
  } catch (error) {
    console.error("지출결의서 수정 실패:", error);
    throw error;
  }
};

// 2-2. 지출결의서 임시 저장 함수
export const createExpenseDraft = async (data) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/draft`, data);
    return response.data;
  } catch (error) {
    console.error("지출결의서 임시 저장 실패:", error);
    throw error;
  }
};

// 2-2. 지출결의서 생성 진행률 조회
export const getExpenseCreationProgress = async (jobId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/progress/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("진행률 조회 실패:", error);
    throw error;
  }
};

// 3. 결재 라인 설정
export const setApprovalLines = async (expenseId, approvalLines) => {
    try {
      // approvalLines = [{ approverId: 1, approverPosition: "팀장", approverName: "홍길동", status: "WAIT" }, ...]
      const response = await axiosInstance.post(`${BASE_URL}/${expenseId}/approval-lines`, { approvalLines });
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
      const response = await axiosInstance.post(`${BASE_URL}/${expenseId}/approve`, data);
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
      const response = await axiosInstance.post(`${BASE_URL}/${expenseId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error("결재 반려 실패:", error);
      throw error;
    }
  };

// 5-1. 결재 취소
export const cancelApproval = async (expenseId) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${expenseId}/cancel-approval`);
      return response.data;
    } catch (error) {
      console.error("결재 취소 실패:", error);
      throw error;
    }
  };

// 5-2. 반려 취소
export const cancelRejection = async (expenseId) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${expenseId}/cancel-rejection`);
      return response.data;
    } catch (error) {
      console.error("반려 취소 실패:", error);
      throw error;
    }
  };

// 6. 지출결의서 상태 변경 (ACCOUNTANT 전용)
export const updateExpenseStatus = async (expenseId, userId, status, actualPaidAmount = null, amountDifferenceReason = null, detailActualPaidAmounts = null) => {
    try {
      const requestBody = { status };
      if (actualPaidAmount !== null) {
        requestBody.actualPaidAmount = actualPaidAmount;
      }
      if (amountDifferenceReason !== null && amountDifferenceReason !== '') {
        requestBody.amountDifferenceReason = amountDifferenceReason;
      }
      if (detailActualPaidAmounts !== null && detailActualPaidAmounts.length > 0) {
        requestBody.detailActualPaidAmounts = detailActualPaidAmounts;
      }
      const response = await axiosInstance.put(`${BASE_URL}/${expenseId}/status`, requestBody);
      return response.data;
    } catch (error) {
      console.error("상태 변경 실패:", error);
      throw error;
    }
  };

// 7. 지출결의서 삭제
export const deleteExpense = async (expenseId, userId) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${expenseId}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("지출결의서 삭제 실패:", error);
      throw error;
    }
  };

// 8. 미서명 건 조회 (알람)
export const fetchPendingApprovals = async (userId) => {
    try {
    // userId는 서버에서 SecurityContext로 판단하므로 쿼리 파라미터는 사용하지 않지만,
    // 기존 시그니처 유지를 위해 인자를 받기만 합니다.
    const response = await axiosInstance.get(`${BASE_URL}/pending-approvals`);
      return response.data;
    } catch (error) {
      console.error("미서명 건 조회 실패:", error);
      throw error;
    }
  };

// 8-2. 내가 결재했던 문서 이력 조회
export const fetchMyApprovedReports = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/my-approvals`);
    return response.data;
  } catch (error) {
    console.error("내 결재 문서 조회 실패:", error);
    throw error;
  }
};

// 8-1. 세무 수정 요청 알림 (작성자용) - 기능 비활성화됨
// export const fetchTaxRevisionRequestsForDrafter = async () => {
//   try {
//     const response = await axiosInstance.get(`${BASE_URL}/tax/revision-requests`);
//     return response.data;
//   } catch (error) {
//     console.error("세무 수정 요청 알림 조회 실패:", error);
//     throw error;
//   }
// };

// 9. 영수증 업로드
export const uploadReceipt = async (expenseId, userId, file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await axiosInstance.post(`${BASE_URL}/${expenseId}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
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
      const response = await axiosInstance.get(`${BASE_URL}/${expenseId}/receipts`);
      return response.data;
    } catch (error) {
      console.error("영수증 목록 조회 실패:", error);
      throw error;
    }
  };

// 11. 영수증 삭제
export const deleteReceipt = async (receiptId, userId) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/receipts/${receiptId}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("영수증 삭제 실패:", error);
      throw error;
    }
  };

// 12. 상세 내역별 영수증 업로드
export const uploadReceiptForDetail = async (expenseDetailId, expenseReportId, userId, file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expenseReportId', expenseReportId);
      
      const response = await axiosInstance.post(
        `${BASE_URL}/details/${expenseDetailId}/receipt`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percentCompleted);
            }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("상세 내역별 영수증 업로드 실패:", error);
      throw error;
    }
  };

// 13. 상세 내역별 영수증 목록 조회
export const getReceiptsByDetail = async (expenseDetailId, expenseReportId) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/details/${expenseDetailId}/receipts?expenseReportId=${expenseReportId}`
      );
      return response.data;
    } catch (error) {
      console.error("상세 내역별 영수증 목록 조회 실패:", error);
      throw error;
    }
  };

// 13-1. 상세내역ID만으로 영수증 목록 조회 (세무사용)
export const getReceiptsByDetailIdOnly = async (expenseDetailId) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/receipts/by-detail-id/${expenseDetailId}`
      );
      return response.data;
    } catch (error) {
      console.error("상세내역ID로 영수증 조회 실패:", error);
      throw error;
    }
  };

// 13-2. 영수증 일괄 다운로드
export const downloadReceiptsBatch = async (receiptIds) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/receipts/batch-download`,
      { receiptIds },
      {
        responseType: 'blob', // ZIP 파일 다운로드를 위해 blob으로 받기
      }
    );
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    const now = new Date();
    const filename = `영수증_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.zip`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("영수증 일괄 다운로드 실패:", error);
    let message = "영수증 일괄 다운로드 중 오류가 발생했습니다.";
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

// 12-1. 추가 결재 라인 추가
export const addApprovalLine = async (expenseId, approvalLine) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/${expenseId}/approval-lines/add`, approvalLine);
    return response.data;
  } catch (error) {
    console.error("추가 결재 라인 추가 실패:", error);
    throw error;
  }
};

// 12. 영수증 다운로드
export const downloadReceipt = async (receiptId, filename) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/receipts/${receiptId}/download`, {
        responseType: 'blob', // 파일 다운로드를 위해 blob으로 받기
      });
      
      // Content-Disposition 헤더에서 파일명 추출 (RFC 5987, RFC 2231 모두 지원)
      let downloadFilename = filename || 'receipt.pdf';
      const contentDisposition = response.headers['content-disposition'];
      
      if (contentDisposition) {
        console.log('Content-Disposition 헤더:', contentDisposition); // 디버깅
        
        // RFC 5987 형식: filename*=UTF-8''encoded (개선된 정규식)
        // 세미콜론이나 헤더 끝까지 매칭
        const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/i);
        if (rfc5987Match && rfc5987Match[1]) {
          try {
            downloadFilename = decodeURIComponent(rfc5987Match[1].trim());
            console.log('RFC 5987 디코딩 성공:', downloadFilename);
          } catch (e) {
            console.warn('RFC 5987 디코딩 실패', e, '인코딩된 값:', rfc5987Match[1]);
          }
        } else {
          console.warn('RFC 5987 매칭 실패, 헤더:', contentDisposition);
        }
        
        // RFC 5987이 실패한 경우에만 fallback 처리
        if (downloadFilename === (filename || 'receipt.pdf')) {
          // 일반 filename="..." 파라미터 처리
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            let extracted = filenameMatch[1].replace(/['"]/g, '');
            
            // RFC 2231 형식 체크
            if (extracted.includes('=_UTF-8_Q_') || extracted.includes('=?UTF-8?Q?')) {
              try {
                extracted = extracted
                  .replace(/=\?UTF-8\?Q\?/gi, '')
                  .replace(/\?=/g, '')
                  .replace(/=_UTF-8_Q_/gi, '')
                  .replace(/_/g, ' ')
                  .replace(/=([0-9A-F]{2})/gi, (match, hex) => 
                    String.fromCharCode(parseInt(hex, 16))
                  );
                downloadFilename = extracted;
                console.log('RFC 2231 디코딩 성공:', downloadFilename);
              } catch (e) {
                console.warn('RFC 2231 디코딩 실패', e);
              }
            } else {
              // 일반 인코딩
              try {
                downloadFilename = decodeURIComponent(extracted);
              } catch (e) {
                downloadFilename = extracted;
              }
              console.log('일반 filename 파라미터 사용:', downloadFilename);
            }
          }
        }
      }
      
      console.log('최종 다운로드 파일명:', downloadFilename);
      
      // 확장자가 없거나 .pdf가 아니면 .pdf 추가
      if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
        const lastDot = downloadFilename.lastIndexOf('.');
        if (lastDot > 0) {
          downloadFilename = downloadFilename.substring(0, lastDot) + '.pdf';
        } else {
          downloadFilename = downloadFilename + '.pdf';
        }
      }
      
      // PDF MIME 타입으로 Blob 생성
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFilename);
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

    const response = await axiosInstance.get(`${BASE_URL}/summary/by-category`, { params });
    return response.data;
  } catch (error) {
    console.error("카테고리 요약 조회 실패:", error);
    throw error;
  }
};

// 15. 대시보드 전체 요약 통계 조회 (ADMIN/ACCOUNTANT 전용)
export const fetchDashboardStats = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosInstance.get(`${BASE_URL}/dashboard/stats`, { params });
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
    const response = await axiosInstance.get(`${BASE_URL}/dashboard/monthly-trend`, { params });
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
    const response = await axiosInstance.get(`${BASE_URL}/dashboard/status-stats`, { params });
    return response.data;
  } catch (error) {
    console.error("상태별 통계 조회 실패:", error);
    throw error;
  }
};

// 17.5. 사용자별 지출 통계 조회 (ADMIN/ACCOUNTANT 전용)
export const fetchUserExpenseStats = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosInstance.get(`${BASE_URL}/dashboard/user-stats`, { params });
    return response.data;
  } catch (error) {
    console.error("사용자별 지출 통계 조회 실패:", error);
    throw error;
  }
};

// 18. 카테고리별 비율 조회 (ADMIN/ACCOUNTANT 전용)
export const fetchCategoryRatio = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosInstance.get(`${BASE_URL}/dashboard/category-ratio`, { params });
    return response.data;
  } catch (error) {
    console.error("카테고리별 비율 조회 실패:", error);
    throw error;
  }
};

// 19. APPROVED 상태 결의서 목록 조회 (TAX_ACCOUNTANT 전용)
export const fetchTaxPendingReports = async (startDate = null, endDate = null, collectionStatus = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (collectionStatus !== null && collectionStatus !== undefined) {
      params.collectionStatus = collectionStatus;
    }
    const response = await axiosInstance.get(`${BASE_URL}/tax/pending`, { params });
    return response.data;
  } catch (error) {
    console.error("APPROVED 상태 결의서 조회 실패:", error);
    throw error;
  }
};

// 20. 세무 자료 수집 현황 통계 조회 (TAX_ACCOUNTANT 전용)
export const fetchTaxStatus = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosInstance.get(`${BASE_URL}/tax/status`, { params });
    return response.data;
  } catch (error) {
    console.error("세무 자료 수집 현황 통계 조회 실패:", error);
    throw error;
  }
};

// 21. 월별 집계 조회 (TAX_ACCOUNTANT 전용)
export const fetchMonthlyTaxSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosInstance.get(`${BASE_URL}/tax/monthly-summary`, { params });
    return response.data;
  } catch (error) {
    console.error("월별 집계 조회 실패:", error);
    throw error;
  }
};

// 21-1. 지출 수단별 합계 조회 (ACCOUNTANT, ADMIN, CEO 전용)
export const fetchPaymentMethodSummary = async (startDate = null, endDate = null, status = null, taxProcessed = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status && Array.isArray(status) && status.length > 0) {
      params.status = status;
    }
    if (taxProcessed !== null && taxProcessed !== undefined) {
      params.taxProcessed = taxProcessed;
    }
    const response = await axiosInstance.get(`${BASE_URL}/payment-method-summary`, { params });
    return response.data;
  } catch (error) {
    console.error("지출 수단별 합계 조회 실패:", error);
    throw error;
  }
};

// 22-1. 기간별 세무 자료 일괄 수집 및 전표 다운로드 (TAX_ACCOUNTANT 전용) - 진행률 콜백 추가
export const collectTaxData = async (startDate = null, endDate = null, onProgress = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.post(`${BASE_URL}/tax/collect`, null, { 
      params,
      responseType: 'blob', // 파일 다운로드를 위해 blob으로 받기
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    const filename = `세무전표_${startDate || '전체'}_${endDate || '전체'}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("세무 자료 수집 실패:", error);
    
    // Blob 응답인 경우 에러 메시지 파싱
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        const err = new Error(parsed.message || '세무 자료 수집 중 오류가 발생했습니다.');
        err.userMessage = parsed.message;
        throw err;
      } catch (e) {
        const err = new Error('세무 자료 수집 중 오류가 발생했습니다.');
        err.userMessage = '세무 자료 수집 중 오류가 발생했습니다.';
        throw err;
      }
    }
    
    throw error;
  }
};

// 22-2. 세무 수정 요청 (TAX_ACCOUNTANT 전용) - 기능 비활성화됨
// export const requestTaxRevision = async (expenseReportId, reason) => {
//   try {
//     const response = await axiosInstance.post(`${BASE_URL}/${expenseReportId}/tax/revision-request`, {
//       reason
//     });
//     return response.data;
//   } catch (error) {
//     console.error("세무 수정 요청 실패:", error);
//     throw error;
//   }
// };

// 25. 부가세 신고 서식 다운로드 (TAX_ACCOUNTANT 전용)
export const downloadTaxReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get(`${BASE_URL}/export/tax-report`, {
      params,
      responseType: 'blob', // 파일 다운로드를 위해 blob으로 받기
    });
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    const filename = `부가세신고서식_${startDate || '전체'}_${endDate || '전체'}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("부가세 신고 서식 다운로드 실패:", error);
    let message = "부가세 신고 서식 다운로드 중 오류가 발생했습니다.";
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

// 26. 상세 항목 부가세 공제 정보 업데이트 (TAX_ACCOUNTANT 전용)
export const updateExpenseDetailTaxInfo = async (expenseDetailId, isTaxDeductible, nonDeductibleReason = null) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/details/${expenseDetailId}/tax-info`, {
      isTaxDeductible,
      nonDeductibleReason
    });
    return response.data;
  } catch (error) {
    console.error("부가세 공제 정보 업데이트 실패:", error);
    let message = "부가세 공제 정보 업데이트 중 오류가 발생했습니다.";
    const data = error?.response?.data;
    if (data?.message) {
      message = data.message;
    }
    const err = new Error(message);
    err.userMessage = message;
    throw err;
  }
};

// 24. 전표 다운로드 (ACCOUNTANT 전용) - 진행률 콜백 추가
export const downloadJournalEntries = async (startDate = null, endDate = null, onProgress = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get(`${BASE_URL}/export/journal`, {
      params,
      responseType: 'blob', // 파일 다운로드를 위해 blob으로 받기
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    const filename = `전표_${startDate || '전체'}_${endDate || '전체'}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("전표 다운로드 실패:", error);
    let message = "전표 다운로드 중 오류가 발생했습니다.";
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

// 27-1. 세무 검토용 증빙 리스트 다운로드 작업 시작 (비동기, 진행률 추적)
export const startTaxReviewExport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.post(`${BASE_URL}/export/tax-review/start`, null, { params });
    return response.data;
  } catch (error) {
    console.error("세무 검토 자료 다운로드 작업 시작 실패:", error);
    throw error;
  }
};

// 27-2. 세무 검토용 증빙 리스트 파일 다운로드
export const downloadTaxReviewFile = async (jobId, startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get(`${BASE_URL}/export/tax-review/download/${jobId}`, {
      params,
      responseType: 'blob'
    });
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    const filename = `세무검토_${startDate || '전체'}_${endDate || '전체'}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("세무 검토 자료 파일 다운로드 실패:", error);
    let message = "세무 검토 자료 파일 다운로드 중 오류가 발생했습니다.";
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

// 27. 세무 검토용 증빙 리스트 다운로드 (기존 동기 방식 - 호환성 유지)
export const downloadTaxReviewList = async (startDate = null, endDate = null, format = 'full', onProgress = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (format) params.format = format;
    
    const response = await axiosInstance.get(`${BASE_URL}/export/tax-review`, {
      params,
      responseType: 'blob', // 파일 다운로드를 위해 blob으로 받기
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성
    let formatLabel = '전체상세';
    if (format === 'simple') formatLabel = '간단요약';
    else if (format === 'import') formatLabel = '더존Import';
    
    const filename = `세무검토_${formatLabel}_${startDate || '전체'}_${endDate || '전체'}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("세무 검토 자료 다운로드 실패:", error);
    let message = "세무 검토 자료 다운로드 중 오류가 발생했습니다.";
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