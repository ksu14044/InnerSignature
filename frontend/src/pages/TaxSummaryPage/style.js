import styled from '@emotion/styled';

// 지출결의서 목록 페이지와 동일한 전체 레이아웃 컨테이너
export const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 40px;
  min-height: 100vh;
  background: #f8f9fa;

  @media (max-width: 768px) {
    padding: 16px 16px 16px 40px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 80px;
    padding-left: 40px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Title = styled.h1`
  font-size: 26px;
  margin: 0;
  color: var(--dark-color);

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const SubTitle = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  margin-top: 6px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
  }

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ variant }) => (variant === 'danger' ? '#fff' : '#fff')};
  background: ${({ variant }) => {
    if (variant === 'secondary') return '#6c757d';
    if (variant === 'danger') return '#dc3545';
    if (variant === 'primary') return '#007bff';
    if (variant === 'success') return '#28a745';
    return 'var(--primary-color)';
  }};
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px;
  }
`;

export const FilterStatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e9ecef;
`;

export const FilterStatusLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-color);

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const FilterStatusText = styled.span`
  font-size: 13px;
  color: #495057;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 6px;
  display: block;

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 4px;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 14px;
    min-height: 44px;
  }
`;

export const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;

  @media (max-width: 480px) {
    display: block;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: transparent;

    thead {
      display: none;
    }

    tbody {
      display: block;
    }

    tr {
      display: block;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      margin-bottom: 12px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
  }
`;

export const Th = styled.th`
  padding: 12px;
  text-align: ${({ align }) => align || 'left'};
  background: #f8f9fa;
  border-bottom: none;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  position: relative;
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
  user-select: none;
  transition: background-color 0.2s ease;

  ${({ sortable }) =>
    sortable &&
    `
    &:hover {
      background: #e9ecef;
    }
  `}

  ${({ active }) =>
    active &&
    `
    background: #e7f3ff;
    color: var(--primary-color);
  `}

  ${({ direction }) =>
    direction &&
    `
    &::after {
      content: '${direction === 'asc' ? '▲' : '▼'}';
      margin-left: 6px;
      font-size: 10px;
      opacity: 0.7;
    }
  `}

  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Td = styled.td`
  padding: 16px 12px;
  border-bottom: none;
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  text-align: ${({ align }) => align || 'left'};

  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    display: block;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    text-align: left !important;

    &:last-child {
      border-bottom: none;
    }

    &::before {
      content: attr(data-label) ': ';
      font-weight: 700;
      color: var(--secondary-color);
      display: inline-block;
      min-width: 100px;
      margin-right: 8px;
    }

    &:has(input[type="checkbox"]) {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
      text-align: left;
    }

    &:has(input[type="checkbox"])::before {
      display: block;
      margin-bottom: 4px;
    }

    &:has(button) {
      text-align: center;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }

    &:has(button)::before {
      display: none;
    }

    &:has(input[type="checkbox"]):has(button) {
      text-align: left;
      padding-top: 8px;
      border-top: none;
      margin-top: 0;
    }

    &:has(input[type="checkbox"]):has(button)::before {
      display: block;
    }
  }
`;

export const Tr = styled.tr`
  transition: background-color 0.15s ease;
  background-color: ${props => props.even ? '#f8f9fa' : '#ffffff'};

  &:hover {
    background-color: #f0f0f0;
  }

  @media (max-width: 480px) {
    &:hover {
      background-color: #fff;
    }

    ${({ even }) =>
      even &&
      `
      background-color: #fff;
    `}
  }
`;

export const Empty = styled.div`
  padding: 24px;
  text-align: center;
  color: var(--secondary-color);

  @media (max-width: 480px) {
    padding: 20px 16px;
    font-size: 14px;
  }
`;

export const Alert = styled.div`
  margin-top: 12px;
  background: #fff4e5;
  border: 1px solid #ffd8a8;
  border-radius: 8px;
  padding: 12px 14px;
  color: #d9480f;
  font-size: 14px;

  @media (max-width: 480px) {
    margin: 0 16px 16px 16px;
    padding: 12px;
    font-size: 13px;
  }
`;

export const Card = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  margin-bottom: 16px;

  @media (max-width: 480px) {
    margin: 0 0 12px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 16px;
    box-shadow: none;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const CardTitle = styled.h3`
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardSubtitle = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: #333333;
`;

export const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

// 승인 지출결의서 테이블
export const PendingTable = styled.div`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
  gap: 16px;
  padding: 12px 0;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
`;

export const TableHeaderCell = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  text-align: ${props => props.align || 'left'};
`;

export const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e4e4e4;
  background: ${props => props.even ? '#f8f9fa' : '#ffffff'};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  text-align: ${props => props.align || 'left'};
`;

// 수집 상태 배지
export const CollectedBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #f8ebff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  color: #a133e0;
`;

export const NotCollectedBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #f4f4f4;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  color: #666666;
`;

// 영수증 검색 카드
export const ReceiptSearchCard = styled.div`
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin: 0 0 12px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 16px;
  }
`;

export const UsageInfoBox = styled.div`
  background: #f8fbff;
  border: 1px solid #489bff;
  border-radius: 4px;
  padding: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

export const UsageTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
`;

export const UsageText = styled.div`
  font-size: 15px;
  font-weight: 350;
  color: #666666;
  line-height: 24px;
`;

export const SearchInputGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-top: 24px;
  margin-bottom: 24px;
`;

export const SearchInputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SearchLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
  
  &::placeholder {
    color: #777777;
  }
`;

export const SearchButton = styled.button`
  padding: 10px 20px;
  background: #489bff;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #3a8aef;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ReceiptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ReceiptItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  background-color: #ffffff;
  align-items: flex-start;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 12px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const ReceiptInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 15px;
  color: #333333;
  min-width: 0;
  font-family: 'Noto Sans KR', sans-serif;

  strong {
    color: #333333;
    font-size: 15px;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  div {
    font-size: 14px;
    color: #666666;
  }
`;

export const ReceiptFileName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

export const ReceiptMeta = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

export const DownloadReceiptButton = styled.button`
  padding: 0;
  border: none;
  border-radius: 4px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  white-space: nowrap;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-left: 16px;

  &:hover {
    background-color: #f0f0f0;
  }

  @media (max-width: 480px) {
    flex: 1;
    padding: 10px 12px;
    font-size: 12px;
    min-height: 44px;
    width: auto;
  }
`;

export const Small = styled.div`
  font-size: 13px;
  color: var(--secondary-color);

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const StatusChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const StatusChip = styled.button`
  border: 1px solid ${({ active }) => (active ? 'var(--primary-color)' : '#e0e0e0')};
  background: ${({ active }) => (active ? 'rgba(0, 123, 255, 0.08)' : '#fff')};
  color: ${({ active }) => (active ? 'var(--primary-color)' : '#333')};
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

// 자료 수집 및 전표 다운로드 카드
export const CollectCard = styled.div`
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin: 0 0 12px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 16px;
  }
`;

export const CollectTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 16px 0;
`;

// 수집 안내 박스
export const InfoBox = styled.div`
  background: #f8fbff;
  border: 1px solid #489bff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
`;

export const InfoTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
`;

export const InfoText = styled.div`
  font-size: 15px;
  font-weight: 350;
  color: #666666;
  line-height: 24px;
`;

// 수집 모드 선택
export const ModeSelector = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
`;

export const ModeOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

export const RadioLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333333;
`;

// 날짜 입력 섹션
export const DateCollectSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MonthCollectSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DateInputGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const DateInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DateLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
`;

export const DateInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
`;

export const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 필터 카드
export const FilterCard = styled.div`
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin: 0 0 12px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 16px;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
`;

export const FilterInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
`;

export const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  color: #777777;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

export const ApplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #489bff;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3a8aef;
  }
`;

// 통계 카드 (그라데이션 배경)
export const StatCard = styled.div`
  background: linear-gradient(180deg, #74dbed 0%, #489bff 100%);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
  }

  @media (max-width: 480px) {
    margin: 0 0 12px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }
`;

export const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
`;

export const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  line-height: 28.8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const LinkButton = styled.button`
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-size: inherit;
  transition: color 0.15s ease;
  word-break: break-word;
  text-align: left;

  &:hover {
    color: #0056b3;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    width: 100%;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;

  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
  }
`;

export const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: #fff;
    border-color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

export const PaginationInfo = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const TaxProcessedBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  ${({ completed }) =>
    completed
      ? `
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `
      : `
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  `}

  @media (max-width: 480px) {
    font-size: 0.75em;
    padding: 3px 8px;
  }
`;

export const SecretBadge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #dc3545;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  vertical-align: middle;

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 2px 6px;
    margin-left: 4px;
  }
`;

