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
  max-width: 700px;
  max-height: 85vh;
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

export const SelectedApproversBox = styled.div`
  background-color: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

export const SelectedTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #004085;
  margin-bottom: 12px;
`;

export const SelectedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background-color: white;
  border-radius: 6px;
`;

export const OrderBadge = styled.span`
  display: ${props => props.inline ? 'inline-block' : 'flex'};
  align-items: center;
  justify-content: center;
  min-width: ${props => props.inline ? 'auto' : '28px'};
  height: ${props => props.inline ? 'auto' : '28px'};
  background-color: #007bff;
  color: white;
  border-radius: ${props => props.inline ? '4px' : '50%'};
  font-size: ${props => props.inline ? '12px' : '14px'};
  font-weight: 600;
  padding: ${props => props.inline ? '2px 6px' : '0'};
  margin-left: ${props => props.inline ? '8px' : '0'};
`;

export const SelectedName = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  flex: 1;
`;

export const SelectedPosition = styled.span`
  font-size: 14px;
  color: #666;
`;

export const ApproverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const ApproverCheckbox = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid ${props => props.isSelected ? '#007bff' : '#e0e0e0'};
  border-radius: 10px;
  background-color: ${props => props.isSelected ? '#f0f7ff' : 'white'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #007bff;
    background-color: rgba(0, 123, 255, 0.05);
  }

  input[type="checkbox"] {
    margin-right: 12px;
    width: 18px;
    height: 18px;
    accent-color: #007bff;
    cursor: pointer;
  }

  label {
    cursor: pointer;
    margin: 0;
    flex: 1;
  }
`;

export const ApproverInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ApproverName = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
`;

export const ApproverPosition = styled.span`
  font-size: 14px;
  color: #666;
`;

export const LoadingMessage = styled.p`
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

export const InfoMessage = styled.div`
  padding: 20px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  margin-top: 16px;
`;

export const ConfirmButton = styled.button`
  padding: 12px 32px;
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

