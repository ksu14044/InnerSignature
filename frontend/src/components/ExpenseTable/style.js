import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  background-color: white;
  box-shadow: none;
  margin-bottom: 24px;
  padding: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0;
  background-color: transparent;
  
  tbody tr {
    margin-bottom: 0;
  }
`;

export const Thead = styled.thead`
  background-color: #f8f9fa;

  th {
    padding: 12px 24px;
    border-bottom: 1px solid #e4e4e4;
    color: #333333;
    font-weight: 500;
    font-size: 14px;
    line-height: 16.8px;
    text-align: left;
  }

  th:first-of-type {
    padding-left: 24px;
  }

  th:last-of-type {
    padding-right: 24px;
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
  background-color: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #489bff;
  }

  ${props => props.selected && `
    border-color: #489bff;
  `}

  td {
    padding: 16px 24px;
    border-bottom: none;
    color: #666666;
    text-align: left;
    vertical-align: middle;
    font-size: 16px;
    line-height: 19.2px;
    font-weight: 400;
  }

  td:first-of-type {
    padding-left: 24px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  td:last-of-type {
    padding-right: 24px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &:not(:last-child) {
    margin-bottom: 0;
  }
`;


export const AmountTh = styled.th`
  font-weight: 500;
  text-align: right !important;
`;

export const AmountTd = styled.td`
  font-weight: 500;
  color: #666666;
  text-align: right !important;
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
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  text-transform: none;

  ${props => {
    switch (props.status) {
      case 'DRAFT':
        return `
          background-color: #f3f3f3;
          color: #666666;
        `;
      case 'APPROVED':
        return `
          background-color: #edfff6;
          color: #14804a;
        `;
      case 'REJECTED':
        return `
          background-color: #ffefef;
          color: #d72d30;
        `;
      case 'PAID':
        return `
          background-color: #edfff6;
          color: #14804a;
        `;
      case 'WAIT':
        return `
          background-color: #fff8de;
          color: #ff8307;
        `;
      default:
        return `
          background-color: #fff8de;
          color: #ff8307;
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
