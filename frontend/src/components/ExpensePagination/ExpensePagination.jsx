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

  // totalPages가 0이면 아직 데이터가 로드되지 않은 상태
  if (pages <= 1) return null;

  const handlePageChange = (newPage) => {
    if (isPaymentPending) {
      onPaymentPendingPageChange(newPage);
    } else {
      onPageChange(newPage);
    }
  };

  return (
    <S.PaginationContainer>
      <S.Pagination>
        {/* 첫 페이지 버튼 */}
        <S.PaginationButton
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          aria-label="첫 페이지"
        >
          <S.IconWrapper>
            <S.PaginationIcon 
              src="/이너사인_이미지 (1)/아이콘/24px_페이지넘기기/페이지넘기기_02_왼쪽.png" 
              alt="첫 페이지"
            />
          </S.IconWrapper>
        </S.PaginationButton>
        
        {/* 이전 페이지 버튼 */}
        <S.PaginationButton
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="이전 페이지"
        >
          <S.IconWrapper>
            <S.PaginationIcon 
              src="/이너사인_이미지 (1)/아이콘/24px_페이지넘기기/페이지넘기기_01_왼쪽.png" 
              alt="이전 페이지"
            />
          </S.IconWrapper>
        </S.PaginationButton>
        
        {/* 현재 페이지 번호 */}
        <S.PaginationButton
          active={true}
          aria-label={`페이지 ${page}`}
        >
          {page}
        </S.PaginationButton>
        
        {/* 다음 페이지 버튼 */}
        <S.PaginationButton
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pages}
          aria-label="다음 페이지"
        >
          <S.IconWrapper>
            <S.PaginationIcon 
              src="/이너사인_이미지 (1)/아이콘/24px_페이지넘기기/페이지넘기기_01_오른쪽.png" 
              alt="다음 페이지"
            />
          </S.IconWrapper>
        </S.PaginationButton>
        
        {/* 마지막 페이지 버튼 */}
        <S.PaginationButton
          onClick={() => handlePageChange(pages)}
          disabled={page === pages}
          aria-label="마지막 페이지"
        >
          <S.IconWrapper>
            <S.PaginationIcon 
              src="/이너사인_이미지 (1)/아이콘/24px_페이지넘기기/페이지넘기기_02_오른쪽.png" 
              alt="마지막 페이지"
            />
          </S.IconWrapper>
        </S.PaginationButton>
      </S.Pagination>
    </S.PaginationContainer>
  );
};

export default ExpensePagination;
