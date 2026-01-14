import { STATUS_KOREAN } from '../../constants/status';
import * as S from './style';

const ExpenseFilters = ({
  isOpen,
  filterRefs,
  localStatus,
  onStatusChange,
  onApply,
  onReset,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <S.FilterContainer>
      <S.FilterTitle>
        <span>필터 조건</span>
        <button onClick={onClose}>×</button>
      </S.FilterTitle>
      <S.FilterGrid>
        <S.FilterGroup>
          <S.FilterLabel>작성일 시작일</S.FilterLabel>
          <S.FilterInput
            type="date"
            ref={(el) => (filterRefs.current.startDate = el)}
          />
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>작성일 종료일</S.FilterLabel>
          <S.FilterInput
            type="date"
            ref={(el) => (filterRefs.current.endDate = el)}
          />
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>최소 금액 (원)</S.FilterLabel>
          <S.FilterInput
            type="number"
            placeholder="0"
            ref={(el) => (filterRefs.current.minAmount = el)}
            min="0"
          />
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>최대 금액 (원)</S.FilterLabel>
          <S.FilterInput
            type="number"
            placeholder="무제한"
            ref={(el) => (filterRefs.current.maxAmount = el)}
            min="0"
          />
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>카테고리</S.FilterLabel>
          <S.FilterSelect
            ref={(el) => (filterRefs.current.category = el)}
          >
            <option value="">전체</option>
            <option value="식대">식대</option>
            <option value="교통비">교통비</option>
            <option value="비품비">비품비</option>
            <option value="기타">기타</option>
          </S.FilterSelect>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>작성자(기안자)</S.FilterLabel>
          <S.FilterInput
            type="text"
            ref={(el) => (filterRefs.current.drafterName = el)}
            placeholder="작성자 이름"
          />
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>결제수단</S.FilterLabel>
          <S.FilterSelect
            ref={(el) => (filterRefs.current.paymentMethod = el)}
          >
            <option value="">전체</option>
            <option value="CASH">현금</option>
            <option value="CARD">개인카드</option>
            <option value="COMPANY_CARD">회사카드</option>
          </S.FilterSelect>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>카드번호</S.FilterLabel>
          <S.FilterInput
            type="text"
            ref={(el) => (filterRefs.current.cardNumber = el)}
            placeholder="카드번호 (뒷 4자리)"
          />
        </S.FilterGroup>
      </S.FilterGrid>
      <S.FilterGroup>
        <S.FilterLabel>상태</S.FilterLabel>
        <S.StatusCheckboxGroup>
          {Object.entries(STATUS_KOREAN).map(([status, label]) => {
            // DRAFT와 PENDING은 제외 (실제 사용되는 상태만 표시)
            if (status === 'DRAFT' || status === 'PENDING') return null;
            return (
              <S.StatusCheckboxLabel key={status}>
                <input
                  type="checkbox"
                  checked={localStatus.includes(status)}
                  onChange={() => onStatusChange(status)}
                />
                <span>{label}</span>
              </S.StatusCheckboxLabel>
            );
          })}
        </S.StatusCheckboxGroup>
      </S.FilterGroup>
      <S.FilterActions>
        <S.FilterButton variant="secondary" onClick={onReset}>
          초기화
        </S.FilterButton>
        <S.FilterButton variant="primary" onClick={onApply}>
          적용
        </S.FilterButton>
      </S.FilterActions>
    </S.FilterContainer>
  );
};

export default ExpenseFilters;
