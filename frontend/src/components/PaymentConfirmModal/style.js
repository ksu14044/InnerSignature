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
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    max-width: 95vw;
    border-radius: 4px;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    padding: 20px 20px 0 20px;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  line-height: 18px;
  
  @media (max-width: 480px) {
    font-size: 18px;
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

export const PlanInfoBox = styled.div`
  background-color: #f9fcff;
  border: 1px solid #489bff;
  border-radius: 4px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  
  @media (max-width: 480px) {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }
`;

export const PlanInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PlanName = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 16px 0;
  line-height: 21.6px;
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
`;

export const PriceAmount = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #489bff;
  line-height: 48px;
`;

export const PriceUnit = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  line-height: 16.8px;
`;

export const TaxIncluded = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  line-height: 22.4px;
  margin-bottom: 0;
`;

export const FeaturesGrid = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0;
  }
`;

export const FeaturesColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const FeatureText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  line-height: 16.8px;
  margin-bottom: 11px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const NoticeBox = styled.div`
  margin-bottom: 24px;
`;

export const NoticeTitle = styled.div`
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 16.8px;
`;

export const NoticeText = styled.div`
  font-size: 14px;
  font-weight: 350;
  color: #666666;
  line-height: 22.4px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const CancelButton = styled.button`
  width: 60px;
  height: 36px;
  padding: 0;
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  line-height: 22.5px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ConfirmButton = styled.button`
  width: 88px;
  height: 36px;
  padding: 0;
  background-color: #489bff;
  color: #ffffff;
  border: 1px solid #489bff;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  line-height: 22.5px;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 8px;
  
  &:hover:not(:disabled) {
    background-color: #3a8ae6;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    margin-left: 0;
    width: 100%;
  }
`;

