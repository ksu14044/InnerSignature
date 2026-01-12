import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background-color: white;
  box-shadow: var(--shadow);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
`;

export const Thead = styled.thead`
  background-color: var(--light-color);

  th {
    padding: 16px 12px;
    border-bottom: 2px solid var(--border-color);
    color: var(--dark-color);
    font-weight: 600;
    font-size: 14px;
    text-align: center;
  }

  th:nth-of-type(2) {
    max-width: 300px;

    @media (max-width: 1024px) {
      max-width: 200px;
    }

    @media (max-width: 768px) {
      max-width: 150px;
    }
  }
`;

export const Tr = styled.tr`
  &:hover {
    background-color: rgba(0, 123, 255, 0.02);
  }

  td {
    padding: 16px 12px;
    border-bottom: 1px solid var(--border-color);
    color: var(--dark-color);
    text-align: center;
    vertical-align: middle;
  }
`;

export const AmountTh = styled.th`
  font-weight: 600;
`;

export const AmountTd = styled.td`
  font-weight: 600;
  color: var(--primary-color);
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 600;
  transition: all 0.2s;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  &:hover {
    color: var(--primary-hover);
    text-decoration: underline;
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;

  ${props => {
    switch (props.status) {
      case 'APPROVED':
        return `
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        `;
      case 'REJECTED':
        return `
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        `;
      case 'PAID':
        return `
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        `;
      default:
        return `
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        `;
    }
  }}
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

export const ViewButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 40px;
  min-width: 40px;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    flex: 1;
    min-width: 0;
    padding: 10px 8px;
    font-size: 11px;

    span {
      display: none;
    }
  }
`;

export const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 40px;
  min-width: 40px;

  &:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    flex: 1;
    min-width: 0;
    padding: 10px 8px;
    font-size: 11px;

    span {
      display: none;
    }
  }
`;
