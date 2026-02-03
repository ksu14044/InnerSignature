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
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

export const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
  
  @media (max-width: 480px) {
    padding: 0 20px 20px 20px;
  }
`;

export const InputGroup = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }
`;

export const Input = styled.input`
  width: 100%;
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

export const PaymentSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

export const PaymentTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

export const PaymentButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #5a6268;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
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

export const SubmitButton = styled(CancelButton)`
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

export const InfoText = styled.div`
  padding: 12px;
  background-color: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  color: #004085;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

export const InputWithButton = styled.div`
  display: flex;
  gap: 8px;
  
  ${Input} {
    flex: 1;
  }
`;

export const CheckButton = styled.button`
  padding: 12px 20px;
  background-color: ${props => {
    if (props.status === 'available') return '#28a745';
    if (props.status === 'duplicate') return '#dc3545';
    return '#6c757d';
  }};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 13px;
  color: ${props => props.status === 'success' ? '#28a745' : '#dc3545'};
  font-weight: 500;
`;
