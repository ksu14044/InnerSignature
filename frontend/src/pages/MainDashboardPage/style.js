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

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const WelcomeText = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
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
  min-height: 48px;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    margin-right: 8px;
  }

  @media (max-width: 480px) {
    width: 100%;
    margin-right: 0;
    justify-content: center;
    
    span {
      display: none;
    }
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
  min-height: 48px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    margin-right: 8px;
  }

  @media (max-width: 480px) {
    width: 100%;
    margin-right: 0;
    justify-content: center;
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
  min-height: 48px;

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
    margin-right: 0;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 12px;
    
    span {
      display: none;
    }
  }
`;

export const CompanySelector = styled.div`
  position: relative;
  margin-right: 12px;
`;

export const CompanySelectorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  min-height: 48px;
  
  &:hover {
    background-color: #218838;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
    font-size: 12px;
    
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: calc(100% - 40px);
    }
  }
`;

export const CompanyDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 100%;
    left: 0;
    right: 0;
  }
`;

export const CompanyDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  background-color: ${props => props.selected ? '#f0f0f0' : 'white'};

  &:hover {
    background-color: #f5f5f5;
  }

  &:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-of-type {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

export const ManagementDropdown = styled.div`
  position: relative;
  margin-right: 12px;
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const ManagementButton = styled.button`
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
  min-height: 48px;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

export const ManagementMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid var(--border-color);
  
  @media (max-width: 480px) {
    right: auto;
    left: 0;
    width: 100%;
    min-width: auto;
  }
`;

export const ManagementMenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--dark-color);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: var(--light-color);
    color: var(--primary-color);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
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
  min-height: 48px;

  &:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    
    span {
      display: none;
    }
  }
`;

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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 6px;
  }
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    gap: 2px;
  }
`;

export const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  padding: 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }

  @media (max-width: 480px) {
    margin: 8px;
    padding: 12px;
    border-radius: 8px;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;

  @media (max-width: 480px) {
    width: 100%;
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
  min-height: 48px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  @media (max-width: 480px) {
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 8px;
    margin-bottom: 24px;
  }
`;

export const StatCard = styled.div`
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  border-left: 4px solid ${props => {
    switch(props.status) {
      case 'wait': return 'var(--warning-color)';
      case 'rejected': return 'var(--danger-color)';
      case 'approved': return '#17a2b8';
      case 'paid': return 'var(--success-color)';
      default: return 'var(--primary-color)';
    }
  }};
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  ${props => props.selected && `
    background-color: rgba(0, 123, 255, 0.05);
    border-left-width: 6px;
  `}
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
    border-left-width: ${props => props.selected ? '6px' : '6px'};
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  margin-bottom: 8px;
  font-weight: 500;
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const ActionSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-sm);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
    margin: var(--spacing-sm);
    margin-top: var(--spacing-lg);
  }
`;

export const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: ${props => props.variant === 'secondary' ? 'white' : 'var(--primary-color)'};
  color: ${props => props.variant === 'secondary' ? 'var(--text-primary)' : 'white'};
  border: ${props => props.variant === 'secondary' ? '2px solid var(--border-color)' : 'none'};
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 120px;
  box-shadow: var(--shadow-sm);
  
  svg {
    font-size: 32px;
    margin-bottom: var(--spacing-xs);
  }
  
  span {
    font-size: var(--font-size-base);
    text-align: center;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.variant === 'secondary' ? 'var(--bg-hover)' : 'var(--primary-hover)'};
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: ${props => props.variant === 'secondary' ? 'var(--primary-color)' : 'transparent'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    min-height: 100px;
    padding: var(--spacing-md);
    
    svg {
      font-size: 28px;
    }
    
    span {
      font-size: var(--font-size-sm);
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    min-height: 80px;
    padding: var(--spacing-md);
    flex-direction: row;
    justify-content: flex-start;
    
    svg {
      font-size: 24px;
      margin-bottom: 0;
      margin-right: var(--spacing-sm);
    }
    
    span {
      font-size: var(--font-size-base);
      text-align: left;
    }
  }
`;

export const Alert = styled.div`
  padding: 16px;
  background: #fff3cd;
  border: 1px solid var(--warning-color);
  border-radius: 8px;
  color: #856404;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    margin: 8px;
    padding: 12px;
    font-size: 14px;
  }
`;

export const Button = styled.button`
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  min-height: 48px;
  
  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
  }
`;

export const StatusExpenseSection = styled.div`
  margin-top: 32px;
  margin-bottom: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 24px;
  border: 1px solid var(--border-color);

  @media (max-width: 480px) {
    margin: 16px 8px;
    padding: 16px;
    border-radius: 8px;
  }
`;

export const StatusExpenseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color);

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const StatusExpenseTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--dark-color);

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const ViewAllButton = styled.button`
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 10px 16px;
  }
`;

export const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: var(--secondary-color);
  font-size: 16px;
`;

export const EmptyMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: var(--secondary-color);
  font-size: 16px;
`;

export const ExpenseListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ExpenseListItem = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
  overflow: hidden;
  position: relative;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
    transform: translateY(-1px);
  }
`;

export const ExpenseListItemLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  text-decoration: none;
  color: inherit;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const ExpenseListItemDate = styled.div`
  min-width: 100px;
  font-weight: 600;
  color: var(--dark-color);
  font-size: 14px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

export const ExpenseListItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const ExpenseListItemTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ExpenseListItemMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--secondary-color);

  span:last-child {
    font-weight: 600;
    color: var(--primary-color);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 4px;
  }
`;

export const ExpenseListItemAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--primary-color);
  font-size: 18px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: absolute;
    top: 16px;
    right: 16px;
  }
`;

export const SecretBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`;

export const ViewMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  background-color: var(--light-color);
  color: var(--dark-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e7eb;
    border-color: var(--primary-color);
  }
`;

export const TabSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--border-color);
  padding: 0 20px;

  @media (max-width: 480px) {
    margin: 8px;
    padding: 0;
  }
`;

export const TabButton = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--secondary-color)'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

export const InfoCardsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    margin: 8px;
    margin-bottom: 24px;
    gap: 12px;
  }
`;

export const SubscriptionCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

export const SubscriptionCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const SubscriptionCardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary-color);
`;

export const SubscriptionStatusBadge = styled.span`
  padding: 4px 12px;
  background-color: ${props => props.status === 'ACTIVE' ? '#28a745' : '#6c757d'};
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

export const SubscriptionPlanName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 12px;
`;

export const SubscriptionExpiry = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--secondary-color);
  margin-bottom: 12px;
`;

export const SubscriptionExpiryLabel = styled.span`
  font-weight: 500;
`;

export const SubscriptionExpiryDate = styled.span`
  font-weight: 600;
  color: var(--dark-color);
`;

export const SubscriptionExpiryWarning = styled.span`
  color: ${props => props.danger ? '#dc3545' : '#ffc107'};
  font-weight: 600;
  font-size: 12px;
`;

export const SubscriptionExpiryInfo = styled.span`
  color: var(--secondary-color);
  font-size: 12px;
`;

export const SubscriptionCardFooter = styled.div`
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
  text-align: right;
  margin-top: 12px;
`;

export const CreditCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s;
  color: white;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

export const CreditCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const CreditCardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

export const CreditAmount = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
`;

export const CreditCardFooter = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-align: right;
`;