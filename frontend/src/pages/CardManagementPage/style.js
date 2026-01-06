import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 64px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 480px) {
    padding: 0 16px;
    margin-bottom: 20px;
  }
`;

export const HeaderLeft = styled.div`
  flex: 1;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #5a6268;
  }
`;

export const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;

  @media (max-width: 480px) {
    padding: 0 16px;
  }
`;

export const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? '#007bff' : '#666'};
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.5' : '1'};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    color: #007bff;
    background-color: #f8f9fa;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

export const InfoMessage = styled.div`
  padding: 16px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin: 0 16px 20px;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    padding: 0 16px;
    margin-bottom: 16px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 12px;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    padding: 0 16px;
    gap: 12px;
  }
`;

export const CardItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
`;

export const CardName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DefaultBadge = styled.span`
  background-color: #28a745;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

export const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e7f3ff;
  }
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ffe7e7;
  }
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CardNumber = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #007bff;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
`;

export const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #666;
`;

export const CardInfoItem = styled.div`
  display: flex;
  gap: 8px;

  strong {
    color: #333;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    margin: 0 16px;
    padding: 40px 20px;
  }
`;

export const EmptyText = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin: 0;
`;

// 모달 스타일
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 12px 12px 0 0;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

export const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

export const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

export const HelpText = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
`;

export const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a6268;
  }
`;

export const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

