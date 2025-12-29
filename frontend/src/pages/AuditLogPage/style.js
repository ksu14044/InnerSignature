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

export const Input = styled.input`
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

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

export const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const LogCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  border-left: 4px solid ${props => props.resolved ? '#6c757d' : '#ffc107'};
  opacity: ${props => props.resolved ? 0.7 : 1};
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const LogInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const SeverityBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.color}20;
  color: ${props => props.color};
  border: 1px solid ${props => props.color};
`;

export const RuleName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const ResolvedBadge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #d4edda;
  color: #155724;
`;

export const ResolveButton = styled.button`
  padding: 6px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: #218838;
  }
`;

export const LogMessage = styled.div`
  font-size: 14px;
  color: var(--dark-color);
  margin-bottom: 12px;
  padding: 12px;
  background-color: var(--light-color);
  border-radius: 8px;
`;

export const LogDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
`;

export const DetailItem = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
`;

export const DetailLabel = styled.span`
  font-weight: 600;
  color: var(--secondary-color);
`;

export const DetailValue = styled.span`
  color: var(--dark-color);
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--secondary-color);
  font-size: 16px;
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
`;

export const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  color: var(--dark-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PaginationInfo = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
  font-weight: 500;
`;

export const Alert = styled.div`
  padding: 16px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
`;

