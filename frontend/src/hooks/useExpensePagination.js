import { useState, useCallback, useEffect } from 'react';

export const useExpensePagination = (initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 10;

  // totalPages 변경 추적
  useEffect(() => {
    console.log('[Pagination Hook] totalPages 변경:', totalPages, '타입:', typeof totalPages);
  }, [totalPages]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage, onLoadList) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      onLoadList(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  // 페이지네이션 정보 업데이트
  const updatePagination = useCallback((pageData) => {
    console.log('[Pagination] updatePagination 호출:', {
      received: pageData,
      totalPages: pageData.totalPages,
      totalPagesType: typeof pageData.totalPages,
      isUndefined: pageData.totalPages === undefined,
      isNull: pageData.totalPages === null
    });
    
    const newPage = pageData.page || 1;
    // totalPages가 명시적으로 전달된 경우 그대로 사용 (0도 유효한 값)
    // undefined나 null인 경우에만 1로 기본값 설정
    const newTotalPages = pageData.totalPages !== undefined && pageData.totalPages !== null ? pageData.totalPages : 1;
    const newTotalElements = pageData.totalElements || 0;
    
    console.log('[Pagination] 설정할 값:', {
      page: newPage,
      totalPages: newTotalPages,
      totalElements: newTotalElements
    });
    
    setCurrentPage(newPage);
    setTotalPages(newTotalPages);
    setTotalElements(newTotalElements);
    
    console.log('[Pagination] 상태 업데이트 완료');
  }, []);

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    handlePageChange,
    updatePagination,
    getPageNumbers
  };
};
