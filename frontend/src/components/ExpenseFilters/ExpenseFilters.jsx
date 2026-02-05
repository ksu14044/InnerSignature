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
      <S.FilterGrid>
        <S.FilterGroup>
          <S.FilterLabel>작성 시작일</S.FilterLabel>
          <S.FilterInputWrapper>

            <S.FilterInput
              type="date"
              hasIcon={true}
              ref={(el) => (filterRefs.current.startDate = el)}
            />
            <S.FilterInputIcon 
              src="/이너사인_이미지 (1)/아이콘/20px_기타_입력/일자선택.png" 
              alt="날짜"
              onClick={() => {
                if (filterRefs.current.startDate) {
                  if (filterRefs.current.startDate.showPicker) {
                    filterRefs.current.startDate.showPicker();
                  } else {
                    filterRefs.current.startDate.click();
                  }
                }
              }}
            />
          </S.FilterInputWrapper>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>작성 종료일</S.FilterLabel>
          <S.FilterInputWrapper>
            <S.FilterInputIcon 
              src="/이너사인_이미지 (1)/아이콘/20px_기타_입력/일자선택.png" 
              alt="날짜"
              onClick={() => {
                if (filterRefs.current.endDate) {
                  if (filterRefs.current.endDate.showPicker) {
                    filterRefs.current.endDate.showPicker();
                  } else {
                    filterRefs.current.endDate.click();
                  }
                }
              }}
            />
            <S.FilterInput
              type="date"
              hasIcon={true}
              ref={(el) => (filterRefs.current.endDate = el)}
            />
          </S.FilterInputWrapper>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>최소 금액(원)</S.FilterLabel>
          <S.FilterInputWrapper>
            <S.FilterInput
              type="number"
              placeholder="0"
              hasIcon={false}
              ref={(el) => (filterRefs.current.minAmount = el)}
              min="0"
            />
          </S.FilterInputWrapper>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>최대 금액(원)</S.FilterLabel>
          <S.FilterInputWrapper>
            <S.FilterInput
              type="number"
              placeholder="무제한"
              hasIcon={false}
              ref={(el) => (filterRefs.current.maxAmount = el)}
              min="0"
            />
          </S.FilterInputWrapper>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>카테고리</S.FilterLabel>
          <S.FilterSelectWrapper>
            <S.FilterSelect
              ref={(el) => (filterRefs.current.category = el)}
            >
              <option value="">전체</option>
              <option value="식대">식대</option>
              <option value="교통비">교통비</option>
              <option value="비품비">비품비</option>
              <option value="기타">기타</option>
            </S.FilterSelect>
            <S.FilterSelectIcon src="/이너사인_이미지 (1)/아이콘/20px_기타_입력/선택.png" alt="선택" />
          </S.FilterSelectWrapper>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>작성자(기안자)</S.FilterLabel>
          <S.FilterInputWrapper>
            <S.FilterInput
              type="text"
              placeholder="작성자 이름"
              hasIcon={false}
              ref={(el) => (filterRefs.current.drafterName = el)}
            />
          </S.FilterInputWrapper>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>결제수단</S.FilterLabel>
          <S.FilterSelectWrapper>
            <S.FilterSelect
              ref={(el) => (filterRefs.current.paymentMethod = el)}
            >
              <option value="">전체</option>
              <option value="CASH">현금</option>
              <option value="CARD">개인카드</option>
              <option value="COMPANY_CARD">회사카드</option>
            </S.FilterSelect>
            <S.FilterSelectIcon src="/이너사인_이미지 (1)/아이콘/20px_기타_입력/선택.png" alt="선택" />
          </S.FilterSelectWrapper>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>카드번호</S.FilterLabel>
          <S.FilterInputWrapper>
            <S.FilterInput
              type="text"
              placeholder="카드번호(뒷 4자리)"
              hasIcon={false}
              ref={(el) => (filterRefs.current.cardNumber = el)}
            />
          </S.FilterInputWrapper>
        </S.FilterGroup>
        <S.FilterGroup style={{ gridColumn: '1 / -1', height: 'auto' }}>
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
      </S.FilterGrid>
      <S.FilterActions>
        <S.ResetButton onClick={onReset}>
          <img src="/이너사인_이미지 (1)/아이콘/16px_다시하기/다시하기.png" alt="초기화" />
          <span>초기화</span>
        </S.ResetButton>
        <S.ApplyButton onClick={onApply}>
          <span>적용</span>
        </S.ApplyButton>
      </S.FilterActions>
    </S.FilterContainer>
  );
};

export default ExpenseFilters;
