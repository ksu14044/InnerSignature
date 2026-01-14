import styled from '@emotion/styled';

export const AppBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  @media (min-width: 481px) {
    display: none;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:active {
    background-color: #f0f0f0;
  }
`;

export const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:active {
    background-color: #f0f0f0;
  }
`;

// 알림 컨테이너
export const NotificationContainer = styled.div`
  position: relative;
  margin-right: 4px;
`;

// 알림 배지 스타일
export const NotificationBadge = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: 16px;

  &:active {
    background-color: var(--primary-hover);
    transform: scale(0.95);
  }
`;

export const NotificationCount = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--danger-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid white;
  min-width: 18px;
  padding: 0 2px;
`;

// 알림 드롭다운
export const NotificationDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 240px;
  max-width: 320px;
  z-index: var(--z-dropdown);
  overflow: hidden;
`;

export const NotificationDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background-color: var(--bg-hover);
  }
  
  &:active {
    background-color: var(--border-light);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-light);
  }
`;

export const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
`;

export const NotificationText = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NotificationTitle = styled.div`
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 2px;
`;

export const NotificationSubtitle = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

export const CompanySelector = styled.div`
  position: relative;
  margin-right: 4px;
`;

export const CompanyButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #28a745;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:active {
    background-color: rgba(40, 167, 69, 0.1);
  }
`;

export const CompanyDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  max-width: 250px;
  z-index: 1001;
  overflow: hidden;
`;

export const CompanyDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    background-color: #e0e0e0;
  }

  ${props => props.selected && `
    background-color: rgba(0, 123, 255, 0.1);
    font-weight: 600;
    color: #007bff;
  `}

  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

// 알림 모달 (PC 버전 스타일 복사)
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
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;

  span {
    display: block;
  }
`;

