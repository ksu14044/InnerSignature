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
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    max-width: 95vw;
    border-radius: 12px;
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
  
  &:hover:not(:disabled) {
    background-color: #f0f0f0;
    color: #333;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
  
  @media (max-width: 480px) {
    padding: 0 20px 20px 20px;
  }
`;

export const PlanInfo = styled.div`
  margin-bottom: 24px;
`;

export const PlanName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

export const PriceSection = styled.div`
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

export const PriceLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

export const PriceAmount = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #007bff;
`;

export const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 14px;
  
  svg {
    color: #28a745;
    font-size: 16px;
  }
`;

export const NoticeBox = styled.div`
  background-color: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

export const NoticeTitle = styled.div`
  font-weight: 600;
  color: #004085;
  margin-bottom: 8px;
  font-size: 14px;
`;

export const NoticeText = styled.div`
  font-size: 13px;
  color: #004085;
  line-height: 1.6;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #5a6268;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ConfirmButton = styled(CancelButton)`
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

