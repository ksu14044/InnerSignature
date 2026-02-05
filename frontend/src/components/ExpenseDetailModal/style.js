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
  max-width: 744px;
  max-height: 90vh;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    max-width: 95vw;
    border-radius: 4px;
    max-height: 95vh;
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

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  grid-column: ${props => props.fullWidth ? '1 / -1' : 'auto'};
`;

export const Label = styled.label`
  font-weight: 500;
  font-size: 14px;
  color: #333333;
  margin-bottom: 8px;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  color: #333333;
  transition: border-color 0.2s;
  font-family: 'Noto Sans KR', sans-serif;
  height: 36px;
  box-sizing: border-box;
  
  &::placeholder {
    color: #777777;
  }
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
  
  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
  
  &[type="date"] {
    padding-right: 12px;
  }
`;

export const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  background-color: white;
  color: #333333;
  cursor: pointer;
  transition: border-color 0.2s;
  font-family: 'Noto Sans KR', sans-serif;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
  height: 36px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
  
  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
  
  option {
    color: #333333;
  }
`;

export const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  resize: vertical;
  transition: border-color 0.2s;
  min-height: 80px;
  color: #333333;
  
  &::placeholder {
    color: #777777;
  }
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 0 24px;
  margin-top: 16px;
  
  @media (max-width: 480px) {
    padding: 16px 20px 0 20px;
    flex-direction: column-reverse;
  }
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

export const SaveButton = styled.button`
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

export const ReceiptContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ReceiptItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  background-color: white;
`;

export const ReceiptFileName = styled.span`
  font-size: 15px;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
  flex: 1;
`;

export const ReceiptDeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  &:hover {
    opacity: 0.7;
  }
`;

export const ReceiptPlaceholder = styled.div`
  padding: 8px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  background-color: white;
  font-size: 15px;
  color: #777777;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ReceiptAttachButton = styled.button`
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
  align-self: flex-end;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;
