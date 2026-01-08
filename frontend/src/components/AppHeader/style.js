import styled from '@emotion/styled';

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

// 모달 관련 스타일
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


