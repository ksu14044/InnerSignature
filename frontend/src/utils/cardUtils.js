/**
 * 카드 번호 처리 유틸리티 함수들
 */

/**
 * 카드번호를 4개 필드로 분리
 * @param {string} cardNumber - 전체 카드번호
 * @returns {object} 분리된 카드번호 객체
 */
export const splitCardNumber = (cardNumber) => {
  if (!cardNumber) return { cardNumber1: '', cardNumber2: '', cardNumber3: '', cardNumber4: '' };
  const numericValue = cardNumber.replace(/[^0-9]/g, '');
  return {
    cardNumber1: numericValue.substring(0, 4) || '',
    cardNumber2: numericValue.substring(4, 8) || '',
    cardNumber3: numericValue.substring(8, 12) || '',
    cardNumber4: numericValue.substring(12, 16) || ''
  };
};

/**
 * 4개 필드를 하나의 카드번호로 합치기
 * @param {string} cardNumber1 - 첫 번째 필드
 * @param {string} cardNumber2 - 두 번째 필드
 * @param {string} cardNumber3 - 세 번째 필드
 * @param {string} cardNumber4 - 네 번째 필드
 * @returns {string} 합쳐진 카드번호
 */
export const combineCardNumber = (cardNumber1, cardNumber2, cardNumber3, cardNumber4) => {
  return [cardNumber1, cardNumber2, cardNumber3, cardNumber4]
    .filter(part => part)
    .join('');
};
