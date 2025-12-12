import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  background-color: white;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
`;

export const TitleInfo = styled.div`
  h1 {
    margin: 0 0 15px 0;
    font-size: 28px;
    letter-spacing: -1px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    margin: 5px 0;
    color: #666;
    font-size: 14px;
    strong { color: #333; }
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
`;

// 도장 박스 하나
export const StampBox = styled.div`
  border: 1px solid #aaa;
  width: 90px;
  text-align: center;
  background-color: white;
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
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 10px;
  border-left: 4px solid #333;
  padding-left: 10px;
`;

export const TotalAmount = styled.div`
  text-align: right;
  font-size: 18px;
  margin-bottom: 20px;
  
  span {
    font-weight: bold;
    font-size: 24px;
    text-decoration: underline;
    margin-left: 10px;
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
  }
  td {
    border: 1px solid #ddd;
    padding: 10px;
    font-size: 13px;
  }
`;

export const ButtonGroup = styled.div`
  text-align: center;
  margin-top: 40px;
  
  button {
    padding: 12px 24px;
    margin: 0 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background 0.2s;
    
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

    &:hover {
      color: #374151;
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
`;

// 영수증 섹션
export const ReceiptSection = styled.div`
  margin-top: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

export const ReceiptSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

  strong {
    color: #333;
    font-size: 16px;
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

  &:hover {
    background-color: #7c3aed;
  }
`;