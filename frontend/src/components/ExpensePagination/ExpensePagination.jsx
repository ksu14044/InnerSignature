import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as S from './style';

const ExpensePagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isPaymentPending = false,
  paymentPendingPage,
  paymentPendingTotalPages,
  paymentPendingTotalElements,
  onPaymentPendingPageChange
}) => {
  // 결제 대기 탭인지 일반 탭인지에 따라 다른 값 사용
  const page = isPaymentPending ? paymentPendingPage : currentPage;
  const pages = isPaymentPending ? paymentPendingTotalPages : totalPages;
  const elements = isPaymentPending ? paymentPendingTotalElements : totalElements;

  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPages = 5;
    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
    let endPage = Math.min(pages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handlePageChange = (newPage) => {
    if (isPaymentPending) {
      onPaymentPendingPageChange(newPage);
    } else {
      onPageChange(newPage);
    }
  };

  const startItem = ((page - 1) * pageSize + 1);
  const endItem = Math.min(page * pageSize, elements);

  return (
    <S.PaginationContainer>
      <S.PaginationInfo>
        전체 {elements}개 중 {startItem}-{endItem}개 표시
      </S.PaginationInfo>
      <S.Pagination>
        <S.PaginationButton
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <FaChevronLeft />
        </S.PaginationButton>
        {getPageNumbers().map((pageNum) => (
          <S.PaginationButton
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            active={pageNum === page}
          >
            {pageNum}
          </S.PaginationButton>
        ))}
        <S.PaginationButton
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pages}
        >
          <FaChevronRight />
        </S.PaginationButton>
      </S.Pagination>
    </S.PaginationContainer>
  );
};

export default ExpensePagination;
