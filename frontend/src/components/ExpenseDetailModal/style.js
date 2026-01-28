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
  max-width: 800px;
  max-height: 90vh;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    max-width: 95vw;
    border-radius: 12px;
    max-height: 95vh;
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
  display: flex;
  align-items: center;
  justify-content: center;
  
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
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  margin-top: 16px;
  
  @media (max-width: 480px) {
    padding: 16px 20px;
    flex-direction: column-reverse;
  }
`;

export const CancelButton = styled.button`
  padding: 12px 24px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 14px;
  }
`;

export const SaveButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 14px;
  }
`;















