import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 40px;
  min-height: 100vh;
  background: #f8f9fa;

  @media (max-width: 768px) {
    padding: 16px 16px 16px 40px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 80px;
    padding-left: 40px;
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
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  box-shadow: none;

  @media (max-width: 480px) {
    margin: 0 0 20px 0;
    padding: 16px;
    border-radius: 4px;
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
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;

  svg {
    color: var(--primary-color);
    font-size: 16px;
  }
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

export const QuickFilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const QuickButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: ${props => props.variant === 'secondary' ? '#f8f9fa' : 'white'};
  color: ${props => props.variant === 'secondary' ? 'var(--dark-color)' : 'var(--primary-color)'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#e9ecef' : 'var(--primary-color)'};
    color: ${props => props.variant === 'secondary' ? 'var(--dark-color)' : 'white'};
    border-color: var(--primary-color);
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

export const PeriodTabs = styled.div`
  display: flex;
  gap: 2px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  width: 100%;
`;

export const PeriodTab = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
    color: ${props => props.active ? '#3b82f6' : '#374151'};
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 12px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin: 0 0 24px 0;
  }
`;

export const StatCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 4px;
  box-shadow: none;
  border: 1px solid #e4e4e4;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 120px;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  ${props => props.selected && `
    background-color: #ffffff;
    border-color: #489bff;
    box-shadow: 0 0 0 1px #489bff;
  `}

  &:hover {
    border-color: ${props => {
      if (props.selected) return '#489bff';
      switch(props.status) {
        case 'wait': return '#ffa310';
        case 'rejected': return '#d72d30';
        case 'approved': return '#14804a';
        default: return '#489bff';
      }
    }};
  }

  @media (max-width: 480px) {
    padding: 16px;
    min-height: 100px;
  }
`;

export const StatLabel = styled.div`
  font-size: 16px;
  color: #333333;
  margin-bottom: 8px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
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
  margin-top: 24px;
  margin-bottom: 24px;
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 24px;

  @media (max-width: 480px) {
    margin: 16px 0;
    padding: 16px;
  }
`;

export const StatusExpenseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const StatusExpenseTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0;
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
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
  border: 1px solid #e5e7eb;

  &::after {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-radius: 50%;
    border-top-color: #9ca3af;
    animation: spin 1s ease-in-out infinite;
    margin-left: 8px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
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
  margin-bottom: 40px;

  @media (max-width: 480px) {
    margin: 0 0 32px 0;
  }
`;

export const SubscriptionCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-color: #d1d5db;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 6px;
  }
`;

export const SubscriptionCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const SubscriptionCardTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SubscriptionStatusBadge = styled.span`
  padding: 6px 12px;
  background-color: ${props => props.status === 'ACTIVE' ? '#10b981' : '#6b7280'};
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;


export const SubscriptionCardFooter = styled.div`
  font-size: 14px;
  color: #3b82f6;
  font-weight: 600;
  text-align: right;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

export const SubscriptionInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

export const SubscriptionInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    border-color: #e5e7eb;
  }
`;

export const InfoItemIcon = styled.div`
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  flex-shrink: 0;
`;

export const InfoItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const InfoItemValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
`;

export const InfoItemLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
`;

export const MonthNavigator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  @media (max-width: 480px) {
    gap: 12px;
    padding: 10px;
  }
`;

export const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;

  &:hover {
    background: var(--primary-color);
    color: white;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

export const CurrentMonth = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  min-width: 120px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 16px;
    min-width: 100px;
  }
`;

export const QuickMonthButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

// 피그마 디자인 기반 헤더 스타일
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }
`;

export const PageHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  margin: 0;
`;

export const PageHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: auto;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
    gap: 8px;
    margin-left: 0;
  }
`;

export const ListButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
    border-color: #489bff;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #489bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #3a8ae6;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

export const DashboardNotificationContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DashboardNotificationIconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DashboardNotificationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const DashboardNotificationBadge = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DashboardProfileIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #d9d9d9;
`;

export const DashboardNotificationBadgeCount = styled.span`
  position: absolute;
  top: -1px;
  right: -1px;
  background-color: #d72d30;
  color: #ffffff;
  border-radius: 9px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 400;
  min-width: 22px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 회사 이름 표시 (드롭다운 제거)
export const DashboardCompanyName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #333333;
`;

// 액션 버튼 섹션 (DashboardHeader 아래)
export const DashboardActionSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: white;
  border-radius: 4px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
  }
`;

// 최근 작성한 지출결의서 섹션
export const RecentExpenseSection = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 24px;

  @media (max-width: 480px) {
    margin: 16px 0;
    padding: 16px;
  }
`;

export const RecentExpenseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const RecentExpenseTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0;
`;

export const ViewAllLink = styled(Link)`
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background-color: #ffffff;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }
`;

export const RecentExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const RecentExpenseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #ffffff;
  border: 1px solid ${props => props.selected ? '#489bff' : '#e4e4e4'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #489bff;
    box-shadow: 0 2px 8px rgba(72, 155, 255, 0.1);
  }
`;

export const RecentExpenseDate = styled.div`
  min-width: 100px;
  font-size: 16px;
  font-weight: 400;
  color: #666666;
`;

export const RecentExpenseContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const RecentExpenseDescription = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RecentExpenseMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 16px;
  color: #666666;

  span:last-child {
    font-weight: 500;
    color: #555555;
  }
`;

export const StatBadge = styled.span`
  padding: 4px 12px;
  background-color: ${props => {
    switch(props.status) {
      case 'approved': return '#edfff6';
      case 'wait': return '#fff7d7';
      case 'rejected': return '#ffefef';
      default: return '#ebf4ff';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'approved': return '#14804a';
      case 'wait': return '#ffa310';
      case 'rejected': return '#d72d30';
      default: return '#489bff';
    }
  }};
  border-radius: 6px;
  font-size: 16px;
  font-weight: 400;
`;

export const ChevronIcon = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #666666;
  font-size: 24px;
  opacity: 0.7;
`;

export const StatusBadge = styled.span`
  padding: 4px 8px;
  background-color: ${props => {
    switch(props.status) {
      case 'approved': return '#edfff6';
      case 'wait': return '#fff7d7';
      case 'rejected': return '#ffefef';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'approved': return '#14804a';
      case 'wait': return '#ffa310';
      case 'rejected': return '#d72d30';
      default: return '#666666';
    }
  }};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
`;