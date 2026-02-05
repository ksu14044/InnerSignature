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
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    max-width: 95vw;
    border-radius: 4px;
    max-height: 90vh;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px 24px;
  
  @media (max-width: 480px) {
    padding: 20px 20px 16px 20px;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #333333;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
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

export const SelectedApproversBox = styled.div`
  margin-bottom: 20px;
`;

export const SelectedTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333333;
  margin-bottom: 12px;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const SelectedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #666666;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: white;
`;

export const OrderBadge = styled.span`
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  align-items: center;
  justify-content: center;
  min-width: ${props => props.inline ? '41px' : 'auto'};
  height: ${props => props.inline ? '18px' : 'auto'};
  background-color: ${props => props.inline ? '#ebf4ff' : '#489bff'};
  color: ${props => props.inline ? '#489bff' : 'white'};
  border-radius: ${props => props.inline ? '20px' : '4px'};
  font-size: ${props => props.inline ? '12px' : '14px'};
  font-weight: ${props => props.inline ? '400' : '600'};
  padding: ${props => props.inline ? '0 8px' : '0'};
  margin-left: ${props => props.inline ? '0' : '0'};
  margin-right: ${props => props.inline ? '8px' : '0'};
  font-family: 'Noto Sans KR', sans-serif;
  line-height: ${props => props.inline ? '12px' : 'normal'};
`;

export const SelectedName = styled.span`
  font-weight: 500;
  font-size: 15px;
  color: #333333;
  flex: 1;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const SelectedPosition = styled.span`
  font-size: 14px;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ApproverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 214px);
  gap: 12px;
  margin-bottom: 24px;
  justify-content: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

export const ApproverCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid ${props => props.isSelected ? '#666666' : '#e4e4e4'};
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  min-height: 96px;
  width: 214px;

  &:hover {
    border-color: #666666;
  }

  input[type="checkbox"] {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
    accent-color: #489bff;
    border-radius: 4px;
    border: 1px solid ${props => props.isSelected ? '#489bff' : '#e4e4e4'};
  }

  label {
    cursor: pointer;
    margin: 0;
    flex: 1;
    padding-left: 28px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

export const ApproverInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ApproverName = styled.span`
  font-weight: 500;
  font-size: 15px;
  color: #333333;
  display: flex;
  align-items: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ApproverPosition = styled.span`
  font-size: 14px;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const LoadingMessage = styled.p`
  color: #666666;
  font-style: italic;
  text-align: center;
  padding: 40px;
  font-size: 16px;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const InfoMessage = styled.div`
  padding: 20px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  margin-top: 16px;
`;

export const CancelButton = styled.button`
  padding: 0;
  width: 60px;
  height: 36px;
  background-color: white;
  color: #333333;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Noto Sans KR', sans-serif;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const ConfirmButton = styled.button`
  padding: 0;
  width: 60px;
  height: 36px;
  background-color: ${props => props.disabled ? '#999999' : '#489bff'};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  font-family: 'Noto Sans KR', sans-serif;
  
  &:hover:not(:disabled) {
    background-color: #3a8ae6;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;
