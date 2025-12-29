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

export const Button = styled.button`
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--primary-hover);
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
  }
`;

export const CloseSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const ListSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 16px 0;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const CloseForm = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
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

export const CloseButton = styled.button`
  padding: 10px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const MonthList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MonthItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 2px solid ${props => props.closed ? 'var(--success-color)' : 'var(--border-color)'};
  border-radius: 8px;
  background-color: ${props => props.closed ? 'rgba(40, 167, 69, 0.05)' : 'white'};
  transition: all 0.2s;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const MonthInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const MonthLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const ClosingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--secondary-color);
  
  @media (max-width: 480px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export const MonthActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${props => props.closed ? 'var(--success-color)' : 'var(--light-color)'};
  color: ${props => props.closed ? 'white' : 'var(--dark-color)'};
`;

export const ReopenButton = styled.button`
  padding: 6px 16px;
  background-color: var(--warning-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #e0a800;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Alert = styled.div`
  padding: 16px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
`;

