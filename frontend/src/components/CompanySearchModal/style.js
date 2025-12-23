import styled from '@emotion/styled';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    max-width: 95vw;
    border-radius: 12px;
    max-height: 90vh;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    padding: 20px 20px 0 20px;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

export const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
  overflow-y: auto;
  flex: 1;
  
  @media (max-width: 480px) {
    padding: 0 20px 20px 20px;
  }
`;

export const SearchSection = styled.div`
  margin-bottom: 24px;
`;

export const SearchInputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

export const SearchButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ResultsSection = styled.div`
  min-height: 200px;
`;

export const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CompanyItem = styled.div`
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  
  &:hover {
    border-color: #007bff;
    background-color: #f8f9ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  }
`;

export const CompanyInfo = styled.div`
  flex: 1;
`;

export const CompanyName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
`;

export const CompanyDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DetailItem = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
`;

