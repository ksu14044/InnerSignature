import styled from '@emotion/styled';

export const Sidebar = styled.aside`
  width: 232px;
  min-width: 232px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
`;

// 요구사항: 상단 88px은 로고 영역(추후 이미지 삽입)으로 비워둠
export const LogoSpacer = styled.div`
  height: 88px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  justify-content: flex-start;
`;

export const LogoImage = styled.img`
  height: 56px;
  width: auto;
  object-fit: contain;
`;

export const SidebarCompanySelector = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

export const SidebarCompanySelectorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 700;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const SidebarCompanyDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background-color: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
`;

export const SidebarCompanyDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  background-color: ${props => props.selected ? '#f0f0f0' : 'white'};

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const CompanySelector = styled.div`
  position: relative;
  padding: 0 16px 12px;
`;

export const CompanySelectorButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  color: #111827;

  .label {
    font-size: 14px;
  }
`;

export const Chevron = styled.span`
  color: #6b7280;
  font-size: 12px;
`;

export const CompanyName = styled.div`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CompanyDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 16px;
  right: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
`;

export const CompanyDropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 12px;
  background: ${({ selected }) => (selected ? '#f3f4f6' : '#fff')};
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #111827;

  &:hover {
    background: #f9fafb;
  }
`;

export const TopActions = styled.div`
  padding: 0 16px 8px;
  display: flex;
  gap: 10px;
`;

export const ActionIconButton = styled.button`
  position: relative;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;

  img {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

export const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
  border: 2px solid #fff;
`;

export const Menu = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 12px;
`;

export const MenuIcon = styled.span`
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;

  img {
    width: 24px;
    height: 24px;
    display: block;
  }
`;

export const MenuItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #333333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  height: 48px;
  margin: 0 12px 12px;

  &[data-active='true'] {
    background: #d5dce3;
    color: #333333;
    text-decoration: none;
  }

  &:hover {
    background: #d5dce3;
    color: #333333;
    text-decoration: none;
  }
`;

export const SubMenuItem = styled(MenuItem)`
  font-weight: 500;
`;

export const SectionTitle = styled.div`
  margin: 16px 12px 8px;
  font-size: 12px;
  font-weight: 800;
  color: #9ca3af;
`;

export const Divider = styled.div`
  margin: 16px 12px 16px;
  height: 1px;
  background: #e4e4e4;
`;

export const BottomArea = styled.div`
  padding: 12px 16px 16px;
  border-top: 1px solid #f3f4f6;
`;

export const LogoutButton = styled.button`
  width: 100%;
  padding: 12px 12px;
  border: 1px solid #ef4444;
  color: #ef4444;
  background: #fff;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: #fef2f2;
  }
`;

// 모달 스타일(AppHeader에서 가져온 스타일을 그대로 재사용)
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
`;

