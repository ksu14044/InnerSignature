// 지출 카테고리 옵션 (하드코딩 제거 - DB에서 가져옴)
// 이 파일은 하위 호환성을 위해 유지되지만, 실제 데이터는 API에서 가져옵니다.

// 기본 카테고리 (API 호출 실패 시 폴백용)
export const EXPENSE_CATEGORIES = [
  { value: '식비/회식', label: '식비/회식' },
  { value: '출장/교통비', label: '출장/교통비' },
  { value: '거래처 접대', label: '거래처 접대' },
  { value: '사무용품', label: '사무용품' },
  { value: '수수료', label: '수수료' },
  { value: '광고/홍보', label: '광고/홍보' },
  { value: '통신비', label: '통신비' },
  { value: '차량비', label: '차량비' },
  { value: '도서/인쇄', label: '도서/인쇄' },
  { value: '세금/공과금', label: '세금/공과금' },
  { value: '기타', label: '기타' },
];

// CEO, ADMIN, ACCOUNTANT 전용 카테고리
export const ADMIN_ONLY_CATEGORIES = [
  { value: '급여', label: '급여 (CEO, ADMIN 전용)' },
];

// 역할에 따른 카테고리 목록 반환 (폴백용 - API 호출 실패 시 사용)
export const getCategoriesByRole = (role) => {
  if (role === 'CEO' || role === 'ADMIN' || role === 'ACCOUNTANT') {
    return [...EXPENSE_CATEGORIES, ...ADMIN_ONLY_CATEGORIES];
  }
  return EXPENSE_CATEGORIES;
};

// API에서 가져온 카테고리를 value/label 형식으로 변환
export const convertCategoryDtoToOption = (categoryDto) => ({
  value: categoryDto.categoryName,
  label: categoryDto.categoryName,
  categoryId: categoryDto.categoryId,
  isGlobal: categoryDto.isGlobal || categoryDto.companyId === null,
});

// API에서 가져온 카테고리 목록을 역할에 따라 필터링/정리
export const filterCategoriesByRole = (categories, role) => {
  // 관리자 역할인 경우 급여 카테고리 표시
  const isAdmin = role === 'CEO' || role === 'ADMIN' || role === 'ACCOUNTANT';
  
  return categories
    .filter(cat => {
      // 급여 카테고리는 관리자만
      if (cat.categoryName === '급여' && !isAdmin) {
        return false;
      }
      return true;
    })
    .map(convertCategoryDtoToOption);
};