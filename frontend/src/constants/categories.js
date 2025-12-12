// 지출 카테고리 옵션
export const EXPENSE_CATEGORIES = [
  { value: '식대', label: '식대' },
  { value: '교통비', label: '교통비' },
  { value: '비품비', label: '비품비' },
  { value: '기타', label: '기타' },
];

// ADMIN 전용 카테고리
export const ADMIN_ONLY_CATEGORIES = [
  { value: '급여', label: '급여 (ADMIN 전용)' },
];

// 역할에 따른 카테고리 목록 반환
export const getCategoriesByRole = (role) => {
  if (role === 'ADMIN' || role === 'ACCOUNTANT') {
    return [...EXPENSE_CATEGORIES, ...ADMIN_ONLY_CATEGORIES];
  }
  return EXPENSE_CATEGORIES;
};