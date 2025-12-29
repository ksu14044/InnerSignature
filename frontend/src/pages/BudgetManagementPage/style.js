import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
  }
`;

export const Button = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.variant === 'secondary' ? 'var(--secondary-color)' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#6c757d' : 'var(--primary-hover)'};
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

export const FilterCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--dark-color);
`;

export const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const BudgetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BudgetCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const BudgetTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const IconButton = styled.button`
  padding: 8px;
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

export const BudgetInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const InfoLabel = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
`;

export const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--light-color);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  transition: width 0.3s ease;
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--secondary-color);
  font-size: 16px;
`;

export const ModalOverlay = styled.div`
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
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--dark-color);
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--dark-color);
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
`;

export const Alert = styled.div`
  padding: 16px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
`;

