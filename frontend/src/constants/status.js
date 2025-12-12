// 상태 값 상수
export const EXPENSE_STATUS = {
  WAIT: 'WAIT',           // 대기
  APPROVED: 'APPROVED',   // 승인
  REJECTED: 'REJECTED',   // 반려
  PAID: 'PAID',          // 지급완료
};

export const APPROVAL_STATUS = {
  WAIT: 'WAIT',          // 대기
  APPROVED: 'APPROVED',  // 승인
  REJECTED: 'REJECTED',  // 반려
};

export const USER_ROLES = {
  USER: 'USER',         // 일반 사용자
  ADMIN: 'ADMIN',       // 관리자
  SUPERADMIN: 'SUPERADMIN',  // 최고 관리자
};

// 상태 한글 매핑
export const STATUS_KOREAN = {
  DRAFT: '초안',
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
  PAID: '지급완료',
  WAIT: '대기'
};