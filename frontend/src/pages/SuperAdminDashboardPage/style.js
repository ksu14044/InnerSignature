import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
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
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 480px) {
    display: none;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
`;

export const WelcomeText = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
`;

export const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
`;

export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  background-color: ${props => props.primary ? 'var(--primary-color)' : props.danger ? '#dc3545' : '#f8f9fa'};
  color: ${props => props.primary || props.danger ? '#fff' : 'var(--dark-color)'};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 13px;
    min-height: 44px;
    justify-content: center;
    
    svg {
      font-size: 16px;
    }
  }
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e9ecef;

  @media (max-width: 480px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 16px;
    padding-bottom: 8px;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 2px;
    }
  }
`;

export const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${props => props.active ? 'var(--primary-color)' : '#666'};
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 12px;
    gap: 4px;
    
    svg {
      font-size: 14px;
    }
  }
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 8px;
    margin-bottom: 16px;
  }
`;

export const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 480px) {
    padding: 16px;
    gap: 12px;
  }
`;

export const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color), #0066cc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const StatSubtext = styled.div`
  font-size: 12px;
  color: #999;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  thead {
    background-color: var(--primary-color);
    color: white;
  }

  th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f8f9fa;
    }
  }

  td {
    padding: 16px;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    thead {
      display: block;
    }
    
    tbody {
      display: block;
    }
    
    tr {
      display: block;
      margin-bottom: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    th {
      display: none;
    }
    
    td {
      display: block;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
      white-space: normal;
      word-break: break-word;
      
      &:before {
        content: attr(data-label);
        font-weight: 600;
        color: #666;
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
`;

export const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.active ? '#155724' : '#721c24'};
`;

export const FilterSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 0;
    box-shadow: none;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  min-width: 150px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: var(--dark-color);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 6px;
    min-width: 100%;
    
    label {
      font-size: 12px;
    }
  }
`;

export const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 14px;
    min-height: 44px;
  }
`;

export const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 14px;
    min-height: 44px;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  span {
    font-size: 14px;
    color: var(--secondary-color);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    margin-top: 16px;
    
    span {
      font-size: 12px;
      text-align: center;
    }
  }
`;

export const SecretBadge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #dc3545;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  vertical-align: middle;
`;

export const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 8px;
  }
`;

