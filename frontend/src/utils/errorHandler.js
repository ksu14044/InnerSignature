/**
 * API 에러 처리 유틸리티
 * 공통 에러 처리 로직을 통합하여 일관된 에러 메시지 제공
 */

/**
 * API 에러를 처리하고 사용자 친화적인 메시지를 반환
 * @param {Error} error - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 에러 메시지
 */
export const handleApiError = (error, defaultMessage = '오류가 발생했습니다.') => {
  const message = error?.response?.data?.message || 
                  error?.message || 
                  defaultMessage;
  
  console.error('API Error:', error);
  return message;
};

/**
 * API 에러를 처리하고 alert로 표시
 * 401 에러(인증 실패)는 이미 axiosInstance에서 처리되므로 alert를 표시하지 않음
 * @param {Error} error - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 에러 메시지
 */
export const showApiError = (error, defaultMessage = '오류가 발생했습니다.') => {
  // 401 에러는 axiosInstance에서 이미 로그인 페이지로 리다이렉트 처리
  // 따라서 alert를 표시하지 않음
  if (error?.response?.status === 401) {
    console.log('인증 실패: 로그인 페이지로 리다이렉트됩니다.');
    return '';
  }
  
  const message = handleApiError(error, defaultMessage);
  alert(message);
  return message;
};

