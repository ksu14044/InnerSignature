import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  background-color: white;

  @media (max-width: 480px) {
    padding: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    max-width: 100%;
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: calc(64px + 200px); /* 하단 네비게이션(64px) + 버튼 그룹 최대 높이(200px) */
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0;
    margin-bottom: 0;
    padding: 0;
    border-bottom: none;
    background: transparent;
    margin-bottom: 0;
  }
`;

export const TitleInfo = styled.div`
  h1 {
    margin: 0 0 15px 0;
    font-size: 28px;
    letter-spacing: -1px;
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  p {
    margin: 5px 0;
    color: #666;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    strong { color: #333; }
  }

  @media (max-width: 480px) {
    width: 100%;
    background: white;
    padding: 16px;
    border-radius: 0;
    margin-bottom: 8px;
    
    h1 {
      font-size: 20px;
      margin-bottom: 16px;
      white-space: normal;
      word-break: break-word;
      font-weight: 700;
    }
    
    p {
      font-size: 14px;
      margin: 8px 0;
      white-space: normal;
      line-height: 1.6;
      display: flex;
      align-items: center;
      
      strong {
        display: inline-block;
        min-width: 80px;
        color: #666;
        font-weight: 600;
      }
    }
  }
`;

export const SecretBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background-color: #dc3545;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  vertical-align: middle;
`;

// 결재란 영역
export const StampArea = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;

  @media (max-width: 480px) {
    flex-direction: row;
    width: 100%;
    gap: 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 16px;
    background: white;
    margin-bottom: 8px;
    border-radius: 0;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 2px;
    }
  }
`;

// 도장 박스 하나
export const StampBox = styled.div`
  border: 1px solid #aaa;
  width: 90px;
  text-align: center;
  background-color: white;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 80px;
    min-width: 80px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }
`;

export const StampPosition = styled.div`
  background-color: #f4f4f4;
  border-bottom: 1px solid #aaa;
  padding: 4px;
  font-size: 12px;
  color: #333;
`;

export const StampContent = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  span {
    color: #bbb;
    font-size: 11px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }

  @media (max-width: 480px) {
    height: auto;
    min-height: 60px;
    padding: 8px;
    
    span {
      font-size: 10px;
    }
  }
`;

export const StampDate = styled.div`
  border-top: 1px dotted #ccc;
  font-size: 10px;
  height: 20px;
  line-height: 20px;
  color: #888;
`;

// 본문 영역
export const ContentArea = styled.div`
  margin: 30px 0;

  @media (max-width: 480px) {
    margin: 0;
    padding: 0;
    background: transparent;
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 10px;
  border-left: 4px solid #333;
  padding-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 0;
    padding: 16px;
    padding-left: 12px;
    border-left-width: 3px;
    font-weight: 600;
    white-space: normal;
    word-break: break-word;
    background: white;
    border-left: none;
    border-bottom: 2px solid var(--primary-color);
    margin-bottom: 8px;
  }
`;

export const TotalAmount = styled.div`
  text-align: right;
  font-size: 18px;
  margin-bottom: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  span {
    font-weight: bold;
    font-size: 24px;
    text-decoration: underline;
    margin-left: 10px;
  }

  @media (max-width: 480px) {
    text-align: left;
    font-size: 14px;
    margin-bottom: 8px;
    padding: 20px 16px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: white;
    border-radius: 0;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    span {
      font-size: 32px;
      margin-left: 0;
      display: block;
      margin-top: 0;
      text-decoration: none;
      font-weight: 700;
    }
  }
`;

// 상호명 셀 스타일
export const MerchantNameCell = styled.td`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: ${props => props.hasTooltip ? 'help' : 'default'};
  position: relative;
  
  &:hover {
    ${props => props.hasTooltip && `
      background-color: #f0f8ff;
    `}
  }
`;

// 테이블 재사용 (간단한 스타일이라 여기서 다시 정의하거나 공통 컴포넌트로 뺄 수 있음)
export const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    background-color: #fafafa;
    border: 1px solid #ddd;
    padding: 10px;
    font-size: 13px;
    vertical-align: middle;
  }
  td {
    border: 1px solid #ddd;
    padding: 10px;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 0;
    vertical-align: middle;
  }
  
  td:nth-child(2), td:nth-child(4) {
    white-space: normal;
    word-break: break-word;
    max-width: none;
  }

  @media (max-width: 480px) {
    display: block;
    border: none;
    
    thead {
      display: none;
    }
    
    tbody {
      display: block;
    }
    
    tbody {
      padding: 0 16px;
    }
    
    tr {
      display: block;
      background: white;
      border-radius: 0;
      margin-bottom: 8px;
      padding: 16px;
      box-shadow: none;
      border: none;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: none;
      padding: 12px 0;
      font-size: 14px;
      white-space: normal;
      max-width: 100%;
      border-bottom: none;
      
      &:not(:last-child) {
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f5f5f5;
      }
      
      &:before {
        content: attr(data-label);
        font-weight: 600;
        color: #999;
        display: flex;
        align-items: center;
        min-width: 60px;
        font-size: 13px;
        flex-shrink: 0;
      }
    }
    
    td[data-label="항목"] {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 16px;
      align-items: center;
      
      &:before {
        color: var(--primary-color);
        align-items: center;
      }
    }
    
    td[data-label="금액"] {
      font-weight: 700;
      color: #333;
      font-size: 18px;
      align-items: center;
      
      &:before {
        color: #666;
        align-items: center;
      }
    }
    
    td[data-label="적요"],
    td[data-label="비고"] {
      color: #666;
      font-size: 14px;
      align-items: center;
      
      &:before {
        align-items: center;
      }
    }
  }
`;

export const ButtonGroup = styled.div`
  text-align: center;
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  
  button {
    padding: 12px 24px;
    margin: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background 0.2s;
    min-height: 48px;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.back {
      background-color: #e5e7eb;
      color: #374151;
      &:hover { background-color: #d1d5db; }
    }
    
    &.approve {
      background-color: #10b981;
      color: white;
      &:hover { background-color: #059669; }
    }

    &.reject {
      background-color: #ef4444;
      color: white;
      &:hover { background-color: #dc2626; }
    }

    &.paid {
      background-color: #8b5cf6;
      color: white;
      &:hover { background-color: #7c3aed; }
    }
  }

  @media (max-width: 480px) {
    position: fixed;
    bottom: 64px;
    left: 0;
    right: 0;
    background: white;
    padding: 12px 16px;
    margin: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    gap: 8px;
    z-index: 998;
    
    button {
      width: 100%;
      padding: 16px;
      font-size: 16px;
      min-width: 0;
      border-radius: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

// 반려 모달
export const RejectModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const RejectModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (max-width: 480px) {
    width: 95%;
    max-width: 100%;
    border-radius: 8px 8px 0 0;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

export const RejectModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100% - 40px);
  }

  button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-width: 30px;
    min-height: 30px;

    &:hover {
      color: #374151;
    }
  }

  @media (max-width: 480px) {
    padding: 16px;
    
    h3 {
      font-size: 16px;
    }
    
    button {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      font-size: 28px;
    }
  }
`;

export const RejectModalBody = styled.div`
  padding: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
  }

  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    min-height: 100px;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
`;

export const RejectModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    min-height: 48px;
    min-width: 80px;

    &:first-of-type {
      background-color: #f3f4f6;
      color: #374151;

      &:hover {
        background-color: #e5e7eb;
      }
    }

    &:last-of-type {
      background-color: #ef4444;
      color: white;

      &:hover {
        background-color: #dc2626;
      }
    }
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    padding: 16px;
    gap: 8px;
    
    button {
      width: 100%;
      min-width: 0;
      padding: 14px 16px;
      font-size: 14px;
    }
  }
`;

// 결제 완료 모달 (RejectModal과 동일한 스타일 재사용)
export const PaymentModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  @media (max-width: 480px) {
    align-items: center;
    padding: 20px 20px calc(64px + 20px) 20px;  // 하단: 64px(네비게이션) + 20px(padding)
  }
`;

export const PaymentModalContent = styled(RejectModalContent)`
  @media (max-width: 480px) {
    display: flex !important;
    flex-direction: column;
    max-height: calc(100vh - 104px) !important;  // 20px(padding-top) + 20px(padding-bottom) + 64px(하단 네비게이션)
    height: auto;
    overflow: hidden !important;
    overflow-y: hidden !important;
  }
`;
export const PaymentModalHeader = styled(RejectModalHeader)`
  flex-shrink: 0;
`;
export const PaymentModalBody = styled(RejectModalBody)`
  max-height: 80vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 480px) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  input[type="number"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  .amount-info {
    background-color: #f3f4f6;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;
    
    .amount-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
        padding-top: 8px;
        border-top: 1px solid #d1d5db;
        font-weight: 600;
        color: #ef4444;
      }
    }
  }
`;
export const PaymentModalFooter = styled(RejectModalFooter)`
  flex-shrink: 0;

  button:last-of-type {
    background-color: #28a745;
    color: white;

    &:hover {
      background-color: #218838;
    }
  }
`;

// 영수증 섹션
export const ReceiptSection = styled.div`
  margin-top: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;

  @media (max-width: 480px) {
    margin-top: 8px;
    padding: 16px;
    border-radius: 0;
    background: white;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
    padding-bottom: 24px;
  }
`;

export const ReceiptSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 12px;
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  align-items: flex-start;

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

export const ReceiptPreview = styled.div`
  flex-shrink: 0;
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ReceiptImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  object-fit: contain;
`;

export const ReceiptInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #666;
  min-width: 0;

  strong {
    color: #333;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    width: 100%;
    
    strong {
      font-size: 14px;
    }
  }
`;

export const ReceiptActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;

  button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
    white-space: nowrap;
    min-height: 40px;

    &:hover {
      background-color: #f0f0f0;
    }

    &:last-child {
      color: #ef4444;
      border-color: #ef4444;

      &:hover {
        background-color: #fee2e2;
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
  }

  @media (max-width: 480px) {
    flex-direction: row;
    width: 100%;
    gap: 8px;
    
    button {
      flex: 1;
      padding: 10px 12px;
      font-size: 12px;
      min-height: 44px;
    }
  }
`;

export const ReceiptEmpty = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;

  p {
    margin: 0;
    font-size: 14px;
  }
`;

export const UploadButton = styled.div`
  display: inline-block;
  padding: 12px 24px;
  background-color: #8b5cf6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  min-height: 48px;
  text-align: center;

  &:hover {
    background-color: #7c3aed;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 14px 16px;
    font-size: 12px;
  }
`;