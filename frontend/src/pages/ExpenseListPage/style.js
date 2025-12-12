import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
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

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const WelcomeText = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

export const NotificationBadge = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 12px;
  transition: all 0.2s;
  font-size: 18px;

  &:hover {
    background-color: #ff5252;
    transform: scale(1.1);
  }
`;

export const NotificationCount = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ff1744;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  border: 2px solid white;
`;

export const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 12px;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    margin-right: 8px;
  }
`;

export const AdminButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 12px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    margin-right: 8px;
  }
`;

export const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FilterContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const FilterTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const StatusCheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--light-color);
`;

export const StatusCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--dark-color);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background-color: rgba(0, 123, 255, 0.05);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--primary-color);
  }

  span {
    font-weight: 500;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const FilterButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-right: 12px;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background-color: var(--primary-color);
        color: white;

        &:hover {
          background-color: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background-color: var(--light-color);
        color: var(--dark-color);
        border: 1px solid var(--border-color);

        &:hover {
          background-color: #e5e7eb;
          border-color: var(--secondary-color);
        }
      `;
    }
  }}

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 20px;
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 16px 20px;
  }
`;

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
    text-align: left;
    
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

export const TitleTd = styled.td`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left !important;
  
  @media (max-width: 1024px) {
    max-width: 200px;
  }
  
  @media (max-width: 768px) {
    max-width: 150px;
  }
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

  &:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
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

  &:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }
`;

// 모바일 카드 뷰
export const MobileCardContainer = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }

  > * + * {
    margin-top: 16px;
  }
`;

export const ExpenseCard = styled.div`
  background-color: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  overflow: hidden;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--light-color);
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  flex: 1;
  margin-right: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

export const CardContent = styled.div`
  padding: 20px;
`;

export const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

export const CardLabel = styled.span`
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 14px;
`;

export const CardValue = styled.span`
  color: var(--dark-color);
  font-weight: 500;
`;

export const CardActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
  background-color: var(--light-color);
`;

// 알람 모달
export const NotificationModal = styled.div`
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
`;

export const NotificationModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const NotificationModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
  }

  button {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: #374151;
      background-color: #e5e7eb;
    }
  }
`;

export const NotificationModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;

  p {
    margin: 0;
    color: #6b7280;
    text-align: center;
    padding: 40px 20px;
  }
`;

export const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NotificationItem = styled.div`
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;

  &:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
`;

export const NotificationItemTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

export const NotificationItemInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;

  span {
    display: flex;
    align-items: center;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

// 페이지네이션 스타일
export const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);

  @media (max-width: 768px) {
    margin: 24px 0;
    padding: 20px;
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  font-weight: 500;
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--dark-color)'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.disabled ? '0.5' : '1'};

  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--light-color)'};
    border-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--primary-color)'};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    padding: 6px 10px;
    font-size: 13px;
  }
`;