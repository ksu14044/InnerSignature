import { useState, useCallback } from 'react';

export const useExpensePagination = (initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 10;

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
    setCurrentPage(pageData.page || 1);
    setTotalPages(pageData.totalPages || 1);
    setTotalElements(pageData.totalElements || 0);
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
