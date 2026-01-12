/**
 * 숫자 포맷팅 및 변환 유틸리티 함수들
 */

/**
 * 숫자를 한국어 포맷으로 변환 (콤마 추가)
 * @param {string|number} value - 포맷팅할 값
 * @returns {string} 포맷팅된 문자열
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  const stringValue = String(value);
  const numericValue = stringValue.replace(/[^0-9]/g, '');
  if (!numericValue) return '';
  return Number(numericValue).toLocaleString('ko-KR');
};

/**
 * 포맷팅된 숫자 문자열을 숫자로 변환 (콤마 제거)
 * @param {string|number} value - 변환할 값
 * @returns {string} 숫자 문자열
 */
export const parseFormattedNumber = (value) => {
  if (!value && value !== 0) return '';
  // 숫자인 경우 문자열로 변환
  if (typeof value === 'number') {
    return String(value);
  }
  // 문자열인 경우 콤마 제거
  if (typeof value === 'string') {
    return value.replace(/,/g, '');
  }
  return '';
};

/**
 * 사업자등록번호 포맷팅 (하이픈 자동 추가)
 * @param {string} value - 포맷팅할 사업자등록번호
 * @returns {string} 포맷팅된 사업자등록번호
 */
export const formatBusinessRegNo = (value) => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
};
